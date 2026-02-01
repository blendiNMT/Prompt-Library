import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import PromptEditor from '../components/PromptEditor'
import CopyDialog from '../components/CopyDialog'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft, Copy, Check, Pencil, Trash2, Plus, GitBranch,
  Puzzle, Image, Upload, X, ChevronRight
} from 'lucide-react'

export default function PromptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { deletePrompt, copyPrompt, createPrompt } = useData()

  const [prompt, setPrompt] = useState(null)
  const [children, setChildren] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showNewChild, setShowNewChild] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchPrompt = async () => {
    try {
      const res = await fetch(`/api/prompts/${id}`)
      const data = await res.json()
      setPrompt(data)
      setChildren(data.children || [])
      setAttachments(data.attachments || [])
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompt()
  }, [id])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content)
    await copyPrompt(prompt.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (confirm('Prompt wirklich löschen?')) {
      await deletePrompt(prompt.id)
      navigate('/')
    }
  }

  const handleNewChild = () => {
    setShowNewChild(true)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prompt_id', id)

    try {
      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        await fetchPrompt()
      }
    } catch (error) {
      console.error('Upload Fehler:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (confirm('Anhang löschen?')) {
      await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' })
      await fetchPrompt()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Prompt nicht gefunden</h2>
        <Link to="/" className="text-primary-600 hover:underline">Zurück zur Übersicht</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </Link>

      {/* Breadcrumb if has parent */}
      {prompt.parent && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to={`/prompt/${prompt.parent.id}`} className="hover:text-primary-600">
            {prompt.parent.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>{prompt.title}</span>
        </div>
      )}

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {prompt.is_building_block && (
              <Puzzle className="w-6 h-6 text-primary-500" />
            )}
            <h1 className="text-2xl font-bold">{prompt.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditor(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Bearbeiten
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {prompt.category_name && (
            <span
              className="tag"
              style={{ backgroundColor: prompt.category_color + '20', color: prompt.category_color }}
            >
              {prompt.category_name}
            </span>
          )}
          {prompt.tags?.map((tag) => (
            <span key={tag.id} className="tag bg-gray-100 dark:bg-gray-700">
              {tag.name}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none mb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg markdown-content">
            <ReactMarkdown>{prompt.content}</ReactMarkdown>
          </div>
        </div>

        {/* Copy Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className={`btn flex items-center gap-2 ${
              copied ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Kopiert!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Kopieren
              </>
            )}
          </button>

          {children.length > 0 && (
            <button
              onClick={() => setShowCopyDialog(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Erweitert kopieren ({children.length + 1})
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
          <span>{prompt.use_count || 0}x kopiert</span>
          <span>Erstellt: {new Date(prompt.created_at).toLocaleDateString('de-DE')}</span>
          <span>Bearbeitet: {new Date(prompt.updated_at).toLocaleDateString('de-DE')}</span>
        </div>
      </div>

      {/* Children/Extensions */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Erweiterungen ({children.length})
          </h2>
          <button
            onClick={handleNewChild}
            className="btn btn-secondary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Erweiterung hinzufügen
          </button>
        </div>

        {children.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Keine Erweiterungen vorhanden
          </p>
        ) : (
          <div className="space-y-3">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/prompt/${child.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium">{child.title}</div>
                <div className="text-sm text-gray-500 line-clamp-2 mt-1">{child.content}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Image className="w-5 h-5" />
            Anhänge ({attachments.length})
          </h2>
          <label className="btn btn-secondary flex items-center gap-2 text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? 'Lädt...' : 'Hochladen'}
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {attachments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Keine Anhänge vorhanden
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative group">
                {attachment.type?.startsWith('image/') ? (
                  <img
                    src={`/uploads/${attachment.filepath}`}
                    alt={attachment.filename}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-500">{attachment.filename}</span>
                  </div>
                )}
                <button
                  onClick={() => handleDeleteAttachment(attachment.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditor && (
        <PromptEditor
          prompt={prompt}
          onClose={() => setShowEditor(false)}
          onSave={() => fetchPrompt()}
        />
      )}

      {showNewChild && (
        <PromptEditor
          prompt={{ parent_id: prompt.id, category_id: prompt.category_id }}
          onClose={() => setShowNewChild(false)}
          onSave={() => fetchPrompt()}
        />
      )}

      {showCopyDialog && (
        <CopyDialog
          prompt={prompt}
          children={children}
          onClose={() => setShowCopyDialog(false)}
        />
      )}
    </div>
  )
}
