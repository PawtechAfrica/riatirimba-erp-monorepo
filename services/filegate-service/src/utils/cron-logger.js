// utils/logger.js
const fs = require('fs');
const path = require('path');

const logFilePath = path.resolve(__dirname, '../logs/b2transfer.log');

function logMessage(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, entry);
  console.log(entry.trim());
}

module.exports = { logMessage, logFilePath };
