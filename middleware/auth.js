// filepath: d:\CI-CD-and-testing\middleware\auth.js
const { getDb } = require('../db');

function authRequired(req, res, next) {
  const db = getDb();
  if (!db) {
    return res.status(503).send({ error: 'db_not_ready' });
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).send({ error: 'auth_required' });
  }
  db.get('SELECT user_id FROM sessions WHERE token = ?', [token], (err, row) => {
    if (err) {
      return res.status(500).send({ error: 'db_read_failed' });
    }
    if (!row) {
      return res.status(401).send({ error: 'invalid_token' });
    }
    req.userId = row.user_id;
    req.token = token;
    next();
  });
}

module.exports = { authRequired };