# 📚 Riatirimba Finance Service - API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently no authentication required (internal service). All endpoints expect `application/json`.

---

## 🏛️ 1. Fee Structures

### Get All Fee Structures
```http
GET /api/fee-structures
```

**Query Parameters (optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `term_number` | integer | Filter by term (1, 2, 3) |
| `scope_type` | string | college, department, programme |
| `scope_id` | string | Scope identifier |
| `is_active` | boolean | true/false |
| `version_label` | string | Search by version label |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "FS-V1-T1-COL",
      "version_label": "2026 Gazette",
      "term_number": 1,
      "scope_type": "college",
      "scope_id": null,
      "total_amount": "22398.00",
      "is_active": true,
      "lines": [...]
    }
  ],
  "count": 3
}
```

---

### Get Fee Structure by ID
```http
GET /api/fee-structures/:id
```

**Response:** Single fee structure with lines.

---

### Create Fee Structure
```http
POST /api/fee-structures
```

**Request Body:**
```json
{
  "version_label": "2026 Gazette",
  "term_number": 1,
  "scope_type": "college",
  "scope_id": null,
  "student_category": null,
  "valid_from": "2026-01-01",
  "valid_to": null,
  "total_amount": 22398.00,
  "created_by": "ADMIN-01",
  "lines": [
    {"vote_head_id": "VH-ACT", "amount": 1600.00, "priority_order": 5},
    {"vote_head_id": "VH-TUI", "amount": 13240.00, "priority_order": 10}
  ]
}
```

---

### Bulk Create Fee Structures (All 3 Terms)
```http
POST /api/fee-structures/bulk
```

**Request Body:**
```json
{
  "version_label": "2027 Gazette",
  "valid_from": "2027-08-01",
  "created_by": "ADMIN-01",
  "terms": [
    {
      "term_number": 1,
      "total_amount": 24000.00,
      "lines": [...]
    }
  ]
}
```

---

### Resolve Fee Structure for Enrollment
```http
POST /api/fee-structures/resolve
```

**Request Body:**
```json
{
  "term_number": 1,
  "enrollment_date": "2026-09-05",
  "programme_code": "DICT",
  "department_id": "DEPT-ICT",
  "student_category": "regular"
}
```

---

### Close Fee Structure Version
```http
PATCH /api/fee-structures/:id/close
```

**Request Body:**
```json
{
  "valid_to": "2027-07-31",
  "closedBy": "ADMIN-01"
}
```

---

### Copy Fee Structure Version
```http
POST /api/fee-structures/:id/copy
```

**Request Body:**
```json
{
  "new_valid_from": "2027-08-01",
  "version_label": "2027 Gazette Copy",
  "created_by": "ADMIN-01"
}
```

---

### Update Fee Structure
```http
PUT /api/fee-structures/:id
```

**Request Body:** (all fields optional)
```json
{
  "version_label": "Updated Label",
  "is_active": true,
  "total_amount": 23000.00
}
```

---

### Delete Fee Structure
```http
DELETE /api/fee-structures/:id
```

---

### Get Fee Structure Versions
```http
GET /api/fee-structures/versions
```

**Response:** Grouped by version label with history.

---

### Get Active Structures for Term
```http
GET /api/fee-structures/active?term_number=1&date=2026-09-05
```

---

### Get by Scope
```http
GET /api/fee-structures/scope/:scope_type?scope_id=DEPT-ICT&term_number=1
```

---

## 📋 2. Vote Heads

### Get All Vote Heads
```http
GET /api/vote-heads
```

**Query Parameters (optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `is_one_time` | boolean | true/false |
| `is_refundable` | boolean | true/false |
| `is_active` | boolean | true/false |
| `name` | string | Search by name |
| `priority_order` | integer | Filter by priority |

---

### Get One-Time Charges
```http
GET /api/vote-heads/one-time
```

**Response:** Only one-time charges (Admission, ID, Caution, KUCCPS)

---

### Get Recurring Charges
```http
GET /api/vote-heads/recurring
```

**Response:** Only recurring charges (Activity, EWC, LTT, PE, RMI, Tuition)

---

### Create Vote Head
```http
POST /api/vote-heads
```

**Request Body:**
```json
{
  "id": "VH-TEST",
  "name": "Test Fee",
  "description": "Description",
  "is_one_time": false,
  "is_refundable": false,
  "priority_order": 99,
  "is_active": true
}
```

---

### Update Vote Head
```http
PUT /api/vote-heads/:id
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

---

### Toggle Vote Head Status
```http
PATCH /api/vote-heads/:id/toggle
```

---

### Delete Vote Head
```http
DELETE /api/vote-heads/:id
```

---

## 🎓 3. Enrollments

### Process Enrollment Event
```http
POST /api/enrollment-events
```

**Request Body:**
```json
{
  "event": "TERM_ADVANCED",
  "eventId": "EVT-001",
  "studentRegNo": "2026-ICT-001",
  "studentName": "John Mwangi",
  "programmeCode": "DICT",
  "studentYear": 1,
  "studentTerm": 1,
  "enrollmentDate": "2026-09-05",
  "studentCategory": "regular",
  "isNewStudent": true,
  "enrolledBy": "HOD-001"
}
```

**Supported Events:**
- `TERM_ADVANCED` - Create enrollment + obligations
- `STUDENT_WITHDRAWN` - Mark as withdrawn
- `STUDENT_DEFERRED` - Mark as deferred
- `STUDENT_REINSTATED` - Reactivate

---

### Get Enrollments by Registration Number
```http
GET /api/enrollments?regNo=2026-ICT-001
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 1
}
```

---

### Get Enrollment by ID
```http
GET /api/enrollments/:id
```

---

### Update Enrollment Status
```http
PATCH /api/enrollments/:id/status
```

**Request Body:**
```json
{
  "status": "withdrawn",
  "notes": "Student withdrew voluntarily"
}
```

**Valid Statuses:** `active`, `completed`, `withdrawn`, `deferred`

---

## 💳 4. Payments

### Post Payment
```http
POST /api/payments
```

**Request Body:**
```json
{
  "regNo": "2026-ICT-001",
  "obligations": [
    {
      "obligationId": "OBL-xxx",
      "amount": 20000
    }
  ],
  "totalAmount": 20000,
  "paymentMode": "mpesa",
  "transactionRef": "PAY-001",
  "fundingSource": "self",
  "receivedBy": "CASHIER-01",
  "paymentDate": "2026-09-10"
}
```

**Payment Modes:** `cash`, `mpesa`, `bank_transfer`, `cheque`, `credit_transfer`

**Funding Sources:** `self`, `kuccps`, `nita`, `helb`, `employer`, `cdf_bursary`, `county_bursary`, `carry_forward`

---

### Get Payments by Registration Number
```http
GET /api/payments?regNo=2026-ICT-001
```

---

### Get Payment by ID
```http
GET /api/payments/:id
```

---

### Reverse Payment
```http
POST /api/payments/:id/reverse
```

**Request Body:**
```json
{
  "reversedBy": "ADMIN-01",
  "notes": "Payment made in error"
}
```

---

## 🧾 5. Receipts

### Generate Receipt (PDF)
```http
GET /api/receipts/:obligationId/pdf?type=student
```

**Query Parameters:**
| Parameter | Values | Default |
|-----------|--------|---------|
| `type` | `student` or `sponsor` | `student` |

- **Student Receipt:** Full vote head breakdown
- **Sponsor Receipt:** Summary + Acknowledgement

**Response:** PDF file download

---

### Get Receipt JSON Preview
```http
GET /api/receipts/:obligationId/json
```

**Response:** Full receipt data as JSON

---

## 👤 6. Students

### Get Student Fee Position
```http
GET /api/students/fee-position?regNo=2026-ICT-001&studentYear=1
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `regNo` | string | ✅ Required - Registration number |
| `studentYear` | integer | Optional - Filter by year |

**Response:** Complete fee position with obligations, vote heads, payments, and summary

---

### Get Student Fee Summary (Lightweight)
```http
GET /api/students/summary?regNo=2026-ICT-001
```

**Response:** Summary only (no vote head details)

---

## 📈 7. Reports

### Daily Collection Report
```http
GET /api/reports/daily-collection?date=2026-09-06
```

**Response:** Collections by payment mode, funding source

---

### Weekly Summary
```http
GET /api/reports/weekly-summary?weekStart=2026-09-01
```

**Response:** Daily breakdown for the week

---

### Monthly Summary
```http
GET /api/reports/monthly-summary?year=2026&month=9
```

**Response:** Weekly breakdown for the month

---

### Programme-wise Collection
```http
GET /api/reports/programme-collection?startDate=2026-09-01&endDate=2026-09-30
```

**Response:** Collections per programme

---

### Outstanding Aging Report
```http
GET /api/reports/aging
```

**Response:** Aging buckets (0-30, 31-60, 61-90, 90+ days)

---

### Collection Summary
```http
GET /api/reports/collection-summary?startDate=2026-09-01&endDate=2026-09-30
```

---

### Outstanding Balances (All Students)
```http
GET /api/reports/outstanding
```

---

## 🔍 8. Audit Logs

### Get All Audit Logs
```http
GET /api/audit-logs
```

**Query Parameters (all optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | Filter by user |
| `entity_type` | string | Filter by entity type |
| `entity_id` | string | Filter by entity ID |
| `action` | string | Filter by action |
| `search` | string | Search across fields |
| `start_date` | date | YYYY-MM-DD |
| `end_date` | date | YYYY-MM-DD |
| `limit` | integer | Default 100 |
| `offset` | integer | For pagination |

---

### Get Audit Log Statistics
```http
GET /api/audit-logs/stats
```

**Response:** Total logs, today's count, by action, by entity

---

### Get Logs by User
```http
GET /api/audit-logs/user/:userId
```

---

### Get Logs by Entity
```http
GET /api/audit-logs/entity/:entityType/:entityId
```

---

### Get Recent Audit Logs
```http
GET /api/audit-logs/recent?limit=50
```

---

### Cleanup Old Logs
```http
DELETE /api/audit-logs/cleanup?days=365
```

---

## ❤️ Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "riatirimba-finance-service",
  "env": "development",
  "timestamp": "2026-09-06T..."
}
```

---

## 📊 Entity Types Reference

| Entity Type | Description |
|-------------|-------------|
| `VoteHead` | Fee categories |
| `FeeStructure` | Fee structure versions |
| `StudentTermEnrollment` | Student enrollment records |
| `FeeObligation` | Financial obligations |
| `Payment` | Payment transactions |
| `StudentCredit` | Overpayment credits |
| `Receipt` | Receipt generation |

---

## ✅ Summary

| Module | Base Route |
|--------|------------|
| Fee Structures | `/api/fee-structures` |
| Vote Heads | `/api/vote-heads` |
| Enrollments | `/api/enrollment-events` |
| Payments | `/api/payments` |
| Receipts | `/api/receipts` |
| Students | `/api/students` |
| Reports | `/api/reports` |
| Audit Logs | `/api/audit-logs` |

---

**All endpoints use `regNo` (Registration Number) as the primary student identifier!** 🚀