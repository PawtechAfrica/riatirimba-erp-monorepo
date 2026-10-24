require('dotenv').config();

const { log }            = require('./utils/logger');
const { runBackupJob }   = require('./jobs/backup');
const { startScheduler } = require('./scheduler/cron');

async function main () {
  log('[housekeeping] ===== housekeeping-service starting =====');

  // Run an immediate backup on startup — mirrors original src/index.js behaviour
  log('[housekeeping] Running initial backup on startup...');
  try {
    await runBackupJob();
  } catch (err) {
    // A startup backup failure must not prevent the scheduler from starting
    log(`[housekeeping] ⚠ Initial backup failed: ${err.message}`);
  }

  // Start all scheduled jobs
  startScheduler();
}

main().catch((err) => {
  // Only truly unrecoverable startup errors reach here (e.g. bad .env cron expression)
  console.error('[housekeeping] ✗ Fatal error:', err.message);
  process.exit(1);
});