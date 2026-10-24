require('dotenv').config();

const supabase = require('../config/supabase');
const BUCKET         = process.env.SUPABASE_BUCKET || 'voucher-backups';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);

//Deletes voucher snapshots older than BACKUP_RETENTION_DAYS from Supabase.

async function cleanupSnapshots(cutoff) {
  const { data, error: fetchErr } = await supabase
    .from('voucher_snapshots')
    .select('id, voucher_no, backed_up_at')
    .lt('backed_up_at', cutoff.toISOString());

  if (fetchErr) {
    console.error('[cleanup] Failed to fetch old snapshots:', fetchErr.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('[cleanup] No old snapshots to remove.');
    return;
  }

  const ids = data.map(r => r.id);
  const { error: delErr } = await supabase
    .from('voucher_snapshots')
    .delete()
    .in('id', ids);

  if (delErr) {
    console.error('[cleanup] Failed to delete old snapshots:', delErr.message);
    return;
  }

  console.log(`[cleanup] ✓ Removed ${ids.length} old snapshot(s).`);
}

//Deletes voucher_pdf_backups and their Storage files older than BACKUP_RETENTION_DAYS.

async function cleanupPdfBackups(cutoff) {
  const { data, error: fetchErr } = await supabase
    .from('voucher_pdf_backups')
    .select('id, storage_path, file_name')
    .lt('backed_up_at', cutoff.toISOString())
    .eq('status', 'success');

  if (fetchErr) {
    console.error('[cleanup] Failed to fetch old PDF records:', fetchErr.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('[cleanup] No old PDF backups to remove.');
    return;
  }

  console.log(`[cleanup] Found ${data.length} old PDF backup(s) to remove.`);

  for (const record of data) {
    // 1. Delete the file from Supabase Storage
    const { error: storageErr } = await supabase.storage
      .from(BUCKET)
      .remove([record.storage_path]);

    if (storageErr) {
      console.error(`[cleanup] ✗ Storage delete failed for ${record.file_name}:`, storageErr.message);
      continue;   // skip DB cleanup if storage delete failed
    }

    // 2. Delete the metadata row
    await supabase
      .from('voucher_pdf_backups')
      .delete()
      .eq('id', record.id);

    console.log(`[cleanup] ✓ Removed: ${record.file_name}`);
  }
}
//Run full cleanup — removes records and files older than BACKUP_RETENTION_DAYS.

async function runCleanup() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  console.log(`\n[cleanup] ===== Starting cleanup — older than ${RETENTION_DAYS} days (before ${cutoff.toISOString()}) =====`);
try { 
  await cleanupSnapshots(cutoff);
  await cleanupPdfBackups(cutoff);

  console.log('[cleanup] ===== Cleanup complete =====\n');
}catch (err) {
  console.error('[cleanup] ===== Cleanup FAILED =====\n', err.message);
    throw err;
}
}

if (require.main === module) {
  runCleanup()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { runCleanup };