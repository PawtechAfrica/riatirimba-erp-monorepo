'use strict';

const fs      = require('fs');
const path    = require('path');
const { exec, execSync } = require('child_process');
const dayjs   = require('dayjs');

const { sendTelegram }      = require('../utils/telegram');
const { cleanupOldBackups } = require('../utils/cleanup');
const { log }               = require('../utils/logger');

const dbs           = require('../dbs.json');
const BACKUP_DIR    = process.env.BACKUP_DIR    || '/app/backups';
const RCLONE_REMOTE = process.env.RCLONE_REMOTE || 'riatirimba-db';
const B2_BUCKET     = process.env.B2_BUCKET     || 'Riatirimba-database-backups';

const MAX_DUMP_ATTEMPTS = 5;
const RETRY_DELAY_MS    = 5000; // 5 seconds between retries

// ── Helpers

function resolveUploadFolder () {
  const today = dayjs();
  if (today.date() === 1) return 'monthly';
  if (today.day()  === 0) return 'weekly';
  return 'daily';
}

function capitalise (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function isDbNotReadyError (message) {
  return (
    message.includes('starting up') ||               // postgres: "the database system is starting up"
    message.includes('Connection refused') ||         // postgres: connection refused
    message.includes("Can't connect to server") ||    // mysql: connection refused
    message.includes('could not translate host name')  // DNS not resolved yet (container just created)
  );
}

// Dump (single attempt)

function dumpDatabaseOnce (db) {
  const date     = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  const folder   = path.join(BACKUP_DIR, date);
  fs.mkdirSync(folder, { recursive: true });
  const filePath = path.join(folder, `${db.name}.tar`);

  let dumpCommand;

  if (db.type === 'postgres') {
    // PGPASSWORD passed via env object for both windows and linux machines
    dumpCommand = `pg_dump -h ${db.host} -U ${db.user} -d ${db.database} -F tar -f "${filePath}"`;
  } else if (db.type === 'mysql') {
    const tempSql = path.join(folder, `${db.name}.sql`);
    dumpCommand = `mysqldump -h ${db.host} -u${db.user} -p${db.password} --skip-ssl ${db.database} > "${tempSql}" && tar -cf "${filePath}" -C "${folder}" ${db.name}.sql && rm "${tempSql}"`;
  } else {
    return Promise.reject(new Error(`Unknown DB type for ${db.name}: ${db.type}`));
  }

  const execEnv = {
    ...process.env,
    PGPASSWORD: db.password,  // safe cross-platform password passing
  };

  return new Promise((resolve, reject) => {
    exec(dumpCommand, { env: execEnv }, (err) => {
      if (err) return reject(err);
      resolve(filePath);
    });
  });
}

// ── Dump (with retry for "not ready yet" errors)
async function dumpDatabase (db, attempt = 1) {
  log(`[backup] 📦 Dumping ${db.name}... (attempt ${attempt}/${MAX_DUMP_ATTEMPTS})`);

  try {
    const filePath = await dumpDatabaseOnce(db);
    log(`[backup] ✓ ${db.name} dumped → ${filePath}`);
    return filePath;

  } catch (err) {
    const notReady = isDbNotReadyError(err.message);

    if (notReady && attempt < MAX_DUMP_ATTEMPTS) {
      log(`[backup] ⏳ ${db.name} not ready yet — retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
      return dumpDatabase(db, attempt + 1);
    }

    log(`[backup] ✗ Dump failed for ${db.name}: ${err.message}`);
    throw err;
  }
}

// Upload

async function uploadToRclone (filePath, db, folder) {
  const destPath = `${RCLONE_REMOTE}:${B2_BUCKET}/${folder}/`;
  const fileName = path.basename(filePath);

  log(`[backup] ☁ Uploading ${fileName} → ${destPath}`);

  try {
    execSync(`rclone copy "${filePath}" "${destPath}" --progress`);
    log(`[backup] ✓ Uploaded ${fileName} to ${folder}`);
    await sendTelegram(`✅ ${capitalise(folder)} Backup successful for ${db.name}`);
  } catch (err) {
    log(`[backup] ✗ Upload failed for ${fileName}: ${err.message}`);
    await sendTelegram(`❌ ${capitalise(folder)} Backup failed for ${db.name}: ${err.message}`);
    throw err;
  }
}

// ── Main job ─────────────────────────────────────────────────

async function runBackupJob () {
  log('[backup] ===== Starting backup job =====');

  const folder = resolveUploadFolder();
  const failed = [];

  for (const db of dbs) {
    try {
      const dumpPath = await dumpDatabase(db);
      await uploadToRclone(dumpPath, db, folder);
    } catch (err) {
      failed.push(db.name);
      // Only send here if dumpDatabase exhausted all retries and threw —
      // uploadToRclone already sends its own alert on upload failure
      if (!err.message.includes('rclone')) {
        await sendTelegram(`❌ ${capitalise(folder)} Backup failed for ${db.name}: ${err.message}`);
      }
    }
  }

  try {
    cleanupOldBackups();
  } catch (err) {
    log(`[backup] ⚠ Local cleanup failed: ${err.message}`);
  }

  if (failed.length > 0) {
    log(`[backup] ⚠ ${failed.length} DB(s) failed: ${failed.join(', ')}`);
  }

  log('[backup] ===== Backup job complete =====\n');
}

module.exports = { runBackupJob };