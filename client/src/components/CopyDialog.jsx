import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { X, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'

export default function CopyDialog({ prompt, children = [], onClose }) {
  const { copyPrompt } = useData()
  const [selectedItems, setSelectedItems] = useState([prompt.id])
  const [copied, setCopied] = useState(false)
  const [showChildren, setShowChildren] = useState(true)

  const toggleItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const selectAll = () => {
    setSelectedItems([prompt.id, ...children.map(c => c.id)])
  }

  const selectNone = () => {
    setSelectedItems([])
  }

  const getCombinedContent = () => {
    const allPrompts = [prompt, ...children]
    return selectedItems
      .map(id => allPrompts.find(p => p.id === id)?.content)
      .filter(Boolean)
      .join('\n\n---\n\n')
  }

  const handleCopy = async () => {
    const content = getCombinedContent()
    await navigator.clipboard.writeText(content)

    // Track usage for all copied prompts
    for (const id of selectedItems) {
      await copyPrompt(id)
    }

    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Prompts kopieren</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {selectedItems.length} von {1 + children.length} ausgewählt
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Alle
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={selectNone}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Keine
              </button>
            </div>
          </div>

          {/* Main Prompt */}
          <div
            onClick={() => toggleItem(prompt.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors mb-2 ${
              selectedItems.includes(prompt.id)
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.includes(prompt.id)}
                onChange={() => toggleItem(prompt.id)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium">{prompt.title}</div>
                <div className="text-sm text-gray-500 line-clamp-2">{prompt.content}</div>
              </div>
            </div>
          </div>

          {/* Children */}
          {children.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowChildren(!showChildren)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {showChildren ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Erweiterungen ({children.length})
              </button>

              {showChildren && (
                <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => toggleItem(child.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedItems.includes(child.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(child.id)}
                          onChange={() => toggleItem(child.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-sm">{child.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{child.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {selectedItems.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Vorschau:</div>
              <pre className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                {getCombinedContent()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn btn-secondary">
            Abbrechen
          </button>
          <button
            onClick={handleCopy}
            disabled={selectedItems.length === 0}
            className={`btn flex items-center gap-2 ${
              copied ? 'bg-green-600 hover:bg-green-700' : 'btn-primary'
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
                Kopieren ({selectedItems.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
