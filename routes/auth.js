const express = require('express');
const tryCatch = require('try-catch');
const { getDb } = require('../db');
const { hashPassword, generateSalt, generateToken } = require('../utils/password');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).send({ error: 'username_and_password_required' });
  }
  const salt = generateSalt();
  const [hashError, passwordHash] = tryCatch(hashPassword, password, salt);
  if (hashError) {
    return res.status(500).send({ error: 'hash_failed' });
  }
  db.run(
    'INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)',
    [username, passwordHash, salt],
    function insertUser(err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE')) {
          return res.status(409).send({ error: 'username_taken' });
        }
        return res.status(500).send({ error: 'db_insert_failed' });
      }
      res.status(201).send({ id: this.lastID, username });
    }
  );
});

router.post('/login', (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).send({ error: 'username_and_password_required' });
  }
  db.get('SELECT id, password_hash, salt FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).send({ error: 'db_read_failed' });
    }
    if (!row) {
      return res.status(401).send({ error: 'invalid_credentials' });
    }
    const [hashError, candidate] = tryCatch(hashPassword, password, row.salt);
    if (hashError) {
      return res.status(500).send({ error: 'hash_failed' });
    }
    if (candidate !== row.password_hash) {
      return res.status(401).send({ error: 'invalid_credentials' });
    }
    const [tokenError, token] = tryCatch(generateToken);
    if (tokenError) {
      return res.status(500).send({ error: 'token_failed' });
    }
    db.run('INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, row.id], (insertErr) => {
      if (insertErr) {
        return res.status(500).send({ error: 'db_insert_failed' });
      }
      res.send({ token });
    });
  });
});

router.post('/logout', authRequired, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  db.run('DELETE FROM sessions WHERE token = ?', [req.token], (err) => {
    if (err) {
      return res.status(500).send({ error: 'db_delete_failed' });
    }
    res.send({ ok: true });
  });
});

module.exports = router;
