-- Kategorien
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prompts
CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER,
    parent_id INTEGER,
    is_building_block BOOLEAN DEFAULT 0,
    use_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES prompts(id) ON DELETE SET NULL
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#8b5cf6'
);

-- Prompt-Tags Verknüpfung
CREATE TABLE IF NOT EXISTS prompt_tags (
    prompt_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (prompt_id, tag_id),
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Attachments (Bilder, Screenshots, etc.)
CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER,
    knowledge_id INTEGER,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    type TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id) ON DELETE CASCADE
);

-- Globale Wissensbasis
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge-Tags Verknüpfung
CREATE TABLE IF NOT EXISTS knowledge_tags (
    knowledge_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (knowledge_id, tag_id),
    FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- KI-Plattformen
CREATE TABLE IF NOT EXISTS ai_platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'bot',
    sort_order INTEGER DEFAULT 0
);

-- Prompt-KI-Plattformen Verknüpfung
CREATE TABLE IF NOT EXISTS prompt_ai_platforms (
    prompt_id INTEGER,
    ai_platform_id INTEGER,
    PRIMARY KEY (prompt_id, ai_platform_id),
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    FOREIGN KEY (ai_platform_id) REFERENCES ai_platforms(id) ON DELETE CASCADE
);

-- Standard-KI-Plattformen einfügen
INSERT OR IGNORE INTO ai_platforms (id, name, color, icon, sort_order) VALUES
    (1, 'Claude', '#D97706', 'brain', 1),
    (2, 'ChatGPT', '#10B981', 'message-circle', 2),
    (3, 'Gemini', '#3B82F6', 'sparkles', 3),
    (4, 'VS Code + Claude Code', '#8B5CF6', 'code', 4),
    (5, 'Google AI Studio', '#EF4444', 'flask-conical', 5),
    (6, 'Freepik (Bilder)', '#EC4899', 'image', 6),
    (7, 'Freepik (Videos)', '#F43F5E', 'video', 7),
    (8, 'NotebookLM', '#6366F1', 'notebook-pen', 8),
    (9, 'Nano Banana', '#FBBF24', 'banana', 9),
    (10, 'Perplexity', '#14B8A6', 'search', 10),
    (11, 'Midjourney', '#1E3A8A', 'palette', 11),
    (12, 'DALL-E', '#059669', 'image-plus', 12),
    (13, 'Stable Diffusion', '#7C3AED', 'wand-2', 13),
    (14, 'DeepSeek', '#0EA5E9', 'compass', 14),
    (15, 'Qwen (China)', '#DC2626', 'globe', 15),
    (16, 'Ernie Bot (China)', '#BE185D', 'bot', 16),
    (17, 'Copilot', '#0078D4', 'github', 17),
    (18, 'Llama', '#7E22CE', 'cat', 18);

-- Standard-Kategorien einfügen
INSERT OR IGNORE INTO categories (id, name, color, icon, sort_order) VALUES
    (1, 'Landingpages', '#ef4444', 'target', 1),
    (2, 'Meta Ads', '#f97316', 'megaphone', 2),
    (3, 'Präsentationen', '#eab308', 'presentation', 3),
    (4, 'Corporate Identity', '#22c55e', 'palette', 4),
    (5, 'Content & Blog', '#3b82f6', 'file-text', 5),
    (6, 'E-Mail Marketing', '#8b5cf6', 'mail', 6),
    (7, 'Bausteine', '#6366f1', 'puzzle', 99);

-- KI-Antworten / Research Library
CREATE TABLE IF NOT EXISTS ai_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    ai_platform_id INTEGER,
    prompt_id INTEGER,
    topic TEXT,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ai_platform_id) REFERENCES ai_platforms(id) ON DELETE SET NULL,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE SET NULL
);

-- AI-Response Tags Verknüpfung
CREATE TABLE IF NOT EXISTS ai_response_tags (
    response_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (response_id, tag_id),
    FOREIGN KEY (response_id) REFERENCES ai_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Index für schnellere Suche
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_parent ON prompts(parent_id);
CREATE INDEX IF NOT EXISTS idx_prompts_content ON prompts(content);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_prompt ON prompt_tags(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag ON prompt_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_platform ON ai_responses(ai_platform_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_topic ON ai_responses(topic);
