const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Alle Prompts abrufen (mit optionalen Filtern)
router.get('/', (req, res) => {
    try {
        const { category_id, tag_id, ai_platform_id, is_building_block, parent_id, search } = req.query;

        let query = `
            SELECT p.*, c.name as category_name, c.color as category_color,
                   GROUP_CONCAT(DISTINCT t.name) as tags,
                   GROUP_CONCAT(DISTINCT t.id) as tag_ids,
                   GROUP_CONCAT(DISTINCT ap.name) as ai_platforms,
                   GROUP_CONCAT(DISTINCT ap.id) as ai_platform_ids,
                   GROUP_CONCAT(DISTINCT ap.color) as ai_platform_colors,
                   (SELECT COUNT(*) FROM prompts WHERE parent_id = p.id) as children_count
            FROM prompts p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            LEFT JOIN prompt_ai_platforms pap ON p.id = pap.prompt_id
            LEFT JOIN ai_platforms ap ON pap.ai_platform_id = ap.id
            WHERE 1=1
        `;

        const params = [];

        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }

        if (is_building_block !== undefined) {
            query += ' AND p.is_building_block = ?';
            params.push(is_building_block === 'true' ? 1 : 0);
        }

        if (parent_id === 'null') {
            query += ' AND p.parent_id IS NULL';
        } else if (parent_id) {
            query += ' AND p.parent_id = ?';
            params.push(parent_id);
        }

        if (search) {
            query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (tag_id) {
            query += ' AND p.id IN (SELECT prompt_id FROM prompt_tags WHERE tag_id = ?)';
            params.push(tag_id);
        }

        if (ai_platform_id) {
            query += ' AND p.id IN (SELECT prompt_id FROM prompt_ai_platforms WHERE ai_platform_id = ?)';
            params.push(ai_platform_id);
        }

        query += ' GROUP BY p.id ORDER BY p.updated_at DESC';

        const prompts = db.prepare(query).all(...params);

        // Tags und AI-Platforms als Array formatieren
        const formattedPrompts = prompts.map(p => ({
            ...p,
            tags: p.tags ? p.tags.split(',') : [],
            tag_ids: p.tag_ids ? p.tag_ids.split(',').map(Number) : [],
            ai_platforms: p.ai_platforms ? p.ai_platforms.split(',') : [],
            ai_platform_ids: p.ai_platform_ids ? p.ai_platform_ids.split(',').map(Number) : [],
            ai_platform_colors: p.ai_platform_colors ? p.ai_platform_colors.split(',') : []
        }));

        res.json(formattedPrompts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Suche
router.get('/search', (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }

        const prompts = db.prepare(`
            SELECT p.*, c.name as category_name, c.color as category_color
            FROM prompts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.title LIKE ? OR p.content LIKE ?
            ORDER BY p.use_count DESC, p.updated_at DESC
            LIMIT 50
        `).all(`%${q}%`, `%${q}%`);

        res.json(prompts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Einzelnen Prompt abrufen
router.get('/:id', (req, res) => {
    try {
        const prompt = db.prepare(`
            SELECT p.*, c.name as category_name, c.color as category_color
            FROM prompts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `).get(req.params.id);

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt nicht gefunden' });
        }

        // Tags abrufen
        const tags = db.prepare(`
            SELECT t.* FROM tags t
            JOIN prompt_tags pt ON t.id = pt.tag_id
            WHERE pt.prompt_id = ?
        `).all(req.params.id);

        // Kinder (Erweiterungen) abrufen
        const children = db.prepare(`
            SELECT * FROM prompts WHERE parent_id = ?
        `).all(req.params.id);

        // Parent abrufen wenn vorhanden
        let parent = null;
        if (prompt.parent_id) {
            parent = db.prepare('SELECT id, title FROM prompts WHERE id = ?').get(prompt.parent_id);
        }

        // Attachments abrufen
        const attachments = db.prepare(`
            SELECT * FROM attachments WHERE prompt_id = ?
        `).all(req.params.id);

        // KI-Plattformen abrufen
        const aiPlatforms = db.prepare(`
            SELECT ap.* FROM ai_platforms ap
            JOIN prompt_ai_platforms pap ON ap.id = pap.ai_platform_id
            WHERE pap.prompt_id = ?
        `).all(req.params.id);

        res.json({ ...prompt, tags, children, parent, attachments, aiPlatforms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Kinder eines Prompts abrufen
router.get('/:id/children', (req, res) => {
    try {
        const children = db.prepare(`
            SELECT p.*, c.name as category_name
            FROM prompts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.parent_id = ?
            ORDER BY p.created_at
        `).all(req.params.id);

        res.json(children);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neuen Prompt erstellen
router.post('/', (req, res) => {
    try {
        const { title, content, category_id, parent_id, is_building_block, tags, ai_platforms } = req.body;

        const result = db.prepare(`
            INSERT INTO prompts (title, content, category_id, parent_id, is_building_block)
            VALUES (?, ?, ?, ?, ?)
        `).run(title, content, category_id || null, parent_id || null, is_building_block ? 1 : 0);

        const promptId = result.lastInsertRowid;

        // Tags verknüpfen
        if (tags && tags.length > 0) {
            const insertTag = db.prepare('INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)');
            tags.forEach(tagId => insertTag.run(promptId, tagId));
        }

        // KI-Plattformen verknüpfen
        if (ai_platforms && ai_platforms.length > 0) {
            const insertPlatform = db.prepare('INSERT OR IGNORE INTO prompt_ai_platforms (prompt_id, ai_platform_id) VALUES (?, ?)');
            ai_platforms.forEach(platformId => insertPlatform.run(promptId, platformId));
        }

        const newPrompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(promptId);
        res.status(201).json(newPrompt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Prompt aktualisieren
router.put('/:id', (req, res) => {
    try {
        const { title, content, category_id, parent_id, is_building_block, tags, ai_platforms } = req.body;

        db.prepare(`
            UPDATE prompts
            SET title = COALESCE(?, title),
                content = COALESCE(?, content),
                category_id = ?,
                parent_id = ?,
                is_building_block = COALESCE(?, is_building_block),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(title, content, category_id, parent_id, is_building_block ? 1 : 0, req.params.id);

        // Tags aktualisieren
        if (tags !== undefined) {
            db.prepare('DELETE FROM prompt_tags WHERE prompt_id = ?').run(req.params.id);
            if (tags && tags.length > 0) {
                const insertTag = db.prepare('INSERT INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)');
                tags.forEach(tagId => insertTag.run(req.params.id, tagId));
            }
        }

        // KI-Plattformen aktualisieren
        if (ai_platforms !== undefined) {
            db.prepare('DELETE FROM prompt_ai_platforms WHERE prompt_id = ?').run(req.params.id);
            if (ai_platforms && ai_platforms.length > 0) {
                const insertPlatform = db.prepare('INSERT INTO prompt_ai_platforms (prompt_id, ai_platform_id) VALUES (?, ?)');
                ai_platforms.forEach(platformId => insertPlatform.run(req.params.id, platformId));
            }
        }

        const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Use-Count erhöhen (beim Kopieren)
router.post('/:id/copy', (req, res) => {
    try {
        db.prepare('UPDATE prompts SET use_count = use_count + 1 WHERE id = ?').run(req.params.id);
        const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
        res.json(prompt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Prompt löschen
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id);
        res.json({ message: 'Prompt gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
