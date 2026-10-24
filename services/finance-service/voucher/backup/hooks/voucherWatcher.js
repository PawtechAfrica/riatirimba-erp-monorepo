require('dotenv').config();

const chokidar = require('chokidar');
const path     = require('path');
const { uploadVoucherPdf } = require('../scripts/upload');

const VOUCHER_DIR = process.env.VOUCHER_LOCAL_DIR
  ? path.resolve(process.env.VOUCHER_LOCAL_DIR)
  : path.resolve(__dirname, '../../uploads');

/**
 * Watch the voucher uploads folder and upload any new or updated PDF
 * to Supabase Storage automatically.
 */
function startVoucherWatcher() {
  console.log(`[watcher] Watching for voucher PDFs in: ${VOUCHER_DIR}`);

  const watcher = chokidar.watch(VOUCHER_DIR, {
    persistent:    true,
    ignoreInitial: true,         // scheduler handles existing files at startup
    awaitWriteFinish: {          // wait for file to fully write before triggering
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  });

  watcher.on('add', async (filePath) => {
    if (!filePath.toLowerCase().endsWith('.pdf')) return;
    console.log(`[watcher] New PDF detected: ${path.basename(filePath)}`);
    const result = await uploadVoucherPdf(filePath, null, 'watcher').catch(err => {
      console.error(`[watcher] ✗✗ Upload Failed!! for ${path.basename(filePath)}:`, err.message);
    });
    if (result?.success) console.log(`[watcher] ✓ Upload complete!!: ${path.basename(filePath)}:`);
  });

  watcher.on('change', async (filePath) => {
  if (!filePath.toLowerCase().endsWith('.pdf')) return;
  console.log(`[watcher] PDF updated: ${path.basename(filePath)}`);
  const result = await uploadVoucherPdf(filePath, null, 'watcher').catch(err => {
    console.error(`[watcher] ✗ Upload failed for ${path.basename(filePath)}:`, err.message);
  });
  if (result?.success) console.log(`[watcher] ✓ Upload complete: ${path.basename(filePath)}`);
  });

  return watcher;
}

module.exports = { startVoucherWatcher };