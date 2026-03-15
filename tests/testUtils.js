// filepath: d:\CI-CD-and-testing\tests\testUtils.js
const { initDb, getDb, closeDb } = require('../db');

function initTestDb() {
  return new Promise((resolve, reject) => {
    initDb((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function cleanupTestDb() {
  const db = getDb();
  return new Promise((resolve) => {
    if (!db) {
      closeDb({ exitProcess: false });
      resolve();
      return;
    }
    db.serialize(() => {
      db.run('DELETE FROM sessions');
      db.run('DELETE FROM items');
      db.run('DELETE FROM users');
      db.run('DELETE FROM health', () => {
        closeDb({ exitProcess: false });
        resolve();
      });
    });
  });
}

module.exports = { initTestDb, cleanupTestDb };