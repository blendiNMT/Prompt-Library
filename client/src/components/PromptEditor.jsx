import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { X, Plus, Save, Eye, Edit3, Bot, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import AiPlatformIcon from './AiPlatformIcon'

export default function PromptEditor({ prompt, onClose, onSave }) {
  const { categories, tags, aiPlatforms, createTag, createPrompt, updatePrompt, createCategory } = useData()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedAiPlatforms, setSelectedAiPlatforms] = useState([])
  const [isBuildingBlock, setIsBuildingBlock] = useState(false)
  const [parentId, setParentId] = useState(null)
  const [newTagName, setNewTagName] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title || '')
      setContent(prompt.content || '')
      setCategoryId(prompt.category_id || '')
      setSelectedTags(prompt.tag_ids || [])
      setSelectedAiPlatforms(prompt.ai_platform_ids || [])
      setIsBuildingBlock(!!prompt.is_building_block)
      setParentId(prompt.parent_id || null)
    }
  }, [prompt])

  const handleAddTag = async () => {
    if (newTagName.trim()) {
      const newTag = await createTag({ name: newTagName.trim() })
      setSelectedTags([...selectedTags, newTag.id])
      setNewTagName('')
    }
  }

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const newCat = await createCategory({ name: newCategoryName.trim() })
      setCategoryId(newCat.id.toString())
      setNewCategoryName('')
      setShowNewCategory(false)
    }
  }

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const toggleAiPlatform = (platformId) => {
    if (selectedAiPlatforms.includes(platformId)) {
      setSelectedAiPlatforms(selectedAiPlatforms.filter(id => id !== platformId))
    } else {
      setSelectedAiPlatforms([...selectedAiPlatforms, platformId])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const data = {
      title,
      content,
      category_id: categoryId || null,
      parent_id: parentId,
      is_building_block: isBuildingBlock,
      tags: selectedTags,
      ai_platforms: selectedAiPlatforms
    }

    try {
      if (prompt?.id) {
        await updatePrompt(prompt.id, data)
      } else {
        await createPrompt(data)
      }
      onSave?.()
      onClose()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {prompt?.id ? 'Prompt bearbeiten' : 'Neuer Prompt'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="z.B. Landingpage Hero-Sektion"
              required
            />
          </div>

          {/* Category with inline creation */}
          <div>
            <label className="block text-sm font-medium mb-1">Kategorie</label>
            <div className="flex gap-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input flex-1"
              >
                <option value="">Keine Kategorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {!showNewCategory ? (
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="btn btn-secondary"
                  title="Neue Kategorie erstellen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Neue Kategorie..."
                    className="input w-40"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="btn btn-primary px-2"
                    disabled={!newCategoryName.trim()}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCategory(false); setNewCategoryName('') }}
                    className="btn btn-secondary px-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Platforms */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              KI-Plattformen
            </label>
            <div className="flex flex-wrap gap-2">
              {aiPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => toggleAiPlatform(platform.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedAiPlatforms.includes(platform.id)
                      ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: selectedAiPlatforms.includes(platform.id)
                      ? platform.color + '30'
                      : platform.color + '15',
                    color: platform.color,
                    borderColor: platform.color
                  }}
                >
                  <AiPlatformIcon
                    platform={platform.name}
                    className="w-4 h-4"
                    color={platform.color}
                  />
                  {platform.name}
                  {selectedAiPlatforms.includes(platform.id) && (
                    <Check className="w-3 h-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Wähle die KI-Plattformen, für die dieser Prompt optimiert ist
            </p>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Prompt Inhalt</label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Bearbeiten' : 'Vorschau'}
              </button>
            </div>
            {showPreview ? (
              <div className="input min-h-48 overflow-y-auto markdown-content">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input min-h-48 font-mono text-sm"
                placeholder="Dein Prompt hier... (Markdown wird unterstützt)"
                required
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`tag cursor-pointer transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Neuer Tag..."
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-secondary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBuildingBlock}
                onChange={(e) => setIsBuildingBlock(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">Als Baustein markieren</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !title || !content}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
