# Prompt Sammlung - Einfache Deployment-Anleitung

## Kurzanleitung: Railway (Empfohlen)

### Was du brauchst:
- Einen kostenlosen GitHub Account
- Einen kostenlosen Railway Account

---

### Schritt 1: GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com) und logge dich ein
2. Klicke oben rechts auf **+** → **New repository**
3. Name: `prompt-sammlung`
4. Klicke auf **Create repository**

### Schritt 2: Code hochladen

Öffne Terminal/Eingabeaufforderung im Projekt-Ordner und führe diese Befehle aus:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/prompt-sammlung.git
git push -u origin main
```

*(Ersetze DEIN-USERNAME mit deinem GitHub-Benutzernamen)*

### Schritt 3: Railway verbinden

1. Gehe zu [railway.app](https://railway.app)
2. Klicke auf **Login** → **Login with GitHub**
3. Nach dem Login: Klicke auf **New Project**
4. Wähle **Deploy from GitHub repo**
5. Wähle dein `prompt-sammlung` Repository aus
6. Railway startet automatisch das Deployment

### Schritt 4: Passwort setzen (WICHTIG!)

1. In Railway, klicke auf dein Projekt
2. Gehe zu **Variables** (in der linken Seite)
3. Füge diese Variablen hinzu:

| Variable | Wert |
|----------|------|
| `APP_PASSWORD` | `DeinSicheresPasswort123` |
| `SESSION_SECRET` | `EinZufälligerLangerText` |
| `NODE_ENV` | `production` |

**Wichtig:** Wähle ein sicheres Passwort! Mit diesem loggst du dich später ein.

### Schritt 5: Domain aktivieren

1. Klicke auf dein Projekt → **Settings**
2. Scrolle zu **Domains**
3. Klicke auf **Generate Domain**
4. Deine App ist jetzt unter `https://prompt-sammlung-xxxxx.up.railway.app` erreichbar

### Schritt 6: Einloggen

1. Öffne deine Railway-URL im Browser
2. Gib dein Passwort ein (das du in Schritt 4 gesetzt hast)
3. Fertig! Du kannst jetzt von jedem Gerät aus auf deine Prompts zugreifen

---

## Daten persistent speichern (Volume)

Damit deine Daten nicht verloren gehen:

1. In Railway, klicke auf dein Projekt
2. Klicke auf **+ New** → **Volume**
3. Name: `data`
4. Mount Path: `/app/data`
5. Klicke auf **Create**

---

## Sicherheits-Checkliste

- [ ] Sicheres Passwort gewählt (min. 12 Zeichen, Buchstaben + Zahlen)
- [ ] SESSION_SECRET ist ein langer, zufälliger String
- [ ] NODE_ENV ist auf `production` gesetzt
- [ ] Volume für persistente Daten erstellt

---

## Vom Handy zugreifen

1. Öffne den Browser auf deinem Handy
2. Gehe zu deiner Railway-URL
3. Logge dich mit deinem Passwort ein
4. Fertig!

---

## Probleme?

### App zeigt Fehler beim Login
- Prüfe ob `APP_PASSWORD` in Railway gesetzt ist
- Prüfe ob du das richtige Passwort eingibst

### Daten sind weg nach Redeploy
- Erstelle ein Volume (siehe oben)
- Exportiere deine Daten regelmäßig in den Einstellungen

### Weiße Seite
- Warte 2-3 Minuten, Railway baut die App
- Prüfe die Logs in Railway auf Fehler
