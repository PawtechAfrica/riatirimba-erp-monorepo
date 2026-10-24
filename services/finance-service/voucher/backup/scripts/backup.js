require('dotenv').config();

const supabase = require('../config/supabase');

const { Vouchers } = require('../../database/models');


function serializeVoucher(voucher) {
  const plain = voucher.toJSON();

  if (typeof plain.lineItems === 'string') {
    try { plain.lineItems = JSON.parse(plain.lineItems); } catch { plain.lineItems = []; }
  }
  if (typeof plain.voteheadItems === 'string') {
    try { plain.voteheadItems = JSON.parse(plain.voteheadItems); } catch { plain.voteheadItems = []; }
  }

  return plain;
}

/**
 * Backup all voucher records from local PostgreSQL  to Supabase voucher_snapshots table.
 * Runs directly against the Sequelize model — no HTTP dependency.
 *
 * @param {string} source - 'auto' | 'manual'
 * @returns {{ success: number, failed: number }}
 */
async function backupVoucherRecords(source = 'auto') {
  console.log('[backup] Fetching all vouchers from local PostgreSQL...');

  let vouchers;
  try {
    vouchers = await Vouchers.findAll({ order: [['id', 'ASC']] });
  } catch (err) {
    console.error('[backup] Failed to query local DB:', err.message);
    throw err;
  }

  if (!vouchers.length) {
    console.log('[backup] No vouchers found — nothing to backup.');
    return { success: 0, failed: 0 };
  }

  console.log(`[backup] Found ${vouchers.length} voucher(s). Syncing to Supabase...`);

  let success = 0;
  let failed = 0;

  for (const voucher of vouchers) {
    const data = serializeVoucher(voucher);

    const row = {
      voucher_id:    data.id,
      voucher_no:    data.voucherNo,
      snapshot_data: data,                  
      source,
      has_pdf:       data.pdfGenerated || false,
    };

    const { error } = await supabase
      .from('voucher_snapshots')
      .insert(row);

    if (error) {
      console.error(`[backup] ✗ Failed to backup voucher #${data.id} (${data.voucherNo}):`, error.message);
      failed++;
    } else {
      console.log(`[backup] ✓ Backed up: ${data.voucherNo}`);
      success++;
    }
  }

// console warnings if vouchers did not get backed up to supabase
  if (failed > 0) {
    console.warn(`[backup] ${failed} voucher(s) failed to sync to backup!! - Check the Supabase connection or your table structure `);
  }

  console.log(`[backup] Records done — ✓ ${success} succeeded · ✗ ${failed} failed`);
  return { success, failed };
}


 //* Full backup entry point.
async function runBackup(source = 'auto') {
  console.log(`\n[backup] ===== Starting backup — ${new Date().toISOString()} =====`);

  try {
    const result = await backupVoucherRecords(source);
    console.log(`[backup] ===== Backup complete =====\n`);
    return result;
  } catch (err) {
    console.error('[backup] ===== Backup FAILED =====\n', err.message);
    throw err;
  }
}

// Allow running directly: node backup/scripts/backup.js
if (require.main === module) {
  runBackup('manual')
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runBackup, backupVoucherRecords };