# Voucher & Budgetary Details — API Workflow

End-to-end guide: creating voteheads, drawing a voucher against them, updating/deleting, and generating the PDF. All requests assume `Authorization: Bearer <TOKEN>` and `Content-Type: application/json` headers unless noted.

---

## 1. Create Voteheads

Voteheads are the master budget list — created once, then reused across many vouchers. The frontend fetches this list to populate the dropdown when building a voucher.

**Request**

```
POST /api/voteheads
```

```json
{
  "code": "54.04",
  "name": "Maintenance of buildings Expense",
  "allocation": 1600000
}
```

**Response** `201 Created`

```json
{
  "id": 1,
  "code": "54.04",
  "name": "Maintenance of buildings Expense",
  "allocation": "1600000.00",
  "balAvailable": "1600000.00",
  "createdAt": "2026-08-11T09:00:00.000Z",
  "updatedAt": "2026-08-11T09:00:00.000Z"
}
```

> `balAvailable` starts equal to `allocation`. It only changes as vouchers are created/updated/deleted against this votehead (see §3).

Repeat for every budget line you need, e.g.:

```json
{ "code": "52.01", "name": "Utilities Expense", "allocation": 500000 }
```

---

## 2. List Voteheads (for the frontend dropdown)

**Request**

```
GET /api/voteheads?page=1&pageSize=20
```

`page` and `pageSize` are both optional — defaults are `page=1`, `pageSize=20`, capped at `pageSize=100`. Any invalid/out-of-range value silently falls back to the default rather than erroring.

**Response** `200 OK` — paginated envelope

```json
{
  "page": 1,
  "pageSize": 20,
  "lastPageIs": 1,
  "data": [
    {
      "id": 1,
      "code": "54.04",
      "name": "Maintenance of buildings Expense",
      "allocation": "1600000.00",
      "balAvailable": "1586200.00"
    },
    {
      "id": 2,
      "code": "52.01",
      "name": "Utilities Expense",
      "allocation": "500000.00",
      "balAvailable": "500000.00"
    }
  ]
}
```

Sorted alphabetically by `name`. Use `data[].id` as `voteheadId` when building a voucher's `budgetDetails`.

### Update a votehead (optional/admin)

```
PUT /api/voteheads/:id
```

```json
{ "allocation": 1800000 }
```

Only send the fields you want changed — `code`, `name`, `allocation`, `balAvailable` are all independently optional.

---

## 3. Create a Voucher (drawing against one or more Voteheads)

`budgetDetails` only needs `voteheadId` and `thisPay` per line — the server looks up the votehead's live `balAvailable`, validates there's enough balance, computes `uncommittedBal`, and decrements the votehead's balance, all inside one transaction. If any line has insufficient balance, the **entire voucher creation is rolled back** — nothing is partially saved.

**Request**

```
POST /api/vouchers
```

```json
{
  "date": "2026-08-11",
  "payeeName": "ABC Hardware Ltd",
  "payeeAddress": "P.O. Box 100, Kisii",
  "accountName": "ABC Hardware Ltd",
  "paymentMethod": "CASH",
  "paymentDetails": "13800",
  "lineItems": [
    { "particulars": "Cement and roofing sheets for Block C repair", "kshs": 13800, "cts": 0, "date": "2026-08-11" }
  ],
  "preparedBy": "J. Otieno",
  "preparedDate": "2026-08-11",
  "approvedBy": "M. Wanjiru",
  "approvedDate": "2026-08-11",
  "receivedCashOrCheque": "CASH",
  "receiverIdNo": "12345678",
  "receivedDate": "2026-08-11",
  "authorizedDate": "2026-08-11",
  "budgetDetails": [
    { "voteheadId": 1, "thisPay": 13800 }
  ]
}
```

> Multiple voteheads on one voucher — just add more entries:
> ```json
> "budgetDetails": [
>   { "voteheadId": 1, "thisPay": 10000 },
>   { "voteheadId": 2, "thisPay": 3800 }
> ]
> ```

**Response** `201 Created`

```json
{
  "id": 42,
  "voucherNo": "RTVC/V/0042",
  "date": "2026-08-11",
  "payeeName": "ABC Hardware Ltd",
  "amountInWords": "Kenya Shillings Thirteen Thousand Eight Hundred Only",
  "paymentMethod": "CASH",
  "paymentDetails": "13800",
  "VoucherBudgetLines": [
    {
      "id": 77,
      "voucherId": 42,
      "voteheadId": 1,
      "balBefore": "1600000.00",
      "thisPay": "13800.00",
      "uncommittedBal": "1586200.00",
      "Votehead": {
        "id": 1,
        "name": "Maintenance of buildings Expense",
        "code": "54.04",
        "allocation": "1600000.00",
        "balAvailable": "1586200.00"
      }
    }
  ]
}
```

**Error case — insufficient balance** (voucher is NOT created, votehead balance is untouched):

```json
{ "error": "Insufficient balance on votehead \"Maintenance of buildings Expense\": available 1586200, requested 5000000" }
```

---

## 4. Fetch a Single Voucher

```
GET /api/vouchers/:id
```

Returns the voucher with `VoucherBudgetLines` (and each line's `Votehead`) included — this is what feeds the "Budgetary Details" table on the PDF.

---

## 5. Update a Voucher

- Sending **no** `budgetDetails` key at all → budget lines and votehead balances are left untouched.
- Sending `budgetDetails` → old lines are fully reversed (votehead balances restored) and the new lines are applied fresh, atomically.

**Request — change only payee info, leave budget alone**

```
PUT /api/vouchers/42
```

```json
{ "payeeAddress": "P.O. Box 200, Kisii" }
```

**Request — re-split the budget across a different set of voteheads**

```
PUT /api/vouchers/42
```

```json
{
  "budgetDetails": [
    { "voteheadId": 1, "thisPay": 8000 },
    { "voteheadId": 2, "thisPay": 5800 }
  ]
}
```

---

## 6. Delete a Voucher

```
DELETE /api/vouchers/42
```

Restores every associated votehead's `balAvailable` by the amount that voucher had drawn, then removes the voucher and its budget-line records.

**Response** `200 OK`

```json
{
  "message": "Voucher deleted successfully",
  "deletedVoucher": { "id": 42, "voucherNo": "RTVC/V/0042", "...": "..." }
}
```

---

## 7. Print the Voucher PDF

```
GET /api/vouchers/42/pdf
```

Returns `application/pdf` (inline). The generated document includes, in order:

1. Payee Details
2. Particulars
3. **Budgetary Details** — one row per `VoucherBudgetLines` entry (Votehead name, Allocation, Balance Available, This Pay, Uncommitted Balance), with a totals row
4. Authorisation
5. Expenditure Voteheads
6. Receipt Acknowledgement
7. Principal Authorisation

The endpoint also flips `pdfGenerated: true` on the voucher record after streaming the file.

---

## Pagination — List Endpoints

`GET /api/vouchers` and `GET /api/voteheads` are the two list endpoints, and both return the same paginated envelope shape (TypeScript, as used by the frontend):

```typescript
export type PaginatedResponse<T> = {
    page: number;
    pageSize: number;
    lastPageIs: number;
    data: T[];
};
```

| Query param | Default | Notes |
|---|---|---|
| `page` | `1` | 1-indexed. Invalid/non-integer/less-than-1 values fall back to `1`. |
| `pageSize` | `20` | Invalid values fall back to `20`. Hard-capped at `100` even if a larger value is requested. |

`lastPageIs` is the total number of pages (`Math.ceil(totalCount / pageSize)`), so the frontend can disable "next" once `page === lastPageIs`.

**Example — vouchers, page 2, 10 per page**

```
GET /api/vouchers?page=2&pageSize=10
```

```json
{
  "page": 2,
  "pageSize": 10,
  "lastPageIs": 5,
  "data": [
    { "id": 32, "voucherNo": "RTVC/V/0032", "date": "2026-08-05", "payeeName": "XYZ Supplies", "...": "..." }
  ]
}
```

> Detail/create/update/delete/PDF endpoints (`GET /api/vouchers/:id`, `POST`, `PUT`, `DELETE`, `GET /:id/pdf`, `POST /api/voteheads`, `PUT /api/voteheads/:id`) are unaffected — they still return a single object, not the paginated envelope.

---

## Quick Reference — Field Cheatsheet

| Concept | Where it lives | Who computes it |
|---|---|---|
| `allocation` | `Voteheads.allocation` | Set manually when creating/editing a votehead |
| `balAvailable` (live) | `Voteheads.balAvailable` | Server — decremented on voucher create, restored on update/delete |
| `balBefore` (snapshot) | `VoucherBudgetLines.balBefore` | Server — votehead's balance at the moment the voucher was created |
| `thisPay` | `VoucherBudgetLines.thisPay` | Client — sent per line in `budgetDetails` |
| `uncommittedBal` (snapshot) | `VoucherBudgetLines.uncommittedBal` | Server — `balBefore - thisPay`, frozen at voucher time |

**Client only ever needs to send:** `voteheadId` + `thisPay` per budget line. Everything else is derived and locked server-side to prevent overspend races.
