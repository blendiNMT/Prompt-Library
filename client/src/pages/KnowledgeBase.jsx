import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import ReactMarkdown from 'react-markdown'
import {
  Plus, Search, Pencil, Trash2, X, Save, Image, Upload, BookOpen
} from 'lucide-react'

export default function KnowledgeBase() {
  const { tags, createTag } = useData()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Editor state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState([])
  const [editId, setEditId] = useState(null)
  const [attachments, setAttachments] = useState([])

  const fetchEntries = async () => {
    try {
      const params = searchQuery ? `?search=${searchQuery}` : ''
      const res = await fetch(`/api/knowledge${params}`)
      const data = await res.json()
      setEntries(data)
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [searchQuery])

  const fetchEntry = async (id) => {
    const res = await fetch(`/api/knowledge/${id}`)
    const data = await res.json()
    setSelectedEntry(data)
    setAttachments(data.attachments || [])
  }

  const handleNew = () => {
    setEditId(null)
    setEditTitle('')
    setEditContent('')
    setEditTags([])
    setShowEditor(true)
  }

  const handleEdit = () => {
    setEditId(selectedEntry.id)
    setEditTitle(selectedEntry.title)
    setEditContent(selectedEntry.content)
    setEditTags(selectedEntry.tags?.map(t => t.id) || [])
    setShowEditor(true)
  }

  const handleSave = async () => {
    const data = {
      title: editTitle,
      content: editContent,
      tags: editTags
    }

    if (editId) {
      await fetch(`/api/knowledge/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } else {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const newEntry = await res.json()
      setSelectedEntry(newEntry)
    }

    setShowEditor(false)
    await fetchEntries()
    if (editId) await fetchEntry(editId)
  }

  const handleDelete = async () => {
    if (confirm('Eintrag wirklich löschen?')) {
      await fetch(`/api/knowledge/${selectedEntry.id}`, { method: 'DELETE' })
      setSelectedEntry(null)
      await fetchEntries()
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedEntry) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('knowledge_id', selectedEntry.id)

    const res = await fetch('/api/attachments', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      await fetchEntry(selectedEntry.id)
    }
  }

  const handleDeleteAttachment = async (id) => {
    await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
    await fetchEntry(selectedEntry.id)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left Panel - List */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Wissensbasis
          </h1>
          <button onClick={handleNew} className="btn btn-primary p-2">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 py-2"
          />
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Lädt...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Keine Einträge
            </div>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => fetchEntry(entry.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedEntry?.id === entry.id
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium truncate">{entry.title}</div>
                {entry.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {entry.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-xs text-gray-500">{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Detail */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        {selectedEntry ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedEntry.title}</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleEdit} className="btn btn-secondary p-2">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-secondary p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tags */}
              {selectedEntry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedEntry.tags.map((tag) => (
                    <span key={tag.id} className="tag bg-gray-100 dark:bg-gray-700">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none markdown-content">
                <ReactMarkdown>{selectedEntry.content}</ReactMarkdown>
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Anhänge ({attachments.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {attachments.map((att) => (
                      <div key={att.id} className="relative group">
                        {att.type?.startsWith('image/') ? (
                          <img
                            src={`/uploads/${att.filepath}`}
                            alt={att.filename}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs">
                            {att.filename}
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <label className="btn btn-secondary flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Bild/Datei hochladen
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleUpload}
                />
              </label>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Wähle einen Eintrag aus oder erstelle einen neuen</p>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                {editId ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
              </h2>
              <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titel</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input"
                  placeholder="z.B. Best Practices für Meta Ads"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Inhalt (Markdown)</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="input min-h-48 font-mono text-sm"
                  placeholder="Notizen, Anleitungen, Informationen..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (editTags.includes(tag.id)) {
                          setEditTags(editTags.filter(id => id !== tag.id))
                        } else {
                          setEditTags([...editTags, tag.id])
                        }
                      }}
                      className={`tag cursor-pointer ${
                        editTags.includes(tag.id)
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowEditor(false)} className="btn btn-secondary">
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={!editTitle}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
