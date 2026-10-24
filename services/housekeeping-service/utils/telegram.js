'use strict';

const axios  = require('axios');
const { log } = require('./logger');

async function sendTelegram (message) {
  const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !CHAT_ID) {
    log('[telegram] ⚠ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping alert');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    await axios.post(url, { chat_id: CHAT_ID, text: message });
    log(`[telegram] ✓ Alert sent: ${message}`);
  } catch (err) {
    log(`[telegram] ⚠ Failed to send alert: ${err.message}`);
  }
}

module.exports = { sendTelegram };