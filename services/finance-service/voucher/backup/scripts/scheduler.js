require('dotenv').config();

const cron = require('node-cron');
const { runBackup }  = require('./backup');
const { runCleanup } = require('./cleanup');

const BACKUP_CRON  = process.env.BACKUP_CRON;
const CLEANUP_CRON = process.env.CLEANUP_CRON;
const TIMEZONE = process.env.BACKUP_TIMEZONE || 'EAT Nairobi/Africa';

//Validate cron expressions on startup 
if (!BACKUP_CRON) {
  throw new Error('[scheduler] Missing BACKUP_CRON in .env');
}
if (!CLEANUP_CRON) {
  throw new Error('[scheduler] Missing CLEANUP_CRON in .env');
}
if (!cron.validate(BACKUP_CRON)) {
  throw new Error(`[scheduler] Invalid BACKUP_CRON expression: "${BACKUP_CRON}"`);
}
if (!cron.validate(CLEANUP_CRON)) {
  throw new Error(`[scheduler] Invalid CLEANUP_CRON expression: "${CLEANUP_CRON}"`);
}

// Midnight backup — runs every day at 00:00
cron.schedule(BACKUP_CRON, async () => {
  console.log(`[scheduler] Midnight backup triggered — ${new Date().toISOString()}`);
  try {
    await runBackup('auto');
  } catch (err) {
    console.error('[scheduler] Backup failed:', err.message);
  }
}, {timezone: TIMEZONE});

// Weekly cleanup every Sunday at 01:00 EAT
cron.schedule(CLEANUP_CRON, async () => {
  console.log(`[scheduler] Weekly cleanup triggered — ${new Date().toISOString()}`);
  try {
    await runCleanup();
  } catch (err) {
    console.error('[scheduler] Cleanup failed:', err.message);
  }
}, {timezone: TIMEZONE});

console.log('[scheduler] Voucher backup scheduler started.');
console.log('[scheduler] Backup: daily at midnight EAT (Africa/Nairobi)');
console.log('[scheduler] Cleanup: every Sunday at 01:00 EAT');