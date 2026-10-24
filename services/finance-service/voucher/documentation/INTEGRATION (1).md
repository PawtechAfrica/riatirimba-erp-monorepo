# Voucher System — Integration Guide

# Voucher System — Integration Guide

The `index.html` / `app.js` pair is a static mockup only — it's there to
show the expected form fields and API calls, not something to ship. The
real frontend is a React app, which typically runs on its own dev server
(port 3000/5173/etc.) separate from the Express API. That means, unlike the
mockup, you need CORS and an explicit API base URL.

## 1. Wiring the API for a React frontend

**Backend — enable CORS and mount the routes:**

```js
// server.js
const express = require('express')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', // your React dev/prod origin
}))

const voucherRoutes = require('./routes/vouchers')
app.use('/api/vouchers', voucherRoutes)

app.listen(process.env.PORT || 3000, () => console.log('API listening'))
```

`cors` isn't a dependency yet if you're coming from the static-mockup setup
— add it: `npm install cors`.

**Frontend — point React at the API.** Two common approaches:

- **Dev proxy** (Vite: `server.proxy` in `vite.config.js`; CRA: `"proxy"` in
  `package.json`) so the React app can call relative paths like
  `fetch('/api/vouchers')` in development, same as the mockup does. In
  production you'd still need an absolute URL or a reverse proxy (nginx) in
  front of both apps on the same domain.
- **Explicit base URL** via an env var, e.g. `VITE_API_URL=http://localhost:3000`,
  then `fetch(\`${import.meta.env.VITE_API_URL}/api/vouchers\`)`. Simpler to
  reason about, works the same in dev and prod as long as the env var is set
  correctly per environment.

Either way, the request/response contracts below don't change — only how
the frontend reaches the API does.

Folder layout `routes/vouchers.js` expects, relative to itself:

```
project/
├── routes/
│   └── vouchers.js
├── database/
│   └── models/          → must export { Vouchers } (Sequelize model)
├── services/
│   └── pdfService.js
├── config/
│   └── voucherSerial.js → must export generateSerials(lastVoucherNo, count)
├── middlewares/
│   ├── verifyJWT.js     → imported but not currently applied to any route
│   └── errorHandler.js  → must export asyncHandler
└── assets/
    ├── logo1.jpeg       → optional, PDF renders without it if missing
    └── logo2.png        → optional, same
```

(No `public/` folder needed on the backend now — the React app is built and
served independently, e.g. via Vite/CRA build output on its own host, or
its own static hosting/CDN.)

`pdfService.js` needs `puppeteer` and `dayjs` installed; `vouchers.js` needs
`number-to-words`. Puppeteer needs a Chromium it can launch — on servers
without a bundled one, set `PUPPETEER_EXECUTABLE_PATH` to a system Chrome/
Chromium binary (already read via `process.env.PUPPETEER_EXECUTABLE_PATH`
in `generateVoucherPDF`).

**PDF downloads from React:** `GET /:id/pdf` returns `application/pdf`
directly, not JSON. In React, `window.open(`${API}/${id}/pdf`, '_blank')`
works the same as in the mockup, or `fetch` + `blob()` +
`URL.createObjectURL()` if you want to control the tab/print flow yourself
(see `printVoucher()` in `app.js` for that pattern).

## 2. Endpoints

| Method | Path                 | Purpose                                |
|--------|----------------------|-----------------------------------------|
| GET    | `/api/vouchers`      | List vouchers (summary fields only)     |
| GET    | `/api/vouchers/:id`  | Get one voucher, full record            |
| POST   | `/api/vouchers`      | Create a voucher                        |
| PUT    | `/api/vouchers/:id`  | Update a voucher                        |
| DELETE | `/api/vouchers/:id`  | Delete a voucher                        |
| GET    | `/api/vouchers/:id/pdf` | Stream the voucher as a PDF          |

There is no batch/bulk endpoint — every voucher is created, updated, and
PDF'd one at a time.

## 3. Request body — required vs optional

### Required on `POST /api/vouchers`

| Field       | Notes                                                    |
|-------------|-----------------------------------------------------------|
| `date`      | Voucher date. Model column is `allowNull: false`; the route rejects a missing/empty value with 400 before it ever reaches the DB. |
| `payeeName` | Model column is `allowNull: false`.                       |

`voucherNo` is **not** sent by the client — it's generated server-side
(`generateVoucherNumber()`), and the client should treat it as read-only.

### Payment method — conditionally required

`paymentMethod` itself is optional to send, but if it's present the value
determines what's required in `paymentDetails`:

| `paymentMethod`                                    | `paymentDetails` requirement                                      |
|-----------------------------------------------------|---------------------------------------------------------------------|
| `CASH`                                              | **Required** — must be a number > 0 (the cash amount).             |
| `ONLINE`                                            | **Optional** — EFT reference, can be left blank.                    |
| `KCB_OPERATIONS`, `KCB_DEVELOPMENT`, `EQUITY_BANK`  | **Required** — must be exactly 4 digits (cheque number).           |

This validation must be replicated in the React form's submit handler for a
good UX (fail fast before hitting the network) — see the equivalent logic
in the mockup's `app.js` (submit handler) as a reference — and is enforced
again server-side by `validatePaymentMethod()` in `routes/vouchers.js`,
which is the actual source of truth. Keep both in sync if either changes.

### Everything else is optional

| Field                    | Type            | Notes |
|--------------------------|-----------------|-------|
| `payeeAddress`           | string          | |
| `accountName`            | string          | |
| `lineItems`              | array of `{ date, particulars, kshs, cts }` | Drives the auto-computed `amountInWords`/`receivedSum` — see below. |
| `amountInWords`          | string          | Sent by the form but **overwritten server-side** from `lineItems` totals — don't rely on the client value persisting. |
| `voteheadItems`          | array of `{ date, expenditureVotehead, kshs, cts }` | Rendered in the "Expenditure Voteheads" table; totals are computed at PDF-render time, not stored. |
| `preparedBy` / `preparedDate` | string / date | |
| `approvedBy` / `approvedDate` | string / date | |
| `receivedSum`            | string          | Also server-overwritten from `lineItems`, same as `amountInWords`. |
| `receivedCashOrCheque`   | `"CASH" \| "CHEQUE" \| "EFT"` | Free-text column, no server-side enum enforced — filled in by the receiver at signing time, not tied to `paymentMethod`. |
| `receiverIdNo`           | string          | Optional — national ID of the person receiving payment. |
| `receivedDate`           | date            | |
| `authorizedDate`         | date            | Principal's authorisation date. There is no signature field — the principal signs the printed PDF physically. |

### `PUT /api/vouchers/:id`

Same rules as above, except:
- `voucherNo`, `id`, `createdAt`, `updatedAt` are stripped from the update payload even if sent.
- If you include `date` in the body, it can't be empty (400 if so). Omit the key entirely to leave it unchanged.
- `preparedDate`, `approvedDate`, `receivedDate`, `authorizedDate` can be explicitly cleared by sending `""` — only applied if the key is present in the body.

## 4. Response shape

`GET /api/vouchers` returns only:
`id, voucherNo, date, payeeName, amountInWords, paymentMethod, paymentDetails, createdAt`

`GET /api/vouchers/:id` returns the full row, including `lineItems` and
`voteheadItems` already parsed back into arrays (the model's getters do
`JSON.parse` for you — don't `JSON.parse` them again client-side).

## 5. Known gaps worth deciding on before going live

- `receiverSignature` and `authorizedByPrincipal` exist as DB columns but are
  never read from the request body or rendered in the PDF. Either wire them
  up (capture + display) or drop the columns.
- No auth is currently applied — `verifyJWT` is imported in `routes/vouchers.js`
  but not attached to any route. Add it to whichever routes should require a
  logged-in user.
