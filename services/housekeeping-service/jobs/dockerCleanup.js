'use strict';

const { spawnSync } = require('child_process');
const { log }       = require('../utils/logger');

// Output parser 
function parsePruneOutput (output) {
  const summary = {
    containers:     0,
    images:         0,
    networks:       0,
    volumes:        0,
    spaceReclaimed: '0B',
  };

  if (!output) return summary;

  // Count full SHA256 lines → images
  const imageLines = output.match(/^sha256:[a-f0-9]{64}$/gm);
  summary.images = imageLines ? imageLines.length : 0;

  // Count 64-char hex IDs → containers
  const containerLines = output.match(/^[a-f0-9]{64}$/gm);
  summary.containers = containerLines ? containerLines.length : 0;

  // Count network names after the Deleted Networks section
  const networkSection = output.match(/Deleted Networks:\n([\s\S]*?)(\n\n|$)/);
  if (networkSection) {
    summary.networks = networkSection[1].trim().split('\n').filter(Boolean).length;
  }

  // Count volume names after the Deleted Volumes section
  const volumeSection = output.match(/Deleted Volumes:\n([\s\S]*?)(\n\n|$)/);
  if (volumeSection) {
    summary.volumes = volumeSection[1].trim().split('\n').filter(Boolean).length;
  }

  // Extract reclaimed space
  const spaceMatch = output.match(/Total reclaimed space:\s*(.+)/i);
  if (spaceMatch) summary.spaceReclaimed = spaceMatch[1].trim();

  return summary;
}

function formatRemoved (s) {
  const parts = [];
  if (s.containers > 0) parts.push(`${s.containers} container(s)`);
  if (s.images     > 0) parts.push(`${s.images} image(s)`);
  if (s.networks   > 0) parts.push(`${s.networks} network(s)`);
  if (s.volumes    > 0) parts.push(`${s.volumes} volume(s)`);
  return parts.length > 0 ? parts.join(', ') : 'nothing — already clean';
}

async function runDockerCleanupJob () {
  const startTime = new Date();
  const startStr  = startTime.toISOString().replace('T', ' ').slice(0, 16);

  log('[docker-cleanup] ===== Starting Docker cleanup =====');
  log(`[docker-cleanup] Started: ${startStr}`);

  let stdout  = '';
  let stderr  = '';
  let success = false;
  let summary = null;

  try {
    const result = spawnSync('docker', ['system', 'prune', '-af', '--volumes'], {
      encoding: 'utf8',
    });

    stdout = result.stdout || '';
    stderr = result.stderr || '';

    if (result.error) {
      throw new Error(result.error.message);
    }
    if (result.status !== 0) {
      throw new Error(stderr || `docker system prune exited with code ${result.status}`);
    }

    summary = parsePruneOutput(stdout);
    success = true;

  } catch (err) {
    // Non-fatal — log the error clearly but do not re-throw
    // so the scheduler continues running after any failure
    log(`[docker-cleanup] ✗ Cleanup failed: ${err.message}`);
  }

  const endTime   = new Date();
  const endStr    = endTime.toISOString().replace('T', ' ').slice(0, 16);
  const durationS = Math.round((endTime - startTime) / 1000);

  // ── Structured summary log
  log('[docker-cleanup] ─────────────────────────────────────');
  log(`[docker-cleanup] Started : ${startStr}`);
  log(`[docker-cleanup] Finished: ${endStr}`);

  if (success && summary) {
    log(`[docker-cleanup] Removed : ${formatRemoved(summary)}`);
    log(`[docker-cleanup] Space   : ${summary.spaceReclaimed} reclaimed`);
    log(`[docker-cleanup] Status  : Completed successfully`);
  } else {
    log(`[docker-cleanup] Status  : Failed — see error above`);
  }

  log(`[docker-cleanup] Duration: ${durationS} second(s)`);
  log('[docker-cleanup] ─────────────────────────────────────');

  // Print raw Docker output line by line for full traceability
  if (stdout) {
    log('[docker-cleanup] Docker output:');
    stdout.split('\n').forEach(line => {
      if (line.trim()) log(`[docker-cleanup]   ${line}`);
    });
  }

  log('[docker-cleanup] ===== Docker cleanup complete =====\n');
}

module.exports = { runDockerCleanupJob };