// filepath: d:\CI-CD-and-testing\routes\items.js
const express = require('express');
const { getDb } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  const { name, value } = req.body || {};
  if (!name) {
    return res.status(400).send({ error: 'name_required' });
  }
  db.run(
    'INSERT INTO items (user_id, name, value) VALUES (?, ?, ?)',
    [req.userId, name, value || null],
    function insertItem(err) {
      if (err) {
        return res.status(500).send({ error: 'db_insert_failed' });
      }
      res.status(201).send({ id: this.lastID, name, value: value || null });
    }
  );
});

router.get('/', authRequired, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  db.all(
    'SELECT id, name, value, created_at FROM items WHERE user_id = ? ORDER BY id ASC',
    [req.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).send({ error: 'db_read_failed' });
      }
      res.send({ items: rows });
    }
  );
});

router.get('/:id', authRequired, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  db.get(
    'SELECT id, name, value, created_at FROM items WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    (err, row) => {
      if (err) {
        return res.status(500).send({ error: 'db_read_failed' });
      }
      if (!row) {
        return res.status(404).send({ error: 'not_found' });
      }
      res.send(row);
    }
  );
});

router.put('/:id', authRequired, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  const { name, value } = req.body || {};
  if (!name) {
    return res.status(400).send({ error: 'name_required' });
  }
  db.run(
    'UPDATE items SET name = ?, value = ? WHERE id = ? AND user_id = ?',
    [name, value || null, req.params.id, req.userId],
    function updateItem(err) {
      if (err) {
        return res.status(500).send({ error: 'db_update_failed' });
      }
      if (this.changes === 0) {
        return res.status(404).send({ error: 'not_found' });
      }
      res.send({ id: Number(req.params.id), name, value: value || null });
    }
  );
});

router.delete('/:id', authRequired, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  db.run(
    'DELETE FROM items WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    function deleteItem(err) {
      if (err) {
        return res.status(500).send({ error: 'db_delete_failed' });
      }
      if (this.changes === 0) {
        return res.status(404).send({ error: 'not_found' });
      }
      res.send({ ok: true });
    }
  );
});

module.exports = router;