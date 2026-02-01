const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

// Multer Konfiguration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Nur Bilder und PDFs erlaubt!'));
    }
});

// Alle Attachments für einen Prompt abrufen
router.get('/prompt/:promptId', (req, res) => {
    try {
        const attachments = db.prepare('SELECT * FROM attachments WHERE prompt_id = ?').all(req.params.promptId);
        res.json(attachments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alle Attachments für einen Knowledge-Eintrag abrufen
router.get('/knowledge/:knowledgeId', (req, res) => {
    try {
        const attachments = db.prepare('SELECT * FROM attachments WHERE knowledge_id = ?').all(req.params.knowledgeId);
        res.json(attachments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neues Attachment hochladen
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Keine Datei hochgeladen' });
        }

        const { prompt_id, knowledge_id, description } = req.body;

        const result = db.prepare(`
            INSERT INTO attachments (prompt_id, knowledge_id, filename, filepath, type, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            prompt_id || null,
            knowledge_id || null,
            req.file.originalname,
            req.file.filename,
            req.file.mimetype,
            description || null
        );

        const newAttachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newAttachment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attachment löschen
router.delete('/:id', (req, res) => {
    try {
        const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment nicht gefunden' });
        }

        // Datei löschen
        const filepath = path.join(__dirname, '../../uploads', attachment.filepath);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        db.prepare('DELETE FROM attachments WHERE id = ?').run(req.params.id);
        res.json({ message: 'Attachment gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
