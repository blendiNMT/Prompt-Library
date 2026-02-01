const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Alle AI-Responses abrufen (mit optionalen Filtern)
router.get('/', (req, res) => {
    try {
        const { ai_platform_id, tag_id, topic, search, is_favorite } = req.query;

        let query = `
            SELECT ar.*, ap.name as ai_platform_name, ap.color as ai_platform_color,
                   p.title as prompt_title,
                   GROUP_CONCAT(DISTINCT t.name) as tags,
                   GROUP_CONCAT(DISTINCT t.id) as tag_ids
            FROM ai_responses ar
            LEFT JOIN ai_platforms ap ON ar.ai_platform_id = ap.id
            LEFT JOIN prompts p ON ar.prompt_id = p.id
            LEFT JOIN ai_response_tags art ON ar.id = art.response_id
            LEFT JOIN tags t ON art.tag_id = t.id
            WHERE 1=1
        `;

        const params = [];

        if (ai_platform_id) {
            query += ' AND ar.ai_platform_id = ?';
            params.push(ai_platform_id);
        }

        if (topic) {
            query += ' AND ar.topic = ?';
            params.push(topic);
        }

        if (is_favorite === 'true') {
            query += ' AND ar.is_favorite = 1';
        }

        if (search) {
            query += ' AND (ar.title LIKE ? OR ar.content LIKE ? OR ar.topic LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (tag_id) {
            query += ' AND ar.id IN (SELECT response_id FROM ai_response_tags WHERE tag_id = ?)';
            params.push(tag_id);
        }

        query += ' GROUP BY ar.id ORDER BY ar.updated_at DESC';

        const responses = db.prepare(query).all(...params);

        // Tags als Array formatieren
        const formattedResponses = responses.map(r => ({
            ...r,
            tags: r.tags ? r.tags.split(',') : [],
            tag_ids: r.tag_ids ? r.tag_ids.split(',').map(Number) : []
        }));

        res.json(formattedResponses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alle Topics abrufen (für Filter)
router.get('/topics', (req, res) => {
    try {
        const topics = db.prepare(`
            SELECT DISTINCT topic FROM ai_responses
            WHERE topic IS NOT NULL AND topic != ''
            ORDER BY topic
        `).all();
        res.json(topics.map(t => t.topic));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Einzelne AI-Response abrufen
router.get('/:id', (req, res) => {
    try {
        const response = db.prepare(`
            SELECT ar.*, ap.name as ai_platform_name, ap.color as ai_platform_color,
                   p.title as prompt_title, p.content as prompt_content
            FROM ai_responses ar
            LEFT JOIN ai_platforms ap ON ar.ai_platform_id = ap.id
            LEFT JOIN prompts p ON ar.prompt_id = p.id
            WHERE ar.id = ?
        `).get(req.params.id);

        if (!response) {
            return res.status(404).json({ error: 'Response nicht gefunden' });
        }

        // Tags abrufen
        const tags = db.prepare(`
            SELECT t.* FROM tags t
            JOIN ai_response_tags art ON t.id = art.tag_id
            WHERE art.response_id = ?
        `).all(req.params.id);

        res.json({ ...response, tags });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neue AI-Response erstellen
router.post('/', (req, res) => {
    try {
        const { title, content, ai_platform_id, prompt_id, topic, notes, tags } = req.body;

        const result = db.prepare(`
            INSERT INTO ai_responses (title, content, ai_platform_id, prompt_id, topic, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(title, content, ai_platform_id || null, prompt_id || null, topic || null, notes || null);

        const responseId = result.lastInsertRowid;

        // Tags verknüpfen
        if (tags && tags.length > 0) {
            const insertTag = db.prepare('INSERT OR IGNORE INTO ai_response_tags (response_id, tag_id) VALUES (?, ?)');
            tags.forEach(tagId => insertTag.run(responseId, tagId));
        }

        const newResponse = db.prepare('SELECT * FROM ai_responses WHERE id = ?').get(responseId);
        res.status(201).json(newResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI-Response aktualisieren
router.put('/:id', (req, res) => {
    try {
        const { title, content, ai_platform_id, prompt_id, topic, notes, is_favorite, tags } = req.body;

        db.prepare(`
            UPDATE ai_responses
            SET title = COALESCE(?, title),
                content = COALESCE(?, content),
                ai_platform_id = ?,
                prompt_id = ?,
                topic = ?,
                notes = ?,
                is_favorite = COALESCE(?, is_favorite),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(title, content, ai_platform_id, prompt_id, topic, notes, is_favorite ? 1 : 0, req.params.id);

        // Tags aktualisieren
        if (tags !== undefined) {
            db.prepare('DELETE FROM ai_response_tags WHERE response_id = ?').run(req.params.id);
            if (tags && tags.length > 0) {
                const insertTag = db.prepare('INSERT INTO ai_response_tags (response_id, tag_id) VALUES (?, ?)');
                tags.forEach(tagId => insertTag.run(req.params.id, tagId));
            }
        }

        const updated = db.prepare('SELECT * FROM ai_responses WHERE id = ?').get(req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Favorit togglen
router.post('/:id/favorite', (req, res) => {
    try {
        db.prepare('UPDATE ai_responses SET is_favorite = NOT is_favorite WHERE id = ?').run(req.params.id);
        const response = db.prepare('SELECT * FROM ai_responses WHERE id = ?').get(req.params.id);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI-Response löschen
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM ai_responses WHERE id = ?').run(req.params.id);
        res.json({ message: 'Response gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
