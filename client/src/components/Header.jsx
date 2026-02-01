import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { Search, Sun, Moon, Settings, Menu, X, LogOut } from 'lucide-react'

export default function Header({ onMenuClick }) {
  const { isDark, toggleTheme } = useTheme()
  const { searchQuery, setSearchQuery, prompts } = useData()
  const { logout } = useAuth()
  const [showSearch, setShowSearch] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const searchRef = useRef(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  // Search results
  useEffect(() => {
    if (localSearch.length > 1) {
      const results = prompts.filter(p =>
        p.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(localSearch.toLowerCase())
      ).slice(0, 5)
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }, [localSearch, prompts])

  // Close search on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
      {/* Left: Menu button + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Prompts durchsuchen..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input pl-10"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('')
                setSearchQuery('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-80 overflow-y-auto z-50">
              {searchResults.map((prompt) => (
                <Link
                  key={prompt.id}
                  to={`/prompt/${prompt.id}`}
                  onClick={() => {
                    setShowSearch(false)
                    setLocalSearch('')
                  }}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0"
                >
                  <div className="font-medium truncate">{prompt.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {prompt.content.substring(0, 80)}...
                  </div>
                  {prompt.category_name && (
                    <span
                      className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: prompt.category_color + '20', color: prompt.category_color }}
                    >
                      {prompt.category_name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme toggle + Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <Link
          to="/settings"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Einstellungen"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <button
          onClick={logout}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-red-500"
          title="Ausloggen"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
