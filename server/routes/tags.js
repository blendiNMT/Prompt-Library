const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Alle Tags abrufen
router.get('/', (req, res) => {
    try {
        const tags = db.prepare(`
            SELECT t.*, COUNT(pt.prompt_id) as usage_count
            FROM tags t
            LEFT JOIN prompt_tags pt ON t.id = pt.tag_id
            GROUP BY t.id
            ORDER BY t.name
        `).all();
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neuen Tag erstellen
router.post('/', (req, res) => {
    try {
        const { name, color } = req.body;

        // Prüfen ob Tag schon existiert
        const existing = db.prepare('SELECT * FROM tags WHERE name = ?').get(name);
        if (existing) {
            return res.json(existing);
        }

        const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color || '#8b5cf6');
        const newTag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newTag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tag aktualisieren
router.put('/:id', (req, res) => {
    try {
        const { name, color } = req.body;
        db.prepare('UPDATE tags SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?')
            .run(name, color, req.params.id);
        const updated = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tag löschen
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
        res.json({ message: 'Tag gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
