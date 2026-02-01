const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy für Render/Heroku (wichtig für secure cookies)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Das Passwort wird aus der Umgebungsvariable gelesen
// Setze APP_PASSWORD beim Deployment
const APP_PASSWORD = process.env.APP_PASSWORD || 'demo123';

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Session-Konfiguration
app.use(session({
    secret: process.env.SESSION_SECRET || 'prompt-sammlung-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Tage
    }
}));

// Auth-Middleware - prüft ob eingeloggt
const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.status(401).json({ error: 'Nicht autorisiert. Bitte einloggen.' });
};

// Login-Route (nicht geschützt)
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;

    if (password === APP_PASSWORD) {
        req.session.authenticated = true;
        res.json({ success: true, message: 'Erfolgreich eingeloggt' });
    } else {
        res.status(401).json({ error: 'Falsches Passwort' });
    }
});

// Logout-Route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Ausgeloggt' });
});

// Auth-Status prüfen
app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

// Uploads - öffentlich für Bilder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Alle API-Routen mit Auth schützen
app.use('/api', requireAuth);

// Routes
const categoriesRoutes = require('./routes/categories');
const promptsRoutes = require('./routes/prompts');
const tagsRoutes = require('./routes/tags');
const attachmentsRoutes = require('./routes/attachments');
const knowledgeRoutes = require('./routes/knowledge');
const aiPlatformsRoutes = require('./routes/ai-platforms');
const aiResponsesRoutes = require('./routes/ai-responses');
const exportRoutes = require('./routes/export');

app.use('/api/categories', categoriesRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/ai-platforms', aiPlatformsRoutes);
app.use('/api/ai-responses', aiResponsesRoutes);
app.use('/api', exportRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Etwas ist schiefgelaufen!' });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
    if (APP_PASSWORD === 'demo123') {
        console.log('⚠️  WARNUNG: Standard-Passwort wird verwendet. Setze APP_PASSWORD für Produktion!');
    }
});
