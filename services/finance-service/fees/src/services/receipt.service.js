"use strict";

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const db = require("../database/models");
const { logger } = require("../utils/logger");

const {
  FeeObligation,
  ObligationVoteHeadSnapshot,
  PaymentDistribution,
  Payment,
  StudentTermEnrollment,
  FeeStructure,
} = db;

// ─── Logo assets ──────────────────────────────────────────────────────────────
// Drop the two logo files in an `assets` folder that sits either next to this
// file, or one level up (i.e. `../assets` relative to this file) — same
// convention as the voucher generator. Filenames must match exactly:
//   logo1.jpeg  -> left-hand logo (e.g. college crest)
//   logo2.png   -> right-hand logo (e.g. ministry / department crest)
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

/**
 * Generate receipt data for an obligation
 */

const generateReceiptData = async (obligationId) => {
  try {
    if (!obligationId || obligationId === 'OBL-xxxxx') {
      throw new Error('Invalid obligation ID provided');
    }

    const obligation = await FeeObligation.findByPk(obligationId, {
      include: [
        {
          model: ObligationVoteHeadSnapshot,
          as: 'snapshots',
          order: [['priority_order', 'ASC']],
        },
        {
          model: StudentTermEnrollment,
          as: 'enrollment',
          include: [
            {
              model: FeeStructure,
              as: 'feeStructure',
            },
          ],
        },
      ],
    });

    if (!obligation) {
      throw new Error(`Obligation ${obligationId} not found`);
    }

    const distributions = await PaymentDistribution.findAll({
      where: { obligation_id: obligationId },
      include: [
        {
          model: Payment,
          as: 'payment',
          where: { is_reversal: false },
          required: false,
        },
      ],
    });

    // Calculate paid amounts per vote head
    const voteHeadPaid = {};
    const payments = [];
    let fundingSources = new Set();
    let receiptNumber = null;

    for (const dist of distributions) {
      const voteHeadId = dist.vote_head_id;
      if (!voteHeadPaid[voteHeadId]) {
        voteHeadPaid[voteHeadId] = 0;
      }
      voteHeadPaid[voteHeadId] += parseFloat(dist.amount_applied) || 0;

      if (dist.payment) {
        // ✅ READ the receipt number from the payment (RCP-2026-9456 format)
        if (!receiptNumber && dist.payment.receipt_number) {
          receiptNumber = dist.payment.receipt_number;
        }

        payments.push({
          receiptNumber: dist.payment.receipt_number || 'N/A',
          amount: parseFloat(dist.amount_applied) || 0,
          paymentDate: dist.payment.payment_date || 'N/A',
          paymentMode: dist.payment.payment_mode || 'N/A',
          fundingSource: dist.payment.funding_source || 'N/A',
        });
        if (dist.payment.funding_source) {
          fundingSources.add(dist.payment.funding_source);
        }
      }
    }

    // ✅ If no receipt number found from payments, generate one (fallback - should never happen)
    if (!receiptNumber) {
      const year = new Date().getFullYear();
      const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      receiptNumber = `RCP-${year}-${seq}`;
      logger.warn(`No receipt number found in payments for obligation ${obligationId}, generated fallback: ${receiptNumber}`);
    }

    // Build vote head data with defaults
    const voteHeads = (obligation.snapshots || []).map((snapshot) => {
      const assessed = parseFloat(snapshot.amount_assessed) || 0;
      const paid = voteHeadPaid[snapshot.vote_head_id] || 0;
      const balance = assessed - paid;

      let status = 'unpaid';
      if (balance <= 0 && paid > 0) status = 'cleared';
      else if (balance > 0 && paid > 0) status = 'partial';
      else if (balance < 0) status = 'overpaid';

      return {
        name: snapshot.vote_head_name || 'Unknown',
        assessed: assessed,
        paid: paid,
        balance: balance,
        status: status,
      };
    });

    const totalAmount = parseFloat(obligation.total_amount) || 0;
    const totalPaid = parseFloat(obligation.total_paid) || 0;
    const totalBalance = parseFloat(obligation.total_balance) || 0;

    const studentName = obligation.student_name ||
                        obligation.enrollment?.student_name ||
                        obligation.student_id ||
                        'Unknown Student';
    const studentRegNo = obligation.student_reg_no ||
                         obligation.enrollment?.student_reg_no ||
                         'N/A';

    return {
      receiptNumber: receiptNumber, // ✅ RCP-2026-9456 from payment!
      generatedDate: new Date().toISOString().split('T')[0],
      studentId: obligation.student_id || 'N/A',
      studentRegNo: studentRegNo,
      studentName: studentName,
      programmeCode: obligation.programme_code || 'N/A',
      studentYear: obligation.student_year || 1,
      studentTerm: obligation.student_term || 1,
      obligationType: obligation.obligation_type || 'term',
      feeVersion: obligation.enrollment?.feeStructure?.version_label || 'N/A',
      totalAmount: totalAmount,
      totalPaid: totalPaid,
      totalBalance: totalBalance,
      status: obligation.status || 'unpaid',
      isOverpaid: totalBalance < 0,
      voteHeads: voteHeads,
      payments: payments,
      paymentDate: payments.length > 0 ? payments[0].paymentDate : 'N/A',
      fundingSources: Array.from(fundingSources),
      hasMultipleSources: fundingSources.size > 1,
    };
  } catch (error) {
    logger.error('Error generating receipt data:', error.message);
    throw error;
  }
};




/**
 * Escape a value for safe insertion into HTML text/attribute content.
 */
const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const money = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
};

// ─── Shared style block (voucher-matched palette, print-hardened) ────────────
const SHARED_STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 210mm;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 9.5pt;
    color: #1e293b;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  :root {
    --accent:   #0a6ebd;
    --accent-l: #dbeafe;
    --accent-m: #93c5e8;
    --rule:     #64748b;
    --label:    #475569;
    --body:     #1e293b;
    --grey-bg:  #f1f5f9;
    --grey-mid: #e6ecf3;
    --green:    #0f766e;
    --green-bg: #e6f7f2;
    --red:      #b91c1c;
    --red-bg:   #fde8e8;
    --amber:    #92400e;
    --amber-bg: #fef3d6;
    --blue-bg:  #dbeafe;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 8mm 13mm;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  /* ── HEADER (logos) ── */
  .hdr {
    display: flex; align-items: center; gap: 7mm;
    padding-bottom: 4mm; border-bottom: 2.5pt solid var(--accent);
    margin-bottom: 4mm; flex-shrink: 0;
  }
  .hdr-img { width: 16mm; height: 16mm; object-fit: contain; flex-shrink: 0; }
  .hdr-center { flex: 1; text-align: center; }
  .hdr-center .dept    { font-size: 7pt; color: var(--body); font-weight: 600; letter-spacing: 1.1px; text-transform: uppercase; margin-bottom: 1mm; }
  .hdr-center .name    { font-size: 13pt;  font-weight: 700; color: var(--body); line-height: 1.2; }
  .hdr-center .contact { font-size: 7pt; color: var(--body); margin-top: 1mm; font-weight: 600; }

  /* ── TITLE BAND ── */
  .title-band {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--accent); color: #fff;
    border-radius: 3pt; padding: 3mm 5mm; margin-bottom: 4mm;
  }
  .title-band .doc-title,
  .title-band .receipt-no { font-size: 10pt; font-weight: 700; line-height: 1; }
  .title-band .receipt-no { text-align: right; }

  .date-row {
    display: flex; justify-content: space-between; margin-bottom: 4mm;
    font-size: 8.5pt; color: var(--label); font-weight: 600;
  }
  .date-row span b { color: var(--body); }

  .section { margin-bottom: 4mm; }
  .section-heading {
    font-size: 6pt; font-weight: 700; color: #fff;
    text-transform: uppercase; letter-spacing: 1.6px;
    background: var(--label);
    display: inline-block; padding: 1mm 2.8mm;
    border-radius: 2pt; margin-bottom: 2.5mm;
  }

  /* ── INFO CARD ── */
  .info-card {
    background: var(--grey-bg); border: 1.25pt solid var(--rule);
    border-radius: 3pt; padding: 3mm 4mm;
    display: grid; grid-template-columns: 32mm 1fr 32mm 1fr;
    gap: 2mm 3mm; align-items: baseline;
  }
  .info-card .fl { font-size: 7pt; color: var(--label); font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
  .info-card .fv { font-size: 9.5pt; color: var(--body);  font-weight: 500; }

  /* ── SUMMARY BOXES ── */
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm; }
  .summary-box {
    background: var(--grey-bg); border: 1.25pt solid var(--rule); border-radius: 3pt;
    padding: 3mm; text-align: center;
  }
  .summary-box .sl { font-size: 7pt; font-weight: 700; color: var(--label); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 1mm; }
  .summary-box .sv { font-size: 13pt; font-weight: 700; color: var(--accent); }
  .summary-box .sv.positive { color: var(--green); }
  .summary-box .sv.negative { color: var(--red); }

  /* ── TABLE (thick, print-safe borders) ── */
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  thead tr th {
    font-size: 7pt; font-weight: 700; color: #fff;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 2.2mm 2.8mm; background: var(--label);
    border: 1.25pt solid var(--body); text-align: left;
  }
  thead tr th.r { text-align: right; }
  tbody tr td {
    padding: 2.4mm 2.8mm; color: var(--body);
    border: 1pt solid var(--rule); vertical-align: top;
  }
  tbody tr.alt td { background: var(--grey-bg); }
  tbody tr td.r   { text-align: right; }
  .total-row td {
    font-weight: 700; font-size: 9.5pt; padding: 2.4mm 2.8mm;
    border: 1.5pt solid var(--body) !important;
    background: var(--accent-l) !important; color: var(--accent);
  }
  .total-row td.r { text-align: right; }
  .empty-note { text-align: center; color: var(--label); font-style: italic; }

  .status-badge {
    display: inline-block; padding: 0.8mm 2.5mm; border-radius: 8pt;
    font-size: 7.5pt; font-weight: 700; text-transform: uppercase;
    border: 1pt solid currentColor;
  }
  .status-badge.cleared  { background: var(--green-bg); color: var(--green); }
  .status-badge.partial  { background: var(--amber-bg); color: var(--amber); }
  .status-badge.unpaid   { background: var(--red-bg);   color: var(--red); }
  .status-badge.overpaid { background: var(--blue-bg);  color: var(--accent); }

  /* ── ACKNOWLEDGEMENT BAR (sponsor) ── */
  .ack-bar {
    background: var(--accent-l); border: 1.5pt solid var(--accent-m);
    border-left: 4pt solid var(--accent);
    border-radius: 0 3pt 3pt 0; padding: 4mm 5mm; margin-bottom: 3mm; text-align: center;
  }
  .ack-bar h3 { color: var(--accent); font-size: 10pt; margin-bottom: 2mm; letter-spacing: .5px; }
  .ack-bar p { color: var(--body); font-size: 9.5pt; line-height: 1.7; }
  .ack-bar .warn { color: var(--red); font-weight: 700; }

  .funding-sources {
    display: flex; align-items: center; gap: 2mm; flex-wrap: wrap;
    background: var(--grey-bg); border: 1.25pt solid var(--rule); border-radius: 3pt;
    padding: 2.5mm 3.5mm; margin-bottom: 3mm;
  }
  .funding-sources .fs-label { font-size: 7pt; font-weight: 700; color: var(--label); text-transform: uppercase; letter-spacing: .5px; }
  .funding-source-tag {
    display: inline-block; background: var(--accent); color: #fff;
    padding: 1mm 3mm; border-radius: 8pt; font-size: 8pt; font-weight: 600;
  }
  .fs-note { font-size: 7.5pt; color: var(--label); font-style: italic; }

  .footer {
    margin-top: auto; padding-top: 4mm; border-top: 1.25pt solid var(--rule);
    text-align: center; font-size: 7.5pt; color: var(--label);
  }
  .footer .powered { color: var(--accent); font-weight: 700; margin-top: 1mm; }

  @media print {
    html, body { width: 210mm; margin: 0; padding: 0; }
    .page { padding: 7mm 12mm; }
  }
`;

const voteHeadRowHtml = (vh, index, showStatus) => `
  <tr class="${index % 2 === 1 ? "alt" : ""}">
    <td>${index + 1}</td>
    <td>${escapeHtml(vh.name)}</td>
    <td class="r">${money(vh.assessed)}</td>
    <td class="r">${money(vh.paid)}</td>
    <td class="r">${money(vh.balance)}</td>
    ${showStatus ? `<td style="text-align:center;"><span class="status-badge ${escapeHtml(vh.status)}">${escapeHtml(vh.status)}</span></td>` : ""}
  </tr>`;

const voteHeadTableHtml = (voteHeads, totals, showStatus) => `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Vote Head</th>
        <th class="r">Assessed (KES)</th>
        <th class="r">Paid (KES)</th>
        <th class="r">Balance (KES)</th>
        ${showStatus ? '<th style="text-align:center;">Status</th>' : ""}
      </tr>
    </thead>
    <tbody>
      ${voteHeads.length > 0
        ? voteHeads.map((vh, i) => voteHeadRowHtml(vh, i, showStatus)).join("")
        : `<tr><td colspan="${showStatus ? 6 : 5}" class="empty-note">No vote heads found</td></tr>`}
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td class="r">${money(totals.totalAmount)}</td>
        <td class="r">${money(totals.totalPaid)}</td>
        <td class="r">${money(totals.totalBalance)}</td>
        ${showStatus ? `<td style="text-align:center;"><span class="status-badge ${escapeHtml(totals.status)}">${escapeHtml(totals.status)}</span></td>` : ""}
      </tr>
    </tbody>
  </table>`;

const headerHtml = () => `
  <div class="hdr">
    ${LOGO_COA ? '<img src="' + LOGO_COA + '" class="hdr-img" />' : ""}
    <div class="hdr-center">
      <div class="dept">State Department For Technical and Vocational Education &amp; Training</div>
      <div class="name">Riatirimba Technical and Vocational College</div>
      <div class="contact">P.O. Box 25 – 40201 Gesusu &nbsp;·&nbsp; 0757 331 085 &nbsp;·&nbsp; info@riatirimbatvc.ac.ke</div>
    </div>
    ${LOGO_TVC ? '<img src="' + LOGO_TVC + '" class="hdr-img" />' : ""}
  </div>`;

const studentInfoCardHtml = (data) => `
  <div class="info-card">
    <span class="fl">Student Name</span><span class="fv">${escapeHtml(data.studentName)}</span>
    <span class="fl">Registration No</span><span class="fv">${escapeHtml(data.studentRegNo)}</span>
    <span class="fl">Student ID</span><span class="fv">${escapeHtml(data.studentId)}</span>
    <span class="fl">Programme</span><span class="fv">${escapeHtml(data.programmeCode)}</span>
    <span class="fl">Academic Year</span><span class="fv">${escapeHtml(data.studentYear)}</span>
    <span class="fl">Term</span><span class="fv">${escapeHtml(data.studentTerm)}</span>
    <span class="fl">Obligation Type</span><span class="fv">${escapeHtml(data.obligationType)}</span>
    <span class="fl">Fee Version</span><span class="fv">${escapeHtml(data.feeVersion)}</span>
  </div>`;

const summaryGridHtml = (data) => `
  <div class="summary-grid">
    <div class="summary-box">
      <div class="sl">Total Assessed</div>
      <div class="sv">${money(data.totalAmount)}</div>
    </div>
    <div class="summary-box">
      <div class="sl">Total Paid</div>
      <div class="sv positive">${money(data.totalPaid)}</div>
    </div>
    <div class="summary-box">
      <div class="sl">Balance</div>
      <div class="sv ${data.isOverpaid ? "negative" : ""}">${money(data.totalBalance)}</div>
    </div>
  </div>`;

/**
 * Build the STUDENT receipt HTML.
 * @param {object} data
 * @param {{showStatus?: boolean}} [options] - showStatus toggles the per-votehead
 *   and total status badge column. Defaults to true; pass { showStatus: false }
 *   to hide it without touching the data layer.
 */
const buildStudentReceiptHtml = (data, options = {}) => {
  const showStatus = options.showStatus !== false;
  if (!data) {
    return '<html><body><h1>Error: No receipt data available</h1></body></html>';
  }
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Fee Payment Receipt ${escapeHtml(data.receiptNumber)}</title>
<style>${SHARED_STYLE}</style>
</head>
<body>
<div class="page">
  ${headerHtml()}

  <div class="title-band">
    <span class="doc-title">Fee Payment Receipt</span>
    <span class="receipt-no">#${escapeHtml(data.receiptNumber)}</span>
  </div>

  <div class="date-row">
    <span>Generated: <b>${escapeHtml(data.generatedDate)}</b></span>
    <span>Payment Date: <b>${escapeHtml(data.paymentDate)}</b></span>
  </div>

  <div class="section">
    <div class="section-heading">Student Details</div>
    ${studentInfoCardHtml(data)}
  </div>

  <div class="section">
    <div class="section-heading">Summary</div>
    ${summaryGridHtml(data)}
  </div>

  <div class="section">
    <div class="section-heading">Vote Head Distribution</div>
    ${voteHeadTableHtml(data.voteHeads || [], data, showStatus)}
  </div>

  <div class="footer">
    <p>This is a system-generated receipt. Please keep for your records.</p>
    <p class="powered">Riatirimba Finance System</p>
  </div>
</div>
</body>
</html>`;
};

/**
 * Build the SPONSOR receipt HTML — same visual language as the student
 * receipt, but summary-only: acknowledgement statement + totals + funding
 * source tags. No vote head breakdown, no per-payment listing.
 * @param {object} data
 * @param {{showStatus?: boolean}} [options] - showStatus toggles the overall
 *   status badge shown in the acknowledgement summary. Defaults to true.
 */
const buildSponsorReceiptHtml = (data, options = {}) => {
  const showStatus = options.showStatus !== false;
  if (!data) {
    return '<html><body><h1>Error: No receipt data available</h1></body></html>';
  }
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Sponsor Payment Acknowledgement ${escapeHtml(data.receiptNumber)}</title>
<style>${SHARED_STYLE}</style>
</head>
<body>
<div class="page">
  ${headerHtml()}

  <div class="title-band">
    <span class="doc-title">Sponsor Payment Acknowledgement</span>
    <span class="receipt-no">#${escapeHtml(data.receiptNumber)}</span>
  </div>

  <div class="date-row">
    <span>Generated: <b>${escapeHtml(data.generatedDate)}</b></span>
    <span>Payment Date: <b>${escapeHtml(data.paymentDate)}</b></span>
  </div>

  <div class="section">
    <div class="section-heading">Student Details</div>
    ${studentInfoCardHtml(data)}
  </div>

  <div class="section">
    <div class="ack-bar">
      <h3>✔ PAYMENT ACKNOWLEDGEMENT</h3>
      <p>
        This is to acknowledge that a payment of <b>KES ${money(data.totalPaid)}</b>
        has been received for <b>${escapeHtml(data.studentName)}</b> (${escapeHtml(data.studentRegNo)})
        towards <b>${escapeHtml(data.obligationType)}</b> fees for
        <b>Year ${escapeHtml(data.studentYear)}, Term ${escapeHtml(data.studentTerm)}</b>.
        ${data.isOverpaid ? `<br><span class="warn">Note: an overpayment of KES ${money(Math.abs(data.totalBalance))} has been credited to the student's account.</span>` : ""}
      </p>
      ${showStatus ? `<div style="margin-top:2mm;"><span class="status-badge ${escapeHtml(data.status)}">${escapeHtml(data.status)}</span></div>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-heading">Summary</div>
    ${summaryGridHtml(data)}
  </div>

  ${(data.fundingSources && data.fundingSources.length > 0) ? `
  <div class="section">
    <div class="funding-sources">
      <span class="fs-label">Funding Source(s)</span>
      ${data.fundingSources.map(src => `<span class="funding-source-tag">${escapeHtml(src)}</span>`).join('')}
      ${data.hasMultipleSources ? '<span class="fs-note">(multiple funding sources detected)</span>' : ''}
    </div>
  </div>` : ""}

  <div class="footer">
    <p>This is a system-generated acknowledgement for sponsor/third-party records.</p>
    <p class="powered">Riatirimba Finance System</p>
  </div>
</div>
</body>
</html>`;
};

/**
 * Generate PDF receipt using Puppeteer.
 * @param {string} obligationId
 * @param {'student'|'sponsor'} [type]
 * @param {{showStatus?: boolean}} [options] - forwarded to the HTML builders;
 *   pass { showStatus: false } to hide the status badge(s) on the printout.
 */
const generatePDF = async (obligationId, type = 'student', options = {}) => {
  let browser;
  try {
    logger.info(`Generating ${type} PDF receipt for obligation ${obligationId}`);

    const data = await generateReceiptData(obligationId);

    if (!data) {
      throw new Error(`No receipt data generated for obligation ${obligationId}`);
    }

    const html = type === 'sponsor'
      ? buildSponsorReceiptHtml(data, options)
      : buildStudentReceiptHtml(data, options);

    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    return Buffer.from(pdfData);
  } catch (error) {
    logger.error(`Error generating ${type} PDF:`, error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

/**
 * Get receipt as JSON
 */
const getReceiptJSON = async (obligationId) => {
  return await generateReceiptData(obligationId);
};

/**
 * Get receipt as PDF buffer
 */
const getReceiptPDF = async (obligationId, type = 'student', options = {}) => {
  return await generatePDF(obligationId, type, options);
};

module.exports = {
  generateReceiptData,
  generatePDF,
  getReceiptJSON,
  getReceiptPDF,
};