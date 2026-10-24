// "use strict";

// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");
// const dayjs = require("dayjs");

// // ─── Logo assets ──────────────────────────────────────────────────────────────
// function loadLogo(filename) {
//     const candidates = [path.join(__dirname, "../assets", filename), path.join(__dirname, "assets", filename)];
//     for (const p of candidates) {
//         if (fs.existsSync(p)) {
//             const ext = path.extname(filename).slice(1).replace("jpg", "jpeg");
//             const mime = ext === "png" ? "image/png" : "image/jpeg";
//             return `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;
//         }
//     }
//     return null;
// }

// const LOGO_TVC = loadLogo("logo1.jpeg");
// const LOGO_COA = loadLogo("logo2.png");

// function formatDate(d) {
//     if (!d) return "";
//     try {
//         const date = new Date(d);
//         if (isNaN(date.getTime())) return String(d);
//         return date.toLocaleDateString("en-KE", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//             timeZone: "Africa/Nairobi",
//         });
//     } catch {
//         return String(d);
//     }
// }

// function normalise(v) {
//     return {
//         ...v,
//         lineItems: typeof v.lineItems === "string" ? JSON.parse(v.lineItems) : v.lineItems || [],
//         voteheadItems: typeof v.voteheadItems === "string" ? JSON.parse(v.voteheadItems) : v.voteheadItems || [],
//     };
// }

// // Particulars description + total are derived from lineItems because there is
// // no single stored column for them (a voucher can have several line items);
// // amountInWords/receivedSum themselves come straight from the DB record.
// function deriveParticulars(v) {
//     const items = Array.isArray(v.lineItems) ? v.lineItems : [];
//     const desc =
//         items
//             .map((r) => (r.particulars || "").trim())
//             .filter(Boolean)
//             .join("  ·  ") ||
//         v.particulars ||
//         "—";

//     const rawKshs = items.reduce((s, r) => s + (Number(r.kshs) || 0), 0);
//     const rawCts = items.reduce((s, r) => s + (Number(r.cts) || 0), 0);
//     const totalKshs = rawKshs + Math.floor(rawCts / 100);
//     const totalCts = rawCts % 100;

//     const dateVal = v.particularsDate || (items.find((r) => r.date) || {}).date || v.date || null;

//     return { desc, totalKshs, totalCts, dateVal };
// }

// // ─── Payment Method Helper ────────────────────────────────────────────────────
// function getPaymentMethodDisplay(method) {
//     const labels = {
//         'CASH': 'Cash',
//         'ONLINE': 'Online Transfer',
//         'KCB_OPERATIONS': 'KCB Operations',
//         'KCB_DEVELOPMENT': 'KCB Development',
//         'EQUITY_BANK': 'Equity Bank'
//     };
//     return labels[method] || method || 'Cash';
// }

// function getPaymentReferenceDisplay(method, details) {
//     if (!details) return "—";

//     switch (method) {
//         case 'CASH': {
//             const amount = parseFloat(details);
//             if (!isNaN(amount) && amount > 0) {
//                 return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//             }
//             return `KES ${details}`;
//         }

//         case 'ONLINE':
//             return `EFT: ${details}`;

//         case 'KCB_OPERATIONS':
//         case 'KCB_DEVELOPMENT':
//         case 'EQUITY_BANK':
//             return `Cheque: ${details}`;

//         default:
//             return details;
//     }
// }

// function getReceivedModeDisplay(mode) {
//     const labels = {
//         'CASH': 'Cash',
//         'CHEQUE': 'Cheque',
//         'EFT': 'EFT'
//     };
//     return labels[mode] || mode || "—";
// }

// function getReferenceLabel(method) {
//     switch (method) {
//         case 'CASH':
//             return 'Cash Amount';
//         case 'ONLINE':
//             return 'EFT Reference';
//         case 'KCB_OPERATIONS':
//         case 'KCB_DEVELOPMENT':
//         case 'EQUITY_BANK':
//             return 'Cheque Number';
//         default:
//             return 'Reference';
//     }
// }

// // ─── HTML template ────────────────────────────────────────────────────────────
// function generateVoucherHTML(voucher) {
//     const v = normalise(voucher);

//     const { desc: particularsDesc, totalKshs, totalCts, dateVal } = deriveParticulars(v);

//     const vhItems = [...(v.voteheadItems || [])];
//     while (vhItems.length < 3) vhItems.push({});

//     const vhTotalKshs = (v.voteheadItems || []).reduce((s, r) => s + (Number(r.kshs) || 0), 0);
//     const vhTotalCts = (v.voteheadItems || []).reduce((s, r) => s + (Number(r.cts) || 0), 0);

//     // amountInWords / receivedSum are stored columns on the voucher — use them
//     // directly rather than recomputing from line items.
//     const amountWords = v.amountInWords || "Kenya Shillings Zero Only";
//     const receivedSum = v.receivedSum || amountWords;

//     const paymentMethod = v.paymentMethod || 'CASH';
//     const paymentMethodDisplay = getPaymentMethodDisplay(paymentMethod);
//     const paymentDetails = v.paymentDetails || '';
//     const paymentReferenceDisplay = getPaymentReferenceDisplay(paymentMethod, paymentDetails);
//     const referenceLabel = getReferenceLabel(paymentMethod);

//     const fmtKshs = (n) => (n != null && n !== "" ? Number(n).toLocaleString() : "");
//     const fmtCts = (n) => (n != null && n !== "" ? String(n).padStart(2, "0") : "");

//     const vhRows = vhItems
//         .map(
//             (item, i) => `
//     <tr class="${i % 2 === 1 ? "alt" : ""}">
//       <td>${item.date && dayjs(item.date).isValid() ? dayjs(item.date).format("DD MMM YYYY") : (item.date || "")}</td>
//       <td>${item.expenditureVotehead || item.expenditureVoteHead || ""}</td>
//       <td class="r">${fmtKshs(item.kshs)}</td>
//       <td class="r">${fmtCts(item.cts)}</td>
//     </tr>`,
//         )
//         .join("");

//     const particularsDateBadge = dateVal
//         ? `<div class="p-date-badge"><span class="p-date-icon">📅</span>${formatDate(dateVal)}</div>`
//         : "";

//     return `<!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <title>Payment Voucher ${v.voucherNo || ""}</title>
// <style>
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   html, body {
//     width: 210mm;
//     height: 297mm;
//     font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//     font-size: 8.5pt;
//     color: #1e293b;
//     background: #fff;
//     -webkit-print-color-adjust: exact;
//     print-color-adjust: exact;
//   }

//   .page {
//     width: 210mm;
//     height: 297mm;
//     padding: 8mm 13mm;
//     background: #fff;
//     display: flex;
//     flex-direction: column;
//     overflow: hidden;
//   }

//   :root {
//     --accent:   #0a6ebd;
//     --accent-l: #e8f3fb;
//     --accent-m: #c5dff5;
//     --rule:     #e2e8f0;
//     --label:    #64748b;
//     --body:     #1e293b;
//     --grey-bg:  #f8fafc;
//     --grey-mid: #f1f5f9;
//     --green:    #0f766e;
//     --green-bg: #f0fdf9;
//     --purple:   #7c3aed;
//     --purple-bg: #ede9fe;
//   }

//   /* ── HEADER ── */
//   .hdr {
//     display: flex; align-items: center; gap: 7mm;
//     padding-bottom: 4mm; border-bottom: 2pt solid var(--accent);
//     margin-bottom: 4mm; flex-shrink: 0;
//   }
//   .hdr-img { width: 15mm; height: 15mm; object-fit: contain; flex-shrink: 0; }
//   .hdr-center { flex: 1; text-align: center; }
//   .hdr-center .dept    { font-size: 6.5pt; color: var(--body); font-weight: 600; letter-spacing: 1.1px; text-transform: uppercase; margin-bottom: 1mm; }
//   .hdr-center .name    { font-size: 12pt;  font-weight: 700; color: var(--body); line-height: 1.2; }
//   .hdr-center .contact { font-size: 6.5pt; color: var(--body); margin-top: 1mm; font-weight: 600; }

//   /* ── TITLE BAND ── */
//   .title-band {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     background: var(--accent);
//     color: #fff;
//     border-radius: 3pt;
//     padding: 3mm 5mm;
//     margin-bottom: 2mm;
//   }
//   .title-band .doc-title,
//   .title-band .voucher-no {
//     font-size: 9pt;
//     font-weight: 700;
//     line-height: 1;
//   }
//   .title-band .voucher-no {
//     text-align: right;
//   }

//   /* ── DATE ROW ── */
//   .date-row {
//     display: flex;
//     justify-content: flex-end;
//     margin-bottom: 4mm;
//   }
//   .date-row .label {
//     color: var(--accent);
//     font-size: 7pt;
//     font-weight: 700;
//     text-transform: uppercase;
//     letter-spacing: .8px;
//     margin-right: 2mm;
//   }
//   .date-row .value {
//     color: var(--accent);
//     font-size: 8.5pt;
//     font-weight: 700;
//   }

//   /* ── SECTIONS WRAPPER ── */
//   .sections-wrap {
//     display: flex; flex-direction: column;
//     flex: 1; gap: 3.5mm; overflow: hidden;
//   }
//   .section { page-break-inside: avoid; }

//   .section-heading {
//     font-size: 5.5pt; font-weight: 700; color: #fff;
//     text-transform: uppercase; letter-spacing: 1.6px;
//     background: var(--label);
//     display: inline-block; padding: 0.8mm 2.5mm;
//     border-radius: 2pt; margin-bottom: 2mm;
//   }

//   /* ── PAYEE CARD ── */
//   .payee-card {
//     background: var(--grey-bg); border: 0.4pt solid var(--rule);
//     border-radius: 3pt; padding: 2.5mm 3.5mm;
//     display: grid; grid-template-columns: 34mm 1fr 34mm 1fr;
//     gap: 1.5mm 3mm; align-items: baseline;
//   }
//   .payee-card .fl { font-size: 6.5pt; color: var(--label); font-weight: 600; }
//   .payee-card .fv { font-size: 8.5pt; color: var(--body);  font-weight: 500; }

//   /* ── PARTICULARS CARD ── */
//   .particulars-card {
//     background: var(--grey-bg);
//     border: 0.4pt solid var(--rule);
//     border-radius: 3pt;
//     overflow: hidden;
//   }

//   .p-date-stripe {
//     display: flex;
//     align-items: center;
//     gap: 2mm;
//     background: var(--accent-l);
//     border-bottom: 0.4pt solid var(--accent-m);
//     padding: 1.2mm 3.5mm;
//   }
//   .p-date-stripe .p-date-label {
//     font-size: 6pt; font-weight: 700; color: var(--accent);
//     text-transform: uppercase; letter-spacing: 0.9px;
//   }
//   .p-date-stripe .p-date-value {
//     font-size: 7.5pt; font-weight: 600; color: var(--body);
//   }

//   .p-body {
//     display: grid;
//     grid-template-columns: minmax(0, 1fr) 38mm;
//     column-gap: 8mm;
//     align-items: start;
//     padding: 3mm 3.5mm;
//   }

//   .p-desc {
//     font-size: 8.5pt;
//     color: var(--body);
//     line-height: 1.5;
//     text-align: justify;
//     text-justify: inter-word;
//     overflow-wrap: break-word;
//     word-break: normal;
//     hyphens: auto;
//   }

//   .p-amount {
//     width: 38mm;
//     text-align: right;
//     white-space: nowrap;
//   }
//   .p-amount .amt-label {
//     font-size: 6pt;
//     color: var(--label);
//     font-weight: 700;
//     text-transform: uppercase;
//     letter-spacing: .8px;
//     margin-bottom: .8mm;
//   }
//   .p-amount .amt-value {
//     font-size: 11pt;
//     font-weight: 700;
//     color: var(--accent);
//     line-height: 1;
//   }

//   /* ── PAYMENT INFO BAR ── */
//   .payment-bar {
//     display: flex;
//     align-items: center;
//     gap: 4mm;
//     background: var(--purple-bg);
//     border-left: 2.5pt solid var(--purple);
//     border-radius: 0 2pt 2pt 0;
//     padding: 2mm 3.5mm;
//     margin-top: 2mm;
//     flex-wrap: wrap;
//   }
//   .payment-bar .pm-label {
//     font-size: 6.5pt;
//     font-weight: 700;
//     color: var(--label);
//     white-space: nowrap;
//     text-transform: uppercase;
//     letter-spacing: 0.5px;
//   }
//   .payment-bar .pm-value {
//     font-size: 8pt;
//     font-weight: 600;
//     color: var(--body);
//     white-space: nowrap;
//   }
//   .payment-bar .pm-separator {
//     color: var(--rule);
//     font-size: 10pt;
//   }
//   .payment-bar .pm-ref-label {
//     font-size: 6.5pt;
//     font-weight: 700;
//     color: var(--label);
//     white-space: nowrap;
//     text-transform: uppercase;
//     letter-spacing: 0.5px;
//   }
//   .payment-bar .pm-ref-value {
//     font-size: 8pt;
//     font-weight: 600;
//     color: var(--purple);
//     white-space: nowrap;
//   }

//   /* ── AMOUNT-IN-WORDS BAR ── */
//   .words-bar {
//     display: flex; align-items: flex-start; gap: 3mm;
//     background: var(--grey-mid);
//     border-left: 2.5pt solid var(--accent);
//     border-radius: 0 2pt 2pt 0;
//     padding: 2mm 3.5mm; margin-top: 2mm;
//   }
//   .words-bar .wl { font-size: 6.5pt; font-weight: 700; color: var(--label); white-space: nowrap; padding-top: 1px; }
//   .words-bar .wv { font-size: 8pt; font-style: italic; flex: 1; color: var(--body); }

//   /* ── TABLES ── */
//   table { width: 100%; border-collapse: collapse; font-size: 8pt; }
//   thead tr th {
//     font-size: 6.5pt; font-weight: 700; color: var(--label);
//     text-transform: uppercase; letter-spacing: 0.5px;
//     padding: 1.8mm 2.5mm; background: var(--grey-mid);
//     border-bottom: 1pt solid var(--accent-m); text-align: left;
//   }
//   thead tr th.r { text-align: right; }
//   tbody tr td {
//     padding: 2mm 2.5mm; color: var(--body);
//     border-bottom: 0.4pt solid var(--rule); vertical-align: top;
//   }
//   tbody tr.alt td { background: var(--grey-bg); }
//   tbody tr td.r   { text-align: right; }
//   .total-row td {
//     font-weight: 700; font-size: 8.5pt; padding: 2mm 2.5mm;
//     border-top: 1pt solid var(--accent-m); border-bottom: none !important;
//     background: var(--accent-l) !important; color: var(--accent);
//   }
//   .total-row td.r { text-align: right; }
//   .col-date { width: 16%; } .col-desc { width: 52%; }
//   .col-kshs { width: 20%; } .col-cts  { width: 12%; }

//   /* ── FIELD GRID ── */
//   .field-grid { display: grid; gap: 2.5mm; }
//   .field-grid.cols-2 { grid-template-columns: 1fr 1fr; }
//   .field-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
//   .field-grid.cols-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

//   .field-item {
//     background: var(--grey-bg); border: 0.4pt solid var(--rule);
//     border-radius: 3pt; padding: 2mm 3mm;
//   }
//   .field-item .f-label {
//     font-size: 6pt; font-weight: 700; color: var(--label);
//     text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 0.8mm;
//   }
//   .field-item .f-value { font-size: 8.5pt; color: var(--body); font-weight: 500; min-height: 4mm; }
//   .field-item.sig .f-value,
//   .field-item.sig-corrected .f-value {
//     position: relative;
//   }
//   .field-item.sig .f-value {
//     min-height: 9mm;
//   }
//   .field-item.sig-corrected .f-value {
//     min-height: 12mm;
//   }
//   .field-item.sig .f-value::after,
//   .field-item.sig-corrected .f-value::after {
//     content: "Sign here";
//     position: absolute;
//     left: 50%;
//     bottom: 2mm;
//     transform: translateX(-50%);
//     font-size: 6pt;
//     color: #cbd5e1;
//     font-style: italic;
//     letter-spacing: .3px;
//     pointer-events: none;
//   }

//   /* ── RECEIPT SUM BAR ── */
//   .receipt-sum {
//     display: flex; align-items: flex-start; gap: 3mm;
//     background: var(--green-bg); border-left: 2.5pt solid var(--green);
//     border-radius: 0 2pt 2pt 0; padding: 2mm 3.5mm; margin-bottom: 2.5mm;
//   }
//   .receipt-sum .rl  { font-size: 6.5pt; font-weight: 700; color: var(--green); white-space: nowrap; padding-top: 1px; }
//   .receipt-sum .rv  { font-size: 8pt; font-style: italic; flex: 1; color: var(--body); }
//   .receipt-sum .rcl { font-size: 6.5pt; font-weight: 700; color: var(--green); white-space: nowrap; padding-top: 1px; }
//   .receipt-sum .rcv { font-size: 8pt; color: var(--body); font-weight: 600; min-width: 22mm; }

//   @media print {
//     html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
//     .page { padding: 7mm 12mm; }
//   }
// </style>
// </head>
// <body>
// <div class="page">

//   <!-- ══ HEADER ══ -->

//   <div class="hdr">
//     ${LOGO_COA ? '<img src="' + LOGO_COA + '" class="hdr-img" />' : ""}
//     <div class="hdr-center">
//       <div class="dept">State Department For Technical and Vocational Education &amp; Training</div>
//       <div class="name">Riatirimba Technical and Vocational College</div>
//       <div class="contact">P.O. Box 25 – 40201 Gesusu &nbsp;·&nbsp; 0757 331 085 &nbsp;·&nbsp; info@riatirimbatvc.ac.ke</div>
//     </div>
//     ${LOGO_TVC ? '<img src="' + LOGO_TVC + '" class="hdr-img" />' : ""}
//   </div>

//   <!-- ══ TITLE BAND ══ -->
//   <div class="title-band">
//     <span class="doc-title">Payment Voucher</span>
//     <span class="voucher-no">${v.voucherNo || "—"}</span>
//   </div>

//   <div class="date-row">
//     <span>Date: ${formatDate(v.date) || "—"}</span>
//   </div>

//   <div class="sections-wrap">

//     <!-- PAYEE DETAILS -->
//     <div class="section">
//       <div class="section-heading">Payee Details</div>
//       <div class="payee-card">
//         <span class="fl">Name &amp; Address</span>
//         <span class="fv">${v.payeeName || "—"}${v.payeeAddress ? " &nbsp;·&nbsp; " + v.payeeAddress : ""}</span>
//         <span class="fl">Account Name</span>
//         <span class="fv">${v.accountName || "—"}</span>
//       </div>
//     </div>

//     <!-- PARTICULARS -->
//     <div class="section">
//       <div class="section-heading">Particulars</div>
//       <div class="particulars-card">
//         <div class="p-date-stripe">
//           <span class="p-date-label">Date</span>
//           <span class="p-date-value">${formatDate(dateVal) || "—"}</span>
//         </div>
//         <div class="p-body">
//           <div class="p-desc">${particularsDesc}</div>
//           <div class="p-amount">
//             <div class="amt-label">Amount (Kshs)</div>
//             <div class="amt-value">
//               ${fmtKshs(totalKshs)}${
//                   totalCts > 0 ? '.<small style="font-size:7.5pt">' + fmtCts(totalCts) + "</small>" : ""
//               }
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- ═══ PAYMENT INFO BAR ═══ -->
//       <div class="payment-bar">
//         <span class="pm-label">Payment Method</span>
//         <span class="pm-value">${paymentMethodDisplay}</span>
//         <span class="pm-separator">|</span>
//         <span class="pm-ref-label">${referenceLabel}</span>
//         <span class="pm-ref-value">${paymentReferenceDisplay}</span>
//       </div>

//       <!-- AMOUNT IN WORDS -->
//       <div class="words-bar">
//         <span class="wl">Amount in Words</span>
//         <span class="wv">${amountWords}</span>
//       </div>
//     </div>

//     <!-- AUTHORISATION -->
//     <div class="section">
//       <div class="section-heading">Authorisation</div>
//       <div class="field-grid cols-4">
//         <div class="field-item sig sig-corrected">
//           <div class="f-label">Prepared By</div>
//           <div class="f-value">${v.preparedBy || ""}</div>
//         </div>
//         <div class="field-item">
//           <div class="f-label">Date</div>
//           <div class="f-value">${formatDate(v.preparedDate) || ""}</div>
//         </div>
//         <div class="field-item sig sig-corrected">
//           <div class="f-label">Approved By (Finance Officer)</div>
//           <div class="f-value">${v.approvedBy || ""}</div>
//         </div>
//         <div class="field-item">
//           <div class="f-label">Date</div>
//           <div class="f-value">${formatDate(v.approvedDate) || ""}</div>
//         </div>
//       </div>
//     </div>

//     <!-- EXPENDITURE VOTEHEADS -->
//     <div class="section">
//       <div class="section-heading">Expenditure Voteheads</div>
//       <table>
//         <thead>
//           <tr>
//             <th class="col-date">Date</th>
//             <th class="col-desc">Expenditure Votehead</th>
//             <th class="col-kshs r">Kshs</th>
//             <th class="col-cts  r">Cts</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${vhRows}
//           <tr class="total-row">
//             <td colspan="2">Total</td>
//             <td class="r">${vhTotalKshs.toLocaleString()}</td>
//             <td class="r">${String(vhTotalCts).padStart(2, "0")}</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>

//     <!-- RECEIPT ACKNOWLEDGEMENT -->
//     <div class="section">
//       <div class="section-heading">Receipt Acknowledgement</div>
//       <div class="receipt-sum">
//         <span class="rl">Received a Sum of</span>
//         <span class="rv">${receivedSum}</span>
//         <span class="rcl">Cash / Cheque / EFT</span>
//         <span class="rcv">${getReceivedModeDisplay(v.receivedCashOrCheque)}</span>
//       </div>
//       <div class="field-grid cols-3">
//         <div class="field-item sig">
//           <div class="f-label">Signature</div>
//           <div class="f-value"></div>
//         </div>
//         <div class="field-item">
//           <div class="f-label">ID No</div>
//           <div class="f-value">${v.receiverIdNo || ""}</div>
//         </div>
//         <div class="field-item">
//           <div class="f-label">Date</div>
//           <div class="f-value">${formatDate(v.receivedDate) || ""}</div>
//         </div>
//       </div>
//     </div>

//     <!-- PRINCIPAL AUTHORISATION -->
//     <div class="section">
//       <div class="section-heading">Principal Authorisation</div>
//       <div class="field-grid cols-2">
//         <div class="field-item sig">
//           <div class="f-label">Authorised by Principal</div>
//           <div class="f-value"></div>
//         </div>
//         <div class="field-item">
//           <div class="f-label">Date</div>
//           <div class="f-value">${formatDate(v.authorizedDate) || ""}</div>
//         </div>
//       </div>
//     </div>

//   </div><!-- /sections-wrap -->
// </div><!-- /page -->
// </body>
// </html>`;
// }

// // ─── PDF generation ───────────────────────────────────────────────────────────
// async function generateVoucherPDF(voucher, stream) {
//     let browser;
//     try {
//         const html = generateVoucherHTML(voucher);
//         browser = await puppeteer.launch({
//             executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
//             headless: "new",
//             args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
//         });
//         const page = await browser.newPage();
//         await page.setContent(html, { waitUntil: "networkidle0" });
//         const pdfBuffer = await page.pdf({
//             format: "A4",
//             printBackground: true,
//             margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
//         });
//         stream.write(pdfBuffer);
//         stream.end();
//     } catch (error) {
//         console.error("PDF Generation Error:", error);
//         stream.write(Buffer.from(`Error generating PDF: ${error.message}`));
//         stream.end();
//     } finally {
//         if (browser) await browser.close();
//     }
// }

// module.exports = { generateVoucherPDF };

























































"use strict";

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

// ─── Logo assets ──────────────────────────────────────────────────────────────
function loadLogo(filename) {
    const candidates = [path.join(__dirname, "../assets", filename), path.join(__dirname, "assets", filename)];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            const ext = path.extname(filename).slice(1).replace("jpg", "jpeg");
            const mime = ext === "png" ? "image/png" : "image/jpeg";
            return `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;
        }
    }
    return null;
}

const LOGO_TVC = loadLogo("logo1.jpeg");
const LOGO_COA = loadLogo("logo2.png");

function formatDate(d) {
    if (!d) return "";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return String(d);
        return date.toLocaleDateString("en-KE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Africa/Nairobi",
        });
    } catch {
        return String(d);
    }
}

function normalise(v) {
    return {
        ...v,
        lineItems: typeof v.lineItems === "string" ? JSON.parse(v.lineItems) : v.lineItems || [],
        voteheadItems: typeof v.voteheadItems === "string" ? JSON.parse(v.voteheadItems) : v.voteheadItems || [],
        // Budget lines come from the VoucherBudgetLines -> Votehead association
        // (included by the voucher route), not from a stored JSON column.
        budgetLines: Array.isArray(v.VoucherBudgetLines) ? v.VoucherBudgetLines : [],
    };
}

// Particulars description + total are derived from lineItems because there is
// no single stored column for them (a voucher can have several line items);
// amountInWords/receivedSum themselves come straight from the DB record.
function deriveParticulars(v) {
    const items = Array.isArray(v.lineItems) ? v.lineItems : [];
    const desc =
        items
            .map((r) => (r.particulars || "").trim())
            .filter(Boolean)
            .join("  ·  ") ||
        v.particulars ||
        "—";

    const rawKshs = items.reduce((s, r) => s + (Number(r.kshs) || 0), 0);
    const rawCts = items.reduce((s, r) => s + (Number(r.cts) || 0), 0);
    const totalKshs = rawKshs + Math.floor(rawCts / 100);
    const totalCts = rawCts % 100;

    const dateVal = v.particularsDate || (items.find((r) => r.date) || {}).date || v.date || null;

    return { desc, totalKshs, totalCts, dateVal };
}

// Sums the budget lines for the totals row, pulling allocation off the
// related Votehead (allocation itself doesn't live on the line record).
function deriveBudgetTotals(budgetLines) {
    return budgetLines.reduce(
        (acc, line) => {
            acc.allocation += Number(line.Votehead?.allocation) || 0;
            acc.balBefore += Number(line.balBefore) || 0;
            acc.thisPay += Number(line.thisPay) || 0;
            acc.uncommittedBal += Number(line.uncommittedBal) || 0;
            return acc;
        },
        { allocation: 0, balBefore: 0, thisPay: 0, uncommittedBal: 0 }
    );
}

// ─── Payment Method Helper ────────────────────────────────────────────────────
function getPaymentMethodDisplay(method) {
    const labels = {
        'CASH': 'Cash',
        'ONLINE': 'Online Transfer',
        'KCB_OPERATIONS': 'KCB Operations',
        'KCB_DEVELOPMENT': 'KCB Development',
        'EQUITY_BANK': 'Equity Bank'
    };
    return labels[method] || method || 'Cash';
}

function getPaymentReferenceDisplay(method, details) {
    if (!details) return "—";

    switch (method) {
        case 'CASH': {
            const amount = parseFloat(details);
            if (!isNaN(amount) && amount > 0) {
                return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            return `KES ${details}`;
        }

        case 'ONLINE':
            return `EFT: ${details}`;

        case 'KCB_OPERATIONS':
        case 'KCB_DEVELOPMENT':
        case 'EQUITY_BANK':
            return `Cheque: ${details}`;

        default:
            return details;
    }
}

function getReceivedModeDisplay(mode) {
    const labels = {
        'CASH': 'Cash',
        'CHEQUE': 'Cheque',
        'EFT': 'EFT'
    };
    return labels[mode] || mode || "—";
}

function getReferenceLabel(method) {
    switch (method) {
        case 'CASH':
            return 'Cash Amount';
        case 'ONLINE':
            return 'EFT Reference';
        case 'KCB_OPERATIONS':
        case 'KCB_DEVELOPMENT':
        case 'EQUITY_BANK':
            return 'Cheque Number';
        default:
            return 'Reference';
    }
}

// ─── HTML template ────────────────────────────────────────────────────────────
function generateVoucherHTML(voucher) {
    const v = normalise(voucher);

    const { desc: particularsDesc, totalKshs, totalCts, dateVal } = deriveParticulars(v);

    const vhItems = [...(v.voteheadItems || [])];
    while (vhItems.length < 3) vhItems.push({});

    const vhTotalKshs = (v.voteheadItems || []).reduce((s, r) => s + (Number(r.kshs) || 0), 0);
    const vhTotalCts = (v.voteheadItems || []).reduce((s, r) => s + (Number(r.cts) || 0), 0);

    // amountInWords / receivedSum are stored columns on the voucher — use them
    // directly rather than recomputing from line items.
    const amountWords = v.amountInWords || "Kenya Shillings Zero Only";
    const receivedSum = v.receivedSum || amountWords;

    const paymentMethod = v.paymentMethod || 'CASH';
    const paymentMethodDisplay = getPaymentMethodDisplay(paymentMethod);
    const paymentDetails = v.paymentDetails || '';
    const paymentReferenceDisplay = getPaymentReferenceDisplay(paymentMethod, paymentDetails);
    const referenceLabel = getReferenceLabel(paymentMethod);

    const fmtKshs = (n) => (n != null && n !== "" ? Number(n).toLocaleString() : "");
    const fmtCts = (n) => (n != null && n !== "" ? String(n).padStart(2, "0") : "");
    const fmtMoney = (n) =>
        n != null && n !== ""
            ? Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : "0.00";

    const vhRows = vhItems
        .map(
            (item, i) => `
    <tr class="${i % 2 === 1 ? "alt" : ""}">
      <td>${item.date && dayjs(item.date).isValid() ? dayjs(item.date).format("DD MMM YYYY") : (item.date || "")}</td>
      <td>${item.expenditureVotehead || item.expenditureVoteHead || ""}</td>
      <td class="r">${fmtKshs(item.kshs)}</td>
      <td class="r">${fmtCts(item.cts)}</td>
    </tr>`,
        )
        .join("");

    // ── Budgetary Details rows ──
    const budgetLines = v.budgetLines || [];
    const budgetTotals = deriveBudgetTotals(budgetLines);

    const budgetRows = budgetLines
        .map(
            (line, i) => `
    <tr class="${i % 2 === 1 ? "alt" : ""}">
      <td>${(line.Votehead && line.Votehead.name) || "—"}</td>
      <td class="r">${fmtMoney(line.Votehead ? line.Votehead.allocation : "")}</td>
      <td class="r">${fmtMoney(line.balBefore)}</td>
      <td class="r">${fmtMoney(line.thisPay)}</td>
      <td class="r">${fmtMoney(line.uncommittedBal)}</td>
    </tr>`,
        )
        .join("");

    const particularsDateBadge = dateVal
        ? `<div class="p-date-badge"><span class="p-date-icon">📅</span>${formatDate(dateVal)}</div>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Payment Voucher ${v.voucherNo || ""}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 210mm;
    height: 297mm;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 8.5pt;
    color: #1e293b;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    height: 297mm;
    padding: 8mm 13mm;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :root {
    --accent:   #0a6ebd;
    --accent-l: #dbeafe;
    --accent-m: #93c5e8;
    --rule:     #94a3b8;
    --label:    #475569;
    --body:     #1e293b;
    --grey-bg:  #f1f5f9;
    --grey-mid: #e6ecf3;
    --green:    #0f766e;
    --green-bg: #e6f7f2;
    --purple:   #7c3aed;
    --purple-bg: #e6ddfb;
  }

  /* ── HEADER ── */
  .hdr {
    display: flex; align-items: center; gap: 7mm;
    padding-bottom: 4mm; border-bottom: 2pt solid var(--accent);
    margin-bottom: 4mm; flex-shrink: 0;
  }
  .hdr-img { width: 15mm; height: 15mm; object-fit: contain; flex-shrink: 0; }
  .hdr-center { flex: 1; text-align: center; }
  .hdr-center .dept    { font-size: 6.5pt; color: var(--body); font-weight: 600; letter-spacing: 1.1px; text-transform: uppercase; margin-bottom: 1mm; }
  .hdr-center .name    { font-size: 12pt;  font-weight: 700; color: var(--body); line-height: 1.2; }
  .hdr-center .contact { font-size: 6.5pt; color: var(--body); margin-top: 1mm; font-weight: 600; }

  /* ── TITLE BAND ── */
  .title-band {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--accent);
    color: #fff;
    border-radius: 3pt;
    padding: 3mm 5mm;
    margin-bottom: 2mm;
  }
  .title-band .doc-title,
  .title-band .voucher-no {
    font-size: 9pt;
    font-weight: 700;
    line-height: 1;
  }
  .title-band .voucher-no {
    text-align: right;
  }

  /* ── DATE ROW ── */
  .date-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 4mm;
  }
  .date-row .label {
    color: var(--accent);
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    margin-right: 2mm;
  }
  .date-row .value {
    color: var(--accent);
    font-size: 8.5pt;
    font-weight: 700;
  }

  /* ── SECTIONS WRAPPER ── */
  .sections-wrap {
    display: flex; flex-direction: column;
    flex: 1; gap: 3.5mm; overflow: hidden;
  }
  .section { page-break-inside: avoid; }

  .section-heading {
    font-size: 5.5pt; font-weight: 700; color: #fff;
    text-transform: uppercase; letter-spacing: 1.6px;
    background: var(--label);
    display: inline-block; padding: 0.8mm 2.5mm;
    border-radius: 2pt; margin-bottom: 2mm;
  }

  /* ── PAYEE CARD ── */
  .payee-card {
    background: var(--grey-bg); border: 0.75pt solid var(--rule);
    border-radius: 3pt; padding: 2.5mm 3.5mm;
    display: grid; grid-template-columns: 34mm 1fr 34mm 1fr;
    gap: 1.5mm 3mm; align-items: baseline;
  }
  .payee-card .fl { font-size: 6.5pt; color: var(--label); font-weight: 600; }
  .payee-card .fv { font-size: 8.5pt; color: var(--body);  font-weight: 500; }

  /* ── PARTICULARS CARD ── */
  .particulars-card {
    background: var(--grey-bg);
    border: 0.75pt solid var(--rule);
    border-radius: 3pt;
    overflow: hidden;
  }

  .p-date-stripe {
    display: flex;
    align-items: center;
    gap: 2mm;
    background: var(--accent-l);
    border-bottom: 0.75pt solid var(--accent-m);
    padding: 1.2mm 3.5mm;
  }
  .p-date-stripe .p-date-label {
    font-size: 6pt; font-weight: 700; color: var(--accent);
    text-transform: uppercase; letter-spacing: 0.9px;
  }
  .p-date-stripe .p-date-value {
    font-size: 7.5pt; font-weight: 600; color: var(--body);
  }

  .p-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 38mm;
    column-gap: 8mm;
    align-items: start;
    padding: 3mm 3.5mm;
  }

  .p-desc {
    font-size: 8.5pt;
    color: var(--body);
    line-height: 1.5;
    text-align: justify;
    text-justify: inter-word;
    overflow-wrap: break-word;
    word-break: normal;
    hyphens: auto;
  }

  .p-amount {
    width: 38mm;
    text-align: right;
    white-space: nowrap;
  }
  .p-amount .amt-label {
    font-size: 6pt;
    color: var(--label);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    margin-bottom: .8mm;
  }
  .p-amount .amt-value {
    font-size: 11pt;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }

  /* ── PAYMENT INFO BAR ── */
  .payment-bar {
    display: flex;
    align-items: center;
    gap: 4mm;
    background: var(--purple-bg);
    border-left: 3pt solid var(--purple);
    border-radius: 0 2pt 2pt 0;
    padding: 2mm 3.5mm;
    margin-top: 2mm;
    flex-wrap: wrap;
  }
  .payment-bar .pm-label {
    font-size: 6.5pt;
    font-weight: 700;
    color: var(--label);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .payment-bar .pm-value {
    font-size: 8pt;
    font-weight: 600;
    color: var(--body);
    white-space: nowrap;
  }
  .payment-bar .pm-separator {
    color: var(--rule);
    font-size: 10pt;
  }
  .payment-bar .pm-ref-label {
    font-size: 6.5pt;
    font-weight: 700;
    color: var(--label);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .payment-bar .pm-ref-value {
    font-size: 8pt;
    font-weight: 600;
    color: var(--purple);
    white-space: nowrap;
  }

  /* ── AMOUNT-IN-WORDS BAR ── */
  .words-bar {
    display: flex; align-items: flex-start; gap: 3mm;
    background: var(--grey-mid);
    border-left: 3pt solid var(--accent);
    border-radius: 0 2pt 2pt 0;
    padding: 2mm 3.5mm; margin-top: 2mm;
  }
  .words-bar .wl { font-size: 6.5pt; font-weight: 700; color: var(--label); white-space: nowrap; padding-top: 1px; }
  .words-bar .wv { font-size: 8pt; font-style: italic; flex: 1; color: var(--body); }

  /* ── TABLES ── */
  table { width: 100%; border-collapse: collapse; font-size: 8pt; }
  thead tr th {
    font-size: 6.5pt; font-weight: 700; color: var(--label);
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 1.8mm 2.5mm; background: var(--grey-mid);
    border-bottom: 1.25pt solid var(--accent-m); text-align: left;
  }
  thead tr th.r { text-align: right; }
  tbody tr td {
    padding: 2mm 2.5mm; color: var(--body);
    border-bottom: 0.6pt solid var(--rule); vertical-align: top;
  }
  tbody tr.alt td { background: var(--grey-bg); }
  tbody tr td.r   { text-align: right; }
  .total-row td {
    font-weight: 700; font-size: 8.5pt; padding: 2mm 2.5mm;
    border-top: 1.5pt solid var(--accent-m); border-bottom: none !important;
    background: var(--accent-l) !important; color: var(--accent);
  }
  .total-row td.r { text-align: right; }
  .empty-note { text-align: center; color: var(--label); font-style: italic; }
  .col-date { width: 16%; } .col-desc { width: 52%; }
  .col-kshs { width: 20%; } .col-cts  { width: 12%; }
  .col-bd-vh  { width: 40%; }
  .col-bd-amt { width: 15%; }

  /* ── FIELD GRID ── */
  .field-grid { display: grid; gap: 2.5mm; }
  .field-grid.cols-2 { grid-template-columns: 1fr 1fr; }
  .field-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .field-grid.cols-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

  .field-item {
    background: var(--grey-bg); border: 0.75pt solid var(--rule);
    border-radius: 3pt; padding: 2mm 3mm;
  }
  .field-item .f-label {
    font-size: 6pt; font-weight: 700; color: var(--label);
    text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 0.8mm;
  }
  .field-item .f-value { font-size: 8.5pt; color: var(--body); font-weight: 500; min-height: 4mm; }
  .field-item.sig .f-value,
  .field-item.sig-corrected .f-value {
    position: relative;
  }
  .field-item.sig .f-value {
    min-height: 9mm;
  }
  .field-item.sig-corrected .f-value {
    min-height: 12mm;
  }




.field-item.sig .f-value::after,
  .field-item.sig-corrected .f-value::after {
    content: "SIGN HERE";
    position: absolute;
    left: 50%;
    bottom: 2mm;
    transform: translateX(-50%);
    font-size: 6.5pt;
    color: #94a3b8;
    font-style: italic;
    letter-spacing: .3px;
    pointer-events: none;
  }






  /* ── RECEIPT SUM BAR ── */
  .receipt-sum {
    display: flex; align-items: flex-start; gap: 3mm;
    background: var(--green-bg); border-left: 3pt solid var(--green);
    border-radius: 0 2pt 2pt 0; padding: 2mm 3.5mm; margin-bottom: 2.5mm;
  }
  .receipt-sum .rl  { font-size: 6.5pt; font-weight: 700; color: var(--green); white-space: nowrap; padding-top: 1px; }
  .receipt-sum .rv  { font-size: 8pt; font-style: italic; flex: 1; color: var(--body); }
  .receipt-sum .rcl { font-size: 6.5pt; font-weight: 700; color: var(--green); white-space: nowrap; padding-top: 1px; }
  .receipt-sum .rcv { font-size: 8pt; color: var(--body); font-weight: 600; min-width: 22mm; }

  @media print {
    html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
    .page { padding: 7mm 12mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- ══ HEADER ══ -->

  <div class="hdr">
    ${LOGO_COA ? '<img src="' + LOGO_COA + '" class="hdr-img" />' : ""}
    <div class="hdr-center">
      <div class="dept">State Department For Technical and Vocational Education &amp; Training</div>
      <div class="name">Riatirimba Technical and Vocational College</div>
      <div class="contact">P.O. Box 25 – 40201 Gesusu &nbsp;·&nbsp; 0757 331 085 &nbsp;·&nbsp; info@riatirimbatvc.ac.ke</div>
    </div>
    ${LOGO_TVC ? '<img src="' + LOGO_TVC + '" class="hdr-img" />' : ""}
  </div>

  <!-- ══ TITLE BAND ══ -->
  <div class="title-band">
    <span class="doc-title">Payment Voucher</span>
    <span class="voucher-no">${v.voucherNo || "—"}</span>
  </div>

  <div class="date-row">
    <span>Date: ${formatDate(v.date) || "—"}</span>
  </div>

  <div class="sections-wrap">

    <!-- PAYEE DETAILS -->
    <div class="section">
      <div class="section-heading">Payee Details</div>
      <div class="payee-card">
        <span class="fl">Name &amp; Address</span>
        <span class="fv">${v.payeeName || "—"}${v.payeeAddress ? " &nbsp;·&nbsp; " + v.payeeAddress : ""}</span>
        <span class="fl">Account Name</span>
        <span class="fv">${v.accountName || "—"}</span>
      </div>
    </div>

    <!-- PARTICULARS -->
    <div class="section">
      <div class="section-heading">Particulars</div>
      <div class="particulars-card">
        <div class="p-date-stripe">
          <span class="p-date-label">Date</span>
          <span class="p-date-value">${formatDate(dateVal) || "—"}</span>
        </div>
        <div class="p-body">
          <div class="p-desc">${particularsDesc}</div>
          <div class="p-amount">
            <div class="amt-label">Amount (Kshs)</div>
            <div class="amt-value">
              ${fmtKshs(totalKshs)}${
                  totalCts > 0 ? '.<small style="font-size:7.5pt">' + fmtCts(totalCts) + "</small>" : ""
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ PAYMENT INFO BAR ═══ -->
      <div class="payment-bar">
        <span class="pm-label">Payment Method</span>
        <span class="pm-value">${paymentMethodDisplay}</span>
        <span class="pm-separator">|</span>
        <span class="pm-ref-label">${referenceLabel}</span>
        <span class="pm-ref-value">${paymentReferenceDisplay}</span>
      </div>

      <!-- AMOUNT IN WORDS -->
      <div class="words-bar">
        <span class="wl">Amount in Words</span>
        <span class="wv">${amountWords}</span>
      </div>
    </div>

    <!-- BUDGETARY DETAILS -->
    <div class="section">
      <div class="section-heading">Budgetary Details</div>
      <table>
        <thead>
          <tr>
            <th class="col-bd-vh">Votehead</th>
            <th class="col-bd-amt r">Allocation</th>
            <th class="col-bd-amt r">Bal. Avail</th>
            <th class="col-bd-amt r">Less: This Pay</th>
            <th class="col-bd-amt r">Uncomm. Bal</th>
          </tr>
        </thead>
        <tbody>
          ${budgetRows || '<tr><td colspan="5" class="empty-note">No budget lines recorded</td></tr>'}
          <tr class="total-row">
            <td>Total</td>
            <td class="r">${fmtMoney(budgetTotals.allocation)}</td>
            <td class="r">${fmtMoney(budgetTotals.balBefore)}</td>
            <td class="r">${fmtMoney(budgetTotals.thisPay)}</td>
            <td class="r">${fmtMoney(budgetTotals.uncommittedBal)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- AUTHORISATION -->
    <div class="section">
      <div class="section-heading">Authorisation</div>
      <div class="field-grid cols-4">
        <div class="field-item sig sig-corrected">
          <div class="f-label">Prepared By</div>
          <div class="f-value">${v.preparedBy || ""}</div>
        </div>
        <div class="field-item">
          <div class="f-label">Date</div>
          <div class="f-value">${formatDate(v.preparedDate) || ""}</div>
        </div>
        <div class="field-item sig sig-corrected">
          <div class="f-label">Approved By (Finance Officer)</div>
          <div class="f-value">${v.approvedBy || ""}</div>
        </div>
        <div class="field-item">
          <div class="f-label">Date</div>
          <div class="f-value">${formatDate(v.approvedDate) || ""}</div>
        </div>
      </div>
    </div>

    <!-- EXPENDITURE VOTEHEADS -->
   

    <!-- RECEIPT ACKNOWLEDGEMENT -->
    <div class="section">
      <div class="section-heading">Receipt Acknowledgement</div>
      <div class="receipt-sum">
        <span class="rl">Received a Sum of</span>
        <span class="rv">${receivedSum}</span>
        <span class="rcl">Cash / Cheque / EFT</span>
        <span class="rcv">${getReceivedModeDisplay(v.receivedCashOrCheque)}</span>
      </div>
      <div class="field-grid cols-3">
        <div class="field-item sig">
          <div class="f-label">Signature</div>
          <div class="f-value"></div>
        </div>
        <div class="field-item">
          <div class="f-label">ID No</div>
          <div class="f-value">${v.receiverIdNo || ""}</div>
        </div>
        <div class="field-item">
          <div class="f-label">Date</div>
          <div class="f-value">${formatDate(v.receivedDate) || ""}</div>
        </div>
      </div>
    </div>

    <!-- PRINCIPAL AUTHORISATION -->
    <div class="section">
      <div class="section-heading">Principal Authorisation</div>
      <div class="field-grid cols-2">
        <div class="field-item sig">
          <div class="f-label">Authorised by Principal</div>
          <div class="f-value"></div>
        </div>
        <div class="field-item">
          <div class="f-label">Date</div>
          <div class="f-value">${formatDate(v.authorizedDate) || ""}</div>
        </div>
      </div>
    </div>

  </div><!-- /sections-wrap -->
</div><!-- /page -->
</body>
</html>`;
}

// ─── PDF generation ───────────────────────────────────────────────────────────
async function generateVoucherPDF(voucher, stream) {
    let browser;
    try {
        const html = generateVoucherHTML(voucher);
        browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
        });
        stream.write(pdfBuffer);
        stream.end();
    } catch (error) {
        console.error("PDF Generation Error:", error);
        stream.write(Buffer.from(`Error generating PDF: ${error.message}`));
        stream.end();
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { generateVoucherPDF };