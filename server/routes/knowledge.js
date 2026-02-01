const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Alle Knowledge-Einträge abrufen
router.get('/', (req, res) => {
    try {
        const { search, tag_id } = req.query;

        let query = `
            SELECT k.*, GROUP_CONCAT(DISTINCT t.name) as tags
            FROM knowledge_base k
            LEFT JOIN knowledge_tags kt ON k.id = kt.knowledge_id
            LEFT JOIN tags t ON kt.tag_id = t.id
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            query += ' AND (k.title LIKE ? OR k.content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (tag_id) {
            query += ' AND k.id IN (SELECT knowledge_id FROM knowledge_tags WHERE tag_id = ?)';
            params.push(tag_id);
        }

        query += ' GROUP BY k.id ORDER BY k.updated_at DESC';

        const knowledge = db.prepare(query).all(...params);

        const formatted = knowledge.map(k => ({
            ...k,
            tags: k.tags ? k.tags.split(',') : []
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Einzelnen Knowledge-Eintrag abrufen
router.get('/:id', (req, res) => {
    try {
        const knowledge = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(req.params.id);
        if (!knowledge) {
            return res.status(404).json({ error: 'Eintrag nicht gefunden' });
        }

        const tags = db.prepare(`
            SELECT t.* FROM tags t
            JOIN knowledge_tags kt ON t.id = kt.tag_id
            WHERE kt.knowledge_id = ?
        `).all(req.params.id);

        const attachments = db.prepare('SELECT * FROM attachments WHERE knowledge_id = ?').all(req.params.id);

        res.json({ ...knowledge, tags, attachments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neuen Knowledge-Eintrag erstellen
router.post('/', (req, res) => {
    try {
        const { title, content, tags } = req.body;

        const result = db.prepare(`
            INSERT INTO knowledge_base (title, content)
            VALUES (?, ?)
        `).run(title, content || '');

        const knowledgeId = result.lastInsertRowid;

        if (tags && tags.length > 0) {
            const insertTag = db.prepare('INSERT OR IGNORE INTO knowledge_tags (knowledge_id, tag_id) VALUES (?, ?)');
            tags.forEach(tagId => insertTag.run(knowledgeId, tagId));
        }

        const newKnowledge = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(knowledgeId);
        res.status(201).json(newKnowledge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Knowledge-Eintrag aktualisieren
router.put('/:id', (req, res) => {
    try {
        const { title, content, tags } = req.body;

        db.prepare(`
            UPDATE knowledge_base
            SET title = COALESCE(?, title),
                content = COALESCE(?, content),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(title, content, req.params.id);

        if (tags !== undefined) {
            db.prepare('DELETE FROM knowledge_tags WHERE knowledge_id = ?').run(req.params.id);
            if (tags && tags.length > 0) {
                const insertTag = db.prepare('INSERT INTO knowledge_tags (knowledge_id, tag_id) VALUES (?, ?)');
                tags.forEach(tagId => insertTag.run(req.params.id, tagId));
            }
        }

        const updated = db.prepare('SELECT * FROM knowledge_base WHERE id = ?').get(req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Knowledge-Eintrag löschen
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM knowledge_base WHERE id = ?').run(req.params.id);
        res.json({ message: 'Eintrag gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
