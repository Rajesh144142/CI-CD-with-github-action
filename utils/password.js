// filepath: d:\CI-CD-and-testing\utils\password.js
const crypto = require('crypto');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

module.exports = { hashPassword, generateSalt, generateToken };