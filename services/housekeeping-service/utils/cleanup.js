'use strict';
const fs      = require('fs');
const path    = require('path');
const dayjs   = require('dayjs');
const { log } = require('./logger');

const BACKUP_DIR      = process.env.BACKUP_DIR      || '/app/backups';
const RETENTION_DAYS  = parseInt(process.env.RETENTION_DAYS || '7', 10);

function cleanupOldBackups () {
  if (!fs.existsSync(BACKUP_DIR)) {
    log(`[cleanup] ⚠ Backup directory not found: ${BACKUP_DIR} — skipping`);
    return;
  }

  const now  = dayjs();
  const dirs = fs.readdirSync(BACKUP_DIR);
  let removed = 0;

  dirs.forEach((dir) => {
    const full  = path.join(BACKUP_DIR, dir);
    const stats = fs.statSync(full);
    const age   = now.diff(dayjs(stats.mtime), 'day');

    if (age > RETENTION_DAYS) {
      fs.rmSync(full, { recursive: true, force: true });
      log(`[cleanup] ✓ Deleted old backup: ${dir}`);
      removed++;
    }
  });

  if (removed === 0) {
    log(`[cleanup] No old backups to remove (retention: ${RETENTION_DAYS} days)`);
  } else {
    log(`[cleanup] Removed ${removed} old backup folder(s)`);
  }
}

module.exports = { cleanupOldBackups };