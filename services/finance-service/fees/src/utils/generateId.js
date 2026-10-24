// src/utils/generateId.js
// All primary keys in this schema are readable prefixed strings
// (e.g. "OBL-4F9A2C1D", "FS-7K2N0QRS") rather than raw UUIDs, per the spec's
// VARCHAR(20) ids. This keeps them short enough to fit VARCHAR(20)
// (prefix + '-' + 8 chars = comfortably under 20).

const { customAlphabet } = require('nanoid');

// Uppercase alnum, no ambiguous chars (0/O, 1/I) removed for readability.
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

/**
 * @param {string} prefix e.g. 'VH', 'FS', 'FSL', 'STE', 'OBL', 'SNAP', 'PMT', 'DST', 'CRED', 'HELB', 'AUD', 'MFS', 'MFL'
 * @returns {string} e.g. 'OBL-4F9A2C1D'
 */
function generateId(prefix) {
  if (!prefix || typeof prefix !== 'string') {
    throw new Error('generateId requires a string prefix');
  }
  return `${prefix.toUpperCase()}-${nanoid()}`;
}

module.exports = generateId;
