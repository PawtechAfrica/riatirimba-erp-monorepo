const API = '/api/vouchers';

// ─── Tab navigation ───────────────────────────────────────────────────────────

function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');

  const btns = document.querySelectorAll('.nav-btn');
  const map = { create: 0, list: 1 };
  if (btns[map[name]]) btns[map[name]].classList.add('active');

  if (name === 'list') loadVouchers();
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function toast(msg, color = '#1e293b') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.background = color;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

// ─── Dynamic row helpers ──────────────────────────────────────────────────────

function addItemRow() {
  document.getElementById('itemsBody').insertAdjacentHTML('beforeend', `
    <tr>
      <td><input type="date" name="item_date" /></td>
      <td><input type="text" name="item_particulars" placeholder="Description" /></td>
      <td><input type="number" name="item_kshs" min="0" placeholder="0" /></td>
      <td><input type="number" name="item_cts" min="0" max="99" placeholder="00" /></td>
      <td><button type="button" class="btn-del" onclick="removeRow(this)">✕</button></td>
    </tr>`);
}

function addVhRow() {
  document.getElementById('vhBody').insertAdjacentHTML('beforeend', `
    <tr>
      <td><input type="date" name="vh_date" /></td>
      <td><input type="text" name="vh_votehead" placeholder="Votehead description" /></td>
      <td><input type="number" name="vh_kshs" min="0" placeholder="0" /></td>
      <td><input type="number" name="vh_cts" min="0" max="99" placeholder="00" /></td>
      <td><button type="button" class="btn-del" onclick="removeRow(this)">✕</button></td>
    </tr>`);
}

function removeRow(btn) {
  const tbody = btn.closest('tbody');
  if (tbody.rows.length > 1) {
    btn.closest('tr').remove();
  }
}

// ─── Payment Method Handler ───────────────────────────────────────────────────

function handlePaymentMethodChange() {
  const select = document.getElementById('paymentMethod');
  const container = document.getElementById('paymentDetailsContainer');
  const input = document.getElementById('paymentDetails');
  const label = document.getElementById('paymentDetailsLabel');
  const hint = document.getElementById('paymentDetailsHint');

  const value = select.value;

  // Clear previous value
  input.value = '';

  if (!value) {
    container.style.display = 'none';
    input.removeAttribute('required');
    return;
  }

  container.style.display = 'block';

  switch (value) {
    case 'CASH':
      label.textContent = 'Cash Amount (Kshs)';
      input.placeholder = 'Enter cash amount';
      hint.textContent = 'Cash amount will be automatically populated from total Kshs';
      input.setAttribute('type', 'number');
      input.setAttribute('min', '0');
      input.removeAttribute('maxlength');
      // Auto-populate with total Kshs from items
      autoPopulateCashAmount();
      break;

    case 'ONLINE':
      label.textContent = 'EFT Reference (Optional)';
      input.placeholder = 'Enter EFT reference number, if available';
      hint.textContent = 'Optional — leave blank if you don\'t have a reference yet';
      input.setAttribute('type', 'text');
      input.removeAttribute('min');
      input.setAttribute('maxlength', '50');
      break;

    case 'KCB_OPERATIONS':
      label.textContent = 'KCB Operations Cheque No.';
      input.placeholder = 'Enter 4-digit cheque number';
      hint.textContent = 'Enter a 4-digit cheque number (e.g., 1234)';
      input.setAttribute('type', 'text');
      input.removeAttribute('min');
      input.setAttribute('maxlength', '4');
      input.setAttribute('pattern', '[0-9]{4}');
      break;

    case 'KCB_DEVELOPMENT':
      label.textContent = 'KCB Development Cheque No.';
      input.placeholder = 'Enter 4-digit cheque number';
      hint.textContent = 'Enter a 4-digit cheque number (e.g., 5678)';
      input.setAttribute('type', 'text');
      input.removeAttribute('min');
      input.setAttribute('maxlength', '4');
      input.setAttribute('pattern', '[0-9]{4}');
      break;

    case 'EQUITY_BANK':
      label.textContent = 'Equity Bank Cheque No.';
      input.placeholder = 'Enter 4-digit cheque number';
      hint.textContent = 'Enter a 4-digit cheque number (e.g., 9012)';
      input.setAttribute('type', 'text');
      input.removeAttribute('min');
      input.setAttribute('maxlength', '4');
      input.setAttribute('pattern', '[0-9]{4}');
      break;

    default:
      container.style.display = 'none';
      input.removeAttribute('required');
  }
}

// Auto-populate cash amount from total Kshs
function autoPopulateCashAmount() {
  const itemsBody = document.getElementById('itemsBody');
  let totalKshs = 0;

  itemsBody.querySelectorAll('tr').forEach(row => {
    const kshsInput = row.querySelector('[name="item_kshs"]');
    if (kshsInput && kshsInput.value) {
      totalKshs += parseFloat(kshsInput.value) || 0;
    }
  });

  const cashInput = document.getElementById('paymentDetails');
  if (cashInput && totalKshs > 0) {
    cashInput.value = totalKshs.toFixed(2);
  }
}

// Keep the cash amount in sync as line items change
document.addEventListener('input', e => {
  if (e.target.name === 'item_kshs') {
    const paymentMethod = document.getElementById('paymentMethod').value;
    if (paymentMethod === 'CASH') {
      autoPopulateCashAmount();
    }
  }
});

// ─── Build payload from form ──────────────────────────────────────────────────

function collectForm() {
  const f = document.getElementById('voucherForm');
  const v = name => f.querySelector(`[name="${name}"]`)?.value.trim() || '';
  const getSelect = name => f.querySelector(`[name="${name}"]`)?.value || '';

  // Particulars rows
  const lineItems = [];
  f.querySelectorAll('#itemsBody tr').forEach(row => {
    const date = row.querySelector('[name="item_date"]')?.value || '';
    const particulars = row.querySelector('[name="item_particulars"]')?.value.trim() || '';
    const kshs = row.querySelector('[name="item_kshs"]')?.value;
    const cts = row.querySelector('[name="item_cts"]')?.value;
    if (particulars || kshs) {
      lineItems.push({ date, particulars, kshs: kshs ? Number(kshs) : null, cts: cts ? Number(cts) : null });
    }
  });

  // Votehead rows
  const voteheadItems = [];
  f.querySelectorAll('#vhBody tr').forEach(row => {
    const date = row.querySelector('[name="vh_date"]')?.value || '';
    const expenditureVotehead = row.querySelector('[name="vh_votehead"]')?.value.trim() || '';
    const kshs = row.querySelector('[name="vh_kshs"]')?.value;
    const cts = row.querySelector('[name="vh_cts"]')?.value;
    if (expenditureVotehead || kshs) {
      voteheadItems.push({ date, expenditureVotehead, kshs: kshs ? Number(kshs) : null, cts: cts ? Number(cts) : null });
    }
  });

  return {
    date: v('date'),
    payeeName: v('payeeName'),
    payeeAddress: v('payeeAddress'),
    accountName: v('accountName'),
    lineItems,
    amountInWords: v('amountInWords'),
    paymentMethod: getSelect('paymentMethod'),
    paymentDetails: v('paymentDetails'),
    voteheadItems,
    preparedBy: v('preparedBy'),
    preparedDate: v('preparedDate'),
    approvedBy: v('approvedBy'),
    approvedDate: v('approvedDate'),
    receivedSum: v('receivedSum'),
    receivedCashOrCheque: getSelect('receivedCashOrCheque'),
    receiverIdNo: v('receiverIdNo'),
    receivedDate: v('receivedDate'),
    authorizedDate: v('authorizedDate'),
  };
}

// ─── Create single voucher ────────────────────────────────────────────────────

document.getElementById('voucherForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = collectForm();

  if (!payload.payeeName || !payload.date) {
    toast('Payee name and date are required', '#e02424');
    return;
  }

  // Validate payment method specific requirements.
  // Note: ONLINE has no required reference — the EFT field is optional.
  if (payload.paymentMethod === 'CASH') {
    if (!payload.paymentDetails || parseFloat(payload.paymentDetails) <= 0) {
      toast('Cash amount is required and must be greater than 0', '#e02424');
      return;
    }
  } else if (['KCB_OPERATIONS', 'KCB_DEVELOPMENT', 'EQUITY_BANK'].includes(payload.paymentMethod)) {
    if (!payload.paymentDetails || payload.paymentDetails.length !== 4) {
      toast('4-digit cheque number is required', '#e02424');
      return;
    }
  }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed');

    toast(`✅ Saved as ${data.voucherNo}`);

    // Open PDF in new tab immediately
    window.open(`${API}/${data.id}/pdf`, '_blank');

    // Reset form after successful save
    e.target.reset();

    // Reset payment details container
    document.getElementById('paymentDetailsContainer').style.display = 'none';
    document.getElementById('paymentMethod').value = '';

    // Reset dynamic rows to single empty row
    document.getElementById('itemsBody').innerHTML = `
      <tr>
        <td><input type="date" name="item_date" /></td>
        <td><input type="text" name="item_particulars" placeholder="Description" /></td>
        <td><input type="number" name="item_kshs" min="0" placeholder="0" /></td>
        <td><input type="number" name="item_cts" min="0" max="99" placeholder="00" /></td>
        <td><button type="button" class="btn-del" onclick="removeRow(this)">✕</button></td>
      </tr>`;
    document.getElementById('vhBody').innerHTML = `
      <tr>
        <td><input type="date" name="vh_date" /></td>
        <td><input type="text" name="vh_votehead" placeholder="Votehead description" /></td>
        <td><input type="number" name="vh_kshs" min="0" placeholder="0" /></td>
        <td><input type="number" name="vh_cts" min="0" max="99" placeholder="00" /></td>
        <td><button type="button" class="btn-del" onclick="removeRow(this)">✕</button></td>
      </tr>`;

  } catch (err) {
    toast('Error: ' + err.message, '#e02424');
  }
});

// ─── Load voucher list ────────────────────────────────────────────────────────

async function loadVouchers() {
  const tbody = document.getElementById('voucherBody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading…</td></tr>';

  try {
    const res = await fetch(API);
    const data = await res.json();

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading">No vouchers yet.</td></tr>';
      return;
    }

    const paymentMethodLabels = {
      'CASH': 'Cash',
      'ONLINE': 'Online',
      'KCB_OPERATIONS': 'KCB Ops',
      'KCB_DEVELOPMENT': 'KCB Dev',
      'EQUITY_BANK': 'Equity'
    };

    tbody.innerHTML = data.map(v => `
      <tr>
        <td><strong>${v.voucherNo}</strong></td>
        <td>${v.date || '—'}</td>
        <td>${v.payeeName || '—'}</td>
        <td style="font-size:.8rem;color:#6b7280">${v.amountInWords || '—'}</td>
        <td>${paymentMethodLabels[v.paymentMethod] || '—'}</td>
        <td style="font-size:.8rem">${v.paymentDetails || '—'}</td>
        <td>
          <button class="btn-sec" style="padding:5px 10px;font-size:.78rem"
            onclick="window.open('${API}/${v.id}/pdf','_blank')">🖨 PDF</button>
          <button class="btn-print-row" style="padding:5px 10px;font-size:.78rem"
            onclick="printVoucher(${v.id})">🖨 Print</button>
          <button class="btn-del" onclick="deleteVoucher(${v.id}, this)">✕</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading" style="color:#e02424">Error: ${err.message}</td></tr>`;
  }
}

// ─── Print single voucher ─────────────────────────────────────────────────────

async function printVoucher(id) {
  try {
    const res = await fetch(`${API}/${id}/pdf`);
    if (!res.ok) throw new Error('Failed to fetch PDF');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Open in new window and trigger print
    const printWindow = window.open(url, '_blank');
    printWindow.onload = function () {
      printWindow.print();
    };

    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('Printing voucher...', '#1e293b');
  } catch (err) {
    toast('Error: ' + err.message, '#e02424');
  }
}

async function deleteVoucher(id, btn) {
  if (!confirm('Delete this voucher?')) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    btn.closest('tr').remove();
    toast('Deleted');
  } catch (err) {
    toast('Error: ' + err.message, '#e02424');
  }
}

// ─── Auto-load vouchers on list tab ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tab-list').classList.contains('active')) {
    loadVouchers();
  }
});