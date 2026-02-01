import { useState } from 'react'
import { useData } from '../context/DataContext'
import { Plus, Search, Star, Filter, Bot, Trash2, Edit, Eye, Copy, Check, ChevronDown } from 'lucide-react'
import AiPlatformIcon from '../components/AiPlatformIcon'
import ResponseEditor from '../components/ResponseEditor'
import ReactMarkdown from 'react-markdown'

export default function ResearchLibrary() {
  const { aiResponses, aiPlatforms, tags, deleteAiResponse, toggleAiResponseFavorite, fetchAiResponses, loading } = useData()
  const [showEditor, setShowEditor] = useState(false)
  const [editingResponse, setEditingResponse] = useState(null)
  const [viewingResponse, setViewingResponse] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  // Filter responses
  let filteredResponses = aiResponses.filter(r => {
    if (showFavoritesOnly && !r.is_favorite) return false
    if (selectedPlatform && r.ai_platform_id !== selectedPlatform) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return r.title.toLowerCase().includes(query) ||
             r.content.toLowerCase().includes(query) ||
             (r.topic && r.topic.toLowerCase().includes(query))
    }
    return true
  })

  const handleNew = () => {
    setEditingResponse(null)
    setShowEditor(true)
  }

  const handleEdit = (response) => {
    setEditingResponse(response)
    setShowEditor(true)
  }

  const handleView = (response) => {
    setViewingResponse(response)
  }

  const handleDelete = async (id) => {
    if (confirm('Antwort wirklich löschen?')) {
      await deleteAiResponse(id)
    }
  }

  const handleCopy = async (response) => {
    await navigator.clipboard.writeText(response.content)
    setCopiedId(response.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Research Library</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredResponses.length} gespeicherte KI-Antworten
          </p>
        </div>

        <button
          onClick={handleNew}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neue Antwort
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche in Antworten..."
            className="input pl-10 w-full"
          />
        </div>

        {/* Platform Filter */}
        <div className="relative">
          <button
            onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
            className="input py-2 text-sm flex items-center gap-2 pr-8"
          >
            {selectedPlatform ? (
              <>
                <AiPlatformIcon
                  platform={aiPlatforms.find(p => p.id === selectedPlatform)?.name}
                  className="w-4 h-4"
                  color={aiPlatforms.find(p => p.id === selectedPlatform)?.color}
                />
                <span>{aiPlatforms.find(p => p.id === selectedPlatform)?.name}</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Alle KIs</span>
              </>
            )}
            <ChevronDown className={`w-4 h-4 absolute right-2 transition-transform ${showPlatformDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showPlatformDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPlatformDropdown(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-48 max-h-80 overflow-y-auto">
                <button
                  onClick={() => { setSelectedPlatform(null); setShowPlatformDropdown(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm ${
                    !selectedPlatform ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  Alle KIs
                </button>
                {aiPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => { setSelectedPlatform(platform.id); setShowPlatformDropdown(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm ${
                      selectedPlatform === platform.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <AiPlatformIcon platform={platform.name} className="w-4 h-4" color={platform.color} />
                    <span style={{ color: platform.color }}>{platform.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            showFavoritesOnly
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Favoriten
        </button>
      </div>

      {/* Responses List */}
      {filteredResponses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">Noch keine Antworten gespeichert</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Speichere interessante KI-Antworten für später.
          </p>
          <button onClick={handleNew} className="btn btn-primary">
            Erste Antwort speichern
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <div
              key={response.id}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {response.ai_platform_name && (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: response.ai_platform_color + '20',
                          color: response.ai_platform_color
                        }}
                      >
                        <AiPlatformIcon
                          platform={response.ai_platform_name}
                          className="w-3.5 h-3.5"
                          color={response.ai_platform_color}
                        />
                        {response.ai_platform_name}
                      </span>
                    )}
                    {response.topic && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {response.topic}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDate(response.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-2">{response.title}</h3>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {response.content.substring(0, 300)}...
                  </p>

                  {/* Tags */}
                  {response.tags && response.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {response.tags.map((tag, i) => (
                        <span key={i} className="tag bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAiResponseFavorite(response.id)}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      response.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    title="Favorit"
                  >
                    <Star className={`w-5 h-5 ${response.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleCopy(response)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                    title="Kopieren"
                  >
                    {copiedId === response.id ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleView(response)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                    title="Ansehen"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(response)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                    title="Bearbeiten"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(response.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-400"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <ResponseEditor
          response={editingResponse}
          onClose={() => {
            setShowEditor(false)
            setEditingResponse(null)
          }}
        />
      )}

      {/* View Modal */}
      {viewingResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {viewingResponse.ai_platform_name && (
                  <span
                    className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: viewingResponse.ai_platform_color + '20',
                      color: viewingResponse.ai_platform_color
                    }}
                  >
                    <AiPlatformIcon
                      platform={viewingResponse.ai_platform_name}
                      className="w-4 h-4"
                      color={viewingResponse.ai_platform_color}
                    />
                    {viewingResponse.ai_platform_name}
                  </span>
                )}
                <h2 className="text-lg font-semibold">{viewingResponse.title}</h2>
              </div>
              <button
                onClick={() => setViewingResponse(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {viewingResponse.topic && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Thema:</span>
                  <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700">
                    {viewingResponse.topic}
                  </span>
                </div>
              )}
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{viewingResponse.content}</ReactMarkdown>
              </div>
              {viewingResponse.notes && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Notizen:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{viewingResponse.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">
                Gespeichert: {formatDate(viewingResponse.created_at)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(viewingResponse)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Kopieren
                </button>
                <button
                  onClick={() => {
                    setViewingResponse(null)
                    handleEdit(viewingResponse)
                  }}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Bearbeiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
