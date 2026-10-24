const crypto = require('crypto');
module.exports = {
  v4: () => crypto.randomUUID(),
  NIL: '00000000-0000-0000-0000-000000000000',
  parse: (str) => Buffer.from(str.replace(/-/g, ''), 'hex'),
  stringify: (buf) => buf.toString('hex'),
  v1: () => crypto.randomUUID(),
  v3: () => crypto.randomUUID(),
  v5: () => crypto.randomUUID(),
  validate: () => true,
  version: () => 4
};
