import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
  FolderOpen, Target, Megaphone, Presentation, Palette, FileText,
  Mail, Puzzle, BookOpen, Library, ChevronLeft, Plus, MoreVertical,
  Pencil, Trash2, X
} from 'lucide-react'

const iconMap = {
  folder: FolderOpen,
  target: Target,
  megaphone: Megaphone,
  presentation: Presentation,
  palette: Palette,
  'file-text': FileText,
  mail: Mail,
  puzzle: Puzzle
}

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { categories, selectedCategory, setSelectedCategory, createCategory, updateCategory, deleteCategory } = useData()
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [showMenu, setShowMenu] = useState(null)

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      await createCategory({ name: newCategoryName.trim() })
      setNewCategoryName('')
      setShowNewCategory(false)
    }
  }

  const handleUpdateCategory = async (id, name) => {
    await updateCategory(id, { name })
    setEditingCategory(null)
  }

  const handleDeleteCategory = async (id) => {
    if (confirm('Kategorie wirklich löschen? Die Prompts bleiben erhalten.')) {
      await deleteCategory(id)
      if (selectedCategory === id) {
        setSelectedCategory(null)
      }
    }
    setShowMenu(null)
  }

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h1 className="font-bold text-lg text-primary-600 dark:text-primary-400 whitespace-nowrap">
          Prompt Sammlung
        </h1>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Kategorien */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Kategorien
          </span>
          <button
            onClick={() => setShowNewCategory(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Neue Kategorie Form */}
        {showNewCategory && (
          <form onSubmit={handleCreateCategory} className="mb-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Name..."
                className="input text-sm py-1"
                autoFocus
              />
              <button type="submit" className="btn btn-primary py-1 px-2">
                <Plus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setShowNewCategory(false)} className="btn btn-secondary py-1 px-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Alle Prompts */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors ${
            selectedCategory === null && location.pathname === '/'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          <span className="flex-1">Alle Prompts</span>
        </button>

        {/* Kategorie Liste */}
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || FolderOpen
          const isSelected = selectedCategory === category.id
          const isEditing = editingCategory === category.id

          return (
            <div key={category.id} className="relative group">
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleUpdateCategory(category.id, e.target.name.value)
                  }}
                  className="flex gap-1 mb-1"
                >
                  <input
                    name="name"
                    defaultValue={category.name}
                    className="input text-sm py-1 flex-1"
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary py-1 px-2 text-xs">OK</button>
                  <button type="button" onClick={() => setEditingCategory(null)} className="btn btn-secondary py-1 px-2">
                    <X className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors ${
                    isSelected
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" style={{ color: category.color }} />
                  <span className="flex-1 truncate">{category.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {category.prompt_count || 0}
                  </span>

                  {/* Menü Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(showMenu === category.id ? null : category.id)
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </button>
              )}

              {/* Dropdown Menü */}
              {showMenu === category.id && (
                <div className="absolute right-0 top-full z-10 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 min-w-32">
                  <button
                    onClick={() => {
                      setEditingCategory(category.id)
                      setShowMenu(null)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-left"
                  >
                    <Pencil className="w-4 h-4" /> Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-left text-red-600"
                  >
                    <Trash2 className="w-4 h-4" /> Löschen
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Weitere Links */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <Link
            to="/research"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              location.pathname === '/research'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Library className="w-5 h-5" />
            <span>Research Library</span>
          </Link>
          <Link
            to="/knowledge"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              location.pathname === '/knowledge'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Wissensbasis</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
