'use strict';

const SERIAL_PREFIX  = 'RTVC';
const SERIAL_MIDDLE  = 'V';
const SERIAL_START   = 1;
const SERIAL_PADDING = 4;
const SERIAL_SEP     = '/';

function formatSerial(seq) {
  const parts = [SERIAL_PREFIX];

  if (SERIAL_MIDDLE) {
    parts.push(SERIAL_MIDDLE);
  }

  parts.push(String(seq).padStart(SERIAL_PADDING, '0'));

  return parts.join(SERIAL_SEP);
}

function parseSerial(serial) {
  if (!serial) {
    return SERIAL_START - 1;
  }

  const match = serial.match(/(\d+)$/);

  return match
    ? parseInt(match[1], 10)
    : SERIAL_START - 1;
}

function generateSerials(lastSerial, count = 1) {
  const lastSeq = parseSerial(lastSerial);
  const nextSeq = Math.max(lastSeq + 1, SERIAL_START);

  return Array.from(
    { length: count },
    (_, i) => formatSerial(nextSeq + i)
  );
}

module.exports = {
  formatSerial,
  parseSerial,
  generateSerials,
  SERIAL_START
};