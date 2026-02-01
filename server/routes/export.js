const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Kompletten Export
router.get('/export', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories').all();
        const prompts = db.prepare('SELECT * FROM prompts').all();
        const tags = db.prepare('SELECT * FROM tags').all();
        const prompt_tags = db.prepare('SELECT * FROM prompt_tags').all();
        const knowledge = db.prepare('SELECT * FROM knowledge_base').all();
        const knowledge_tags = db.prepare('SELECT * FROM knowledge_tags').all();

        const exportData = {
            version: '1.0',
            exported_at: new Date().toISOString(),
            data: {
                categories,
                prompts,
                tags,
                prompt_tags,
                knowledge,
                knowledge_tags
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=prompt-sammlung-export.json');
        res.json(exportData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import
router.post('/import', (req, res) => {
    try {
        const { data, merge } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'Keine Daten zum Importieren' });
        }

        const importTransaction = db.transaction(() => {
            if (!merge) {
                // Alles löschen wenn nicht gemerged wird
                db.prepare('DELETE FROM prompt_tags').run();
                db.prepare('DELETE FROM knowledge_tags').run();
                db.prepare('DELETE FROM attachments').run();
                db.prepare('DELETE FROM prompts').run();
                db.prepare('DELETE FROM knowledge_base').run();
                db.prepare('DELETE FROM tags').run();
                db.prepare('DELETE FROM categories WHERE id > 7').run(); // Standard-Kategorien behalten
            }

            // Kategorien importieren
            if (data.categories) {
                const insertCat = db.prepare(`
                    INSERT OR REPLACE INTO categories (id, name, color, icon, sort_order)
                    VALUES (?, ?, ?, ?, ?)
                `);
                data.categories.forEach(c => insertCat.run(c.id, c.name, c.color, c.icon, c.sort_order));
            }

            // Tags importieren
            if (data.tags) {
                const insertTag = db.prepare('INSERT OR REPLACE INTO tags (id, name, color) VALUES (?, ?, ?)');
                data.tags.forEach(t => insertTag.run(t.id, t.name, t.color));
            }

            // Prompts importieren
            if (data.prompts) {
                const insertPrompt = db.prepare(`
                    INSERT OR REPLACE INTO prompts (id, title, content, category_id, parent_id, is_building_block, use_count, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                data.prompts.forEach(p => insertPrompt.run(
                    p.id, p.title, p.content, p.category_id, p.parent_id,
                    p.is_building_block, p.use_count, p.created_at, p.updated_at
                ));
            }

            // Prompt-Tags importieren
            if (data.prompt_tags) {
                const insertPT = db.prepare('INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)');
                data.prompt_tags.forEach(pt => insertPT.run(pt.prompt_id, pt.tag_id));
            }

            // Knowledge importieren
            if (data.knowledge) {
                const insertK = db.prepare(`
                    INSERT OR REPLACE INTO knowledge_base (id, title, content, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                `);
                data.knowledge.forEach(k => insertK.run(k.id, k.title, k.content, k.created_at, k.updated_at));
            }

            // Knowledge-Tags importieren
            if (data.knowledge_tags) {
                const insertKT = db.prepare('INSERT OR IGNORE INTO knowledge_tags (knowledge_id, tag_id) VALUES (?, ?)');
                data.knowledge_tags.forEach(kt => insertKT.run(kt.knowledge_id, kt.tag_id));
            }
        });

        importTransaction();

        res.json({ message: 'Import erfolgreich', merged: !!merge });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
