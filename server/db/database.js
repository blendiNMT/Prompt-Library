const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/prompts.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Stelle sicher, dass das data-Verzeichnis existiert
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// WAL-Modus für bessere Performance
db.pragma('journal_mode = WAL');

// Schema initialisieren
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;
