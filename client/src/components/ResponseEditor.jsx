import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { X, Plus, Save, Eye, Edit3, Bot, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import AiPlatformIcon from './AiPlatformIcon'

export default function ResponseEditor({ response, onClose }) {
  const { aiPlatforms, tags, prompts, createTag, createAiResponse, updateAiResponse } = useData()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [aiPlatformId, setAiPlatformId] = useState('')
  const [promptId, setPromptId] = useState('')
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [newTagName, setNewTagName] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (response) {
      setTitle(response.title || '')
      setContent(response.content || '')
      setAiPlatformId(response.ai_platform_id || '')
      setPromptId(response.prompt_id || '')
      setTopic(response.topic || '')
      setNotes(response.notes || '')
      setSelectedTags(response.tag_ids || [])
    }
  }, [response])

  const handleAddTag = async () => {
    if (newTagName.trim()) {
      const newTag = await createTag({ name: newTagName.trim() })
      setSelectedTags([...selectedTags, newTag.id])
      setNewTagName('')
    }
  }

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const data = {
      title,
      content,
      ai_platform_id: aiPlatformId || null,
      prompt_id: promptId || null,
      topic: topic || null,
      notes: notes || null,
      tags: selectedTags
    }

    try {
      if (response?.id) {
        await updateAiResponse(response.id, data)
      } else {
        await createAiResponse(data)
      }
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
            {response?.id ? 'Antwort bearbeiten' : 'Neue KI-Antwort speichern'}
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
            <label className="block text-sm font-medium mb-1">Titel *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="z.B. Erklärung von React Hooks"
              required
            />
          </div>

          {/* AI Platform */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              KI-Quelle
            </label>
            <div className="flex flex-wrap gap-2">
              {aiPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setAiPlatformId(aiPlatformId === platform.id ? '' : platform.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    aiPlatformId === platform.id
                      ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: aiPlatformId === platform.id
                      ? platform.color + '30'
                      : platform.color + '15',
                    color: platform.color
                  }}
                >
                  <AiPlatformIcon
                    platform={platform.name}
                    className="w-4 h-4"
                    color={platform.color}
                  />
                  {platform.name}
                  {aiPlatformId === platform.id && (
                    <Check className="w-3 h-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium mb-1">Thema / Kategorie</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input"
              placeholder="z.B. React, Marketing, SEO, ..."
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">KI-Antwort *</label>
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
              <div className="input min-h-48 overflow-y-auto markdown-content prose dark:prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input min-h-48 font-mono text-sm"
                placeholder="Füge hier die KI-Antwort ein... (Markdown wird unterstützt)"
                required
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Eigene Notizen</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-20"
              placeholder="Zusätzliche Notizen, Kontext, warum du diese Antwort gespeichert hast..."
            />
          </div>

          {/* Link to Prompt */}
          <div>
            <label className="block text-sm font-medium mb-1">Verknüpfter Prompt (optional)</label>
            <select
              value={promptId}
              onChange={(e) => setPromptId(e.target.value)}
              className="input"
            >
              <option value="">Kein Prompt verknüpft</option>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>{prompt.title}</option>
              ))}
            </select>
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
