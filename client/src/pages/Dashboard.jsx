import { useState } from 'react'
import { useData } from '../context/DataContext'
import PromptCard from '../components/PromptCard'
import PromptEditor from '../components/PromptEditor'
import AiPlatformIcon from '../components/AiPlatformIcon'
import { Plus, Filter, SortAsc, Puzzle, LayoutGrid, List, Bot, ChevronDown } from 'lucide-react'

export default function Dashboard() {
  const { prompts, tags, selectedTags, setSelectedTags, selectedCategory, categories, aiPlatforms, selectedAiPlatform, setSelectedAiPlatform, loading } = useData()
  const [showEditor, setShowEditor] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [showBuildingBlocks, setShowBuildingBlocks] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('updated')
  const [showAiDropdown, setShowAiDropdown] = useState(false)

  const currentCategory = categories.find(c => c.id === selectedCategory)

  // Filter prompts
  let filteredPrompts = prompts.filter(p => {
    if (showBuildingBlocks) return p.is_building_block
    if (!p.parent_id) return true // Show only top-level prompts
    return false
  })

  // Sort prompts
  filteredPrompts = [...filteredPrompts].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'created':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'used':
        return b.use_count - a.use_count
      default: // updated
        return new Date(b.updated_at) - new Date(a.updated_at)
    }
  })

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt)
    setShowEditor(true)
  }

  const handleNew = () => {
    setEditingPrompt(selectedCategory ? { category_id: selectedCategory } : null)
    setShowEditor(true)
  }

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
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
          <h1 className="text-2xl font-bold">
            {showBuildingBlocks ? 'Bausteine' : currentCategory ? currentCategory.name : 'Alle Prompts'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredPrompts.length} {filteredPrompts.length === 1 ? 'Prompt' : 'Prompts'}
          </p>
        </div>

        <button
          onClick={handleNew}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neuer Prompt
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Tags */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 6).map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`tag cursor-pointer transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* AI Platform Filter */}
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-gray-400" />
          <div className="relative">
            <button
              onClick={() => setShowAiDropdown(!showAiDropdown)}
              className="input py-1.5 text-sm w-auto flex items-center gap-2 pr-8"
            >
              {selectedAiPlatform ? (
                <>
                  <AiPlatformIcon
                    platform={aiPlatforms.find(p => p.id === selectedAiPlatform)?.name}
                    className="w-4 h-4"
                    color={aiPlatforms.find(p => p.id === selectedAiPlatform)?.color}
                  />
                  <span>{aiPlatforms.find(p => p.id === selectedAiPlatform)?.name}</span>
                </>
              ) : (
                <span>Alle KIs</span>
              )}
              <ChevronDown className={`w-4 h-4 absolute right-2 transition-transform ${showAiDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showAiDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAiDropdown(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-48 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedAiPlatform(null); setShowAiDropdown(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm ${
                      !selectedAiPlatform ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    Alle KIs
                  </button>
                  {aiPlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => { setSelectedAiPlatform(platform.id); setShowAiDropdown(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm ${
                        selectedAiPlatform === platform.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <AiPlatformIcon
                        platform={platform.name}
                        className="w-4 h-4"
                        color={platform.color}
                      />
                      <span style={{ color: platform.color }}>{platform.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* Building Blocks Toggle */}
        <button
          onClick={() => setShowBuildingBlocks(!showBuildingBlocks)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showBuildingBlocks
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Puzzle className="w-4 h-4" />
          Bausteine
        </button>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input py-1.5 text-sm w-auto"
          >
            <option value="updated">Zuletzt bearbeitet</option>
            <option value="created">Neueste zuerst</option>
            <option value="title">Alphabetisch</option>
            <option value="used">Meistgenutzt</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prompts Grid/List */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Plus className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">Noch keine Prompts</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Erstelle deinen ersten Prompt, um loszulegen.
          </p>
          <button
            onClick={handleNew}
            className="btn btn-primary"
          >
            Prompt erstellen
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <PromptEditor
          prompt={editingPrompt}
          onClose={() => {
            setShowEditor(false)
            setEditingPrompt(null)
          }}
        />
      )}
    </div>
  )
}
