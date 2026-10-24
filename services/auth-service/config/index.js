const fs = require('fs');
const path = require('path');

const activeKid = process.env.ACTIVE_KID || '1';

const privateKey = fs.readFileSync(
  path.join(__dirname, 'keys', `private_kid_${activeKid}.pem`)
);

const publicKeys = {};

const keyDir = path.join(__dirname, 'keys');
fs.readdirSync(keyDir).forEach(file => {
  if (file.startsWith('public_kid_')) {
    const kid = file.split('_')[2].split('.')[0];
    publicKeys[kid] = fs.readFileSync(path.join(keyDir, file));
  }
});

module.exports = {
  privateKey,
  publicKeys,
  activeKid,
  tokenExpiry: '15m',
  refreshExpiry: '7d'
};
