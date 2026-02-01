const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Alle KI-Plattformen abrufen
router.get('/', (req, res) => {
    try {
        const platforms = db.prepare(`
            SELECT ap.*, COUNT(pap.prompt_id) as usage_count
            FROM ai_platforms ap
            LEFT JOIN prompt_ai_platforms pap ON ap.id = pap.ai_platform_id
            GROUP BY ap.id
            ORDER BY ap.sort_order
        `).all();
        res.json(platforms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neue KI-Plattform erstellen
router.post('/', (req, res) => {
    try {
        const { name, color, icon } = req.body;

        // Prüfen ob schon existiert
        const existing = db.prepare('SELECT * FROM ai_platforms WHERE name = ?').get(name);
        if (existing) {
            return res.json(existing);
        }

        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM ai_platforms').get();
        const sortOrder = (maxOrder.max || 0) + 1;

        const result = db.prepare(`
            INSERT INTO ai_platforms (name, color, icon, sort_order)
            VALUES (?, ?, ?, ?)
        `).run(name, color || '#6366f1', icon || 'bot', sortOrder);

        const newPlatform = db.prepare('SELECT * FROM ai_platforms WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newPlatform);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// KI-Plattform aktualisieren
router.put('/:id', (req, res) => {
    try {
        const { name, color, icon, sort_order } = req.body;
        db.prepare(`
            UPDATE ai_platforms
            SET name = COALESCE(?, name),
                color = COALESCE(?, color),
                icon = COALESCE(?, icon),
                sort_order = COALESCE(?, sort_order)
            WHERE id = ?
        `).run(name, color, icon, sort_order, req.params.id);

        const updated = db.prepare('SELECT * FROM ai_platforms WHERE id = ?').get(req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// KI-Plattform löschen
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM ai_platforms WHERE id = ?').run(req.params.id);
        res.json({ message: 'KI-Plattform gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
