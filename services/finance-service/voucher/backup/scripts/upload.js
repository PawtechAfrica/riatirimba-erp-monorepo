require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const BUCKET = process.env.SUPABASE_BUCKET || 'voucher-backups';

/**
 * Upload a single voucher PDF file to Supabase Storage.
 * Records the result (success or failed) in Supabase voucher_pdf_backups table.
 *
 * @param {string} localFilePath  - Absolute path to the PDF on disk
 * @param {string} [voucherNo]    - e.g. 'rtvc/v/0003'. Inferred from filename if omitted.
 * @param {string} [source]       - 'auto' | 'manual' | 'watcher'
 * @returns {{ success: boolean, storagePath?: string, error?: string }}
 */
async function uploadVoucherPdf(localFilePath, voucherNo = null, source = 'manual') {
  const fileName  = path.basename(localFilePath);
  // console warining if file is not found 
  if (!fs.existsSync(localFilePath)) {
    console.error( `[upload] X File not found: ${localFilePath}`);
    return {success: false, error: "File not Found!!" };
  }
  const fileStats = fs.statSync(localFilePath);
  const fileBuffer = fs.readFileSync(localFilePath);

  // Infer voucherNo from filename
  const inferredNo  = voucherNo || fileName.replace(/\.pdf$/i, '').replace(/-/g, '/');

  // Namespaced path inside the bucket — timestamp prevents collisions on re-upload
  const storagePath = `vouchers/${Date.now()}_${fileName}`;

  console.log(`[upload] Uploading: ${fileName} → ${storagePath}`);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,    // never silently overwrite an existing backup
    });

  const status = uploadError ? 'failed' : 'success';

  if (uploadError) {
    console.error(`[upload] ✗ Storage upload failed: ${fileName}`, uploadError.message);
  }

  // Record metadata in Supabase voucher_pdf_backups table
  const { error: dbError } = await supabase
    .from('voucher_pdf_backups')
    .insert({
      voucher_no:      inferredNo,
      file_name:       fileName,
      storage_path:    storagePath,
      file_size_bytes: fileStats.size,
      source,
      status,
    });

    // console warning if the metadata for a file fails to be updated
  if (dbError) {
    console.warn(`[upload] File uploaded but DataBase record failed for ${fileName}:`, dbError.message);
  }

  if (!uploadError) {
    console.log(`[upload] ✓ Uploaded: ${fileName}`);
    return { success: true, storagePath };
  }

  return { success: false, error: uploadError.message };
}

module.exports = { uploadVoucherPdf };