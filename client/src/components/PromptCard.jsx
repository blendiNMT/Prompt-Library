import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Copy, Check, MoreVertical, Pencil, Trash2, GitBranch, Puzzle } from 'lucide-react'
import AiPlatformIcon from './AiPlatformIcon'

export default function PromptCard({ prompt, onEdit }) {
  const { copyPrompt, deletePrompt } = useData()
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleCopy = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    await navigator.clipboard.writeText(prompt.content)
    await copyPrompt(prompt.id)

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (confirm('Prompt wirklich löschen?')) {
      await deletePrompt(prompt.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="card group hover:shadow-md transition-shadow">
      <Link to={`/prompt/${prompt.id}`} className="block p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {prompt.is_building_block ? (
              <Puzzle className="w-4 h-4 text-primary-500 flex-shrink-0" />
            ) : prompt.parent_id ? (
              <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : null}
            <h3 className="font-semibold truncate">{prompt.title}</h3>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-10 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 min-w-32">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEdit?.(prompt)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-left"
                >
                  <Pencil className="w-4 h-4" /> Bearbeiten
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-left text-red-600"
                >
                  <Trash2 className="w-4 h-4" /> Löschen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Badge */}
        {prompt.category_name && (
          <span
            className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: prompt.category_color + '20', color: prompt.category_color }}
          >
            {prompt.category_name}
          </span>
        )}

        {/* AI Platform Badges */}
        {prompt.ai_platforms && prompt.ai_platforms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {prompt.ai_platforms.slice(0, 4).map((platform, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: prompt.ai_platform_colors?.[i] + '20',
                  color: prompt.ai_platform_colors?.[i]
                }}
                title={platform}
              >
                <AiPlatformIcon
                  platform={platform}
                  className="w-3.5 h-3.5"
                  color={prompt.ai_platform_colors?.[i]}
                />
              </span>
            ))}
            {prompt.ai_platforms.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600">
                +{prompt.ai_platforms.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Content Preview */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
          {prompt.content}
        </p>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="tag bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {prompt.children_count > 0 && (
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {prompt.children_count} Erweiterungen
              </span>
            )}
            {prompt.use_count > 0 && (
              <span>{prompt.use_count}x kopiert</span>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
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
                Copy
              </>
            )}
          </button>
        </div>
      </Link>
    </div>
  )
}
