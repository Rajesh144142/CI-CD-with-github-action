const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'app.db');
let db = null;

function initDb(callback) {
    if (db) {
        if (callback) {
            callback(null);
        }
        return;
    }
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Failed to open database:', err.message);
            if (callback) {
                callback(err);
            }
            return;
        }
        console.log('Database connected:', dbPath);
        db.serialize(() => {
            db.run(
                'CREATE TABLE IF NOT EXISTS health (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'
            );
            db.run(
                'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'
            );
            db.run(
                'CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id))'
            );
            db.run(
                'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, value TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id))'
            );
            if (callback) {
                callback(null);
            }
        });
    });
}

function closeDb(options = {}) {
    const { exitProcess = true } = options;
    const shouldExit = exitProcess && process.env.NODE_ENV !== 'test';
    if (!db) {
        if (shouldExit) {
            process.exit(0);
        }
        return;
    }
    db.close(() => {
        if (shouldExit) {
            process.exit(0);
        }
    });
}

function getDb() {
    return db;
}

module.exports = { initDb, closeDb, getDb };
