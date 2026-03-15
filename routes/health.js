// filepath: d:\CI-CD-and-testing\routes\health.js
const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  db.run('INSERT INTO health DEFAULT VALUES', (insertErr) => {
    if (insertErr) {
      return res.status(500).send({ error: 'db_insert_failed' });
    }
    db.get('SELECT COUNT(*) AS count FROM health', (countErr, row) => {
      if (countErr) {
        return res.status(500).send({ error: 'db_read_failed' });
      }
      res.send({ db: 'ok', rows: row.count });
    });
  });
});

module.exports = router;