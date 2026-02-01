const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Alle Kategorien abrufen
router.get('/', (req, res) => {
    try {
        const categories = db.prepare(`
            SELECT c.*, COUNT(p.id) as prompt_count
            FROM categories c
            LEFT JOIN prompts p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.sort_order
        `).all();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Einzelne Kategorie abrufen
router.get('/:id', (req, res) => {
    try {
        const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Kategorie nicht gefunden' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neue Kategorie erstellen
router.post('/', (req, res) => {
    try {
        const { name, color, icon } = req.body;
        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM categories').get();
        const sortOrder = (maxOrder.max || 0) + 1;

        const result = db.prepare(`
            INSERT INTO categories (name, color, icon, sort_order)
            VALUES (?, ?, ?, ?)
        `).run(name, color || '#6366f1', icon || 'folder', sortOrder);

        const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Kategorie aktualisieren
router.put('/:id', (req, res) => {
    try {
        const { name, color, icon, sort_order } = req.body;
        db.prepare(`
            UPDATE categories
            SET name = COALESCE(?, name),
                color = COALESCE(?, color),
                icon = COALESCE(?, icon),
                sort_order = COALESCE(?, sort_order)
            WHERE id = ?
        `).run(name, color, icon, sort_order, req.params.id);

        const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Kategorie löschen
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
        res.json({ message: 'Kategorie gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
