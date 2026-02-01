# Prompt Sammlung

Eine lokale Webanwendung zur Verwaltung und Organisation von KI-Prompts.

## Features

- **Kategorien**: Organisiere Prompts nach Themen (Landingpages, Meta Ads, Präsentationen, etc.)
- **Tags**: Flexible Filterung durch mehrere Tags pro Prompt
- **Versionierung**: Parent-Child Beziehungen für Prompt-Erweiterungen
- **Bausteine**: Modulare, wiederverwendbare Prompt-Teile
- **Quick-Copy**: Ein-Klick Kopieren in die Zwischenablage
- **Kopier-Dialog**: Kombiniere mehrere Prompt-Versionen
- **Wissensbasis**: Zusätzlicher Bereich für Notizen, Screenshots, Anleitungen
- **Markdown-Support**: Formatierte Prompts
- **Dark/Light Mode**: Umschaltbares Theme
- **Export/Import**: Sichere deine Daten als JSON

## Installation

```bash
# In das Projektverzeichnis wechseln
cd prompt-sammlung

# Server Dependencies installieren
npm install

# Client Dependencies installieren
cd client && npm install && cd ..
```

## Starten

```bash
# Beide (Server + Client) gleichzeitig starten
npm run dev
```

Die App ist dann erreichbar unter:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Nur Server starten

```bash
npm run server
```

## Nur Client starten

```bash
npm run client
```

## Projektstruktur

```
prompt-sammlung/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # UI-Komponenten
│   │   ├── pages/         # Seiten
│   │   ├── context/       # React Context (State)
│   │   └── utils/         # Hilfsfunktionen
│   └── package.json
├── server/                 # Node.js Backend
│   ├── routes/            # API-Endpunkte
│   ├── db/                # Datenbank-Setup
│   └── server.js          # Express Server
├── data/                   # SQLite Datenbank
├── uploads/               # Hochgeladene Dateien
└── package.json
```

## API-Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET/POST | /api/categories | Kategorien abrufen/erstellen |
| GET/PUT/DELETE | /api/categories/:id | Kategorie bearbeiten/löschen |
| GET/POST | /api/prompts | Prompts abrufen/erstellen |
| GET/PUT/DELETE | /api/prompts/:id | Prompt bearbeiten/löschen |
| POST | /api/prompts/:id/copy | Use-Count erhöhen |
| GET/POST | /api/tags | Tags abrufen/erstellen |
| GET | /api/prompts/search?q=... | Prompts suchen |
| POST | /api/attachments | Datei hochladen |
| GET/POST | /api/knowledge | Wissensbasis |
| GET | /api/export | Daten exportieren |
| POST | /api/import | Daten importieren |

## Technologie-Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express
- **Datenbank**: SQLite (better-sqlite3)
- **Icons**: Lucide React
