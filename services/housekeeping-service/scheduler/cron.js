'use strict';

require('dotenv').config();

const cron    = require('node-cron');
const { log } = require('../utils/logger');

const { runBackupJob }        = require('../jobs/backup');
const { runDockerCleanupJob } = require('../jobs/dockerCleanup');

const BACKUP_CRON         = process.env.BACKUP_CRON;
const DOCKER_CLEANUP_CRON = process.env.DOCKER_CLEANUP_CRON;
const TIMEZONE            = process.env.CRON_TIMEZONE || 'Africa/Nairobi';

// ── Helper

function registerJob (name, envKey, expression, jobFn) {
  if (!expression) {
    throw new Error(`[scheduler] Missing ${envKey} in .env — cannot schedule "${name}"`);
  }
  if (!cron.validate(expression)) {
    throw new Error(`[scheduler] Invalid ${envKey}: "${expression}" — cannot schedule "${name}"`);
  }

  cron.schedule(expression, async () => {
    log(`[scheduler] ▶ Triggering: ${name} — ${new Date().toISOString()}`);
    try {
      await jobFn();
    } catch (err) {
      log(`[scheduler] ✗ Unhandled error in "${name}": ${err.message}`);
    }
  }, { timezone: TIMEZONE });

  log(`[scheduler] ✓ Registered: ${name} — "${expression}" (${TIMEZONE})`);
}

// ── Register all jobs

function startScheduler () {
  log('[scheduler] ===== Initialising housekeeping scheduler =====');
  log(`[scheduler] Timezone: ${TIMEZONE}`);

  registerJob('Database Backup', 'BACKUP_CRON',         BACKUP_CRON,         runBackupJob);
  registerJob('Docker Cleanup',  'DOCKER_CLEANUP_CRON', DOCKER_CLEANUP_CRON, runDockerCleanupJob);


  log('[scheduler] ===== All jobs registered — scheduler running =====\n');
}

module.exports = { startScheduler };