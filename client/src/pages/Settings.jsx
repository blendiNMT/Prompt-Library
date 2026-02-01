import { useState, useRef } from 'react'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import {
  Download, Upload, Trash2, Sun, Moon, Tag, Palette, AlertTriangle
} from 'lucide-react'

export default function Settings() {
  const { tags, deleteTag, exportData, importData, categories, updateCategory } = useData()
  const { isDark, toggleTheme } = useTheme()
  const fileInputRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState(null)

  const handleExport = () => {
    exportData()
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportMessage(null)

    try {
      const text = await file.text()
      const json = JSON.parse(text)

      if (!json.data) {
        setImportMessage({ type: 'error', text: 'Ungültiges Dateiformat' })
        return
      }

      const merge = confirm('Möchtest du die Daten zusammenführen (Ja) oder ersetzen (Nein)?')
      await importData(json.data, merge)
      setImportMessage({ type: 'success', text: 'Import erfolgreich!' })
    } catch (error) {
      setImportMessage({ type: 'error', text: 'Fehler beim Import: ' + error.message })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteTag = async (id, name) => {
    if (confirm(`Tag "${name}" wirklich löschen?`)) {
      await deleteTag(id)
    }
  }

  const handleCategoryColor = async (id, color) => {
    await updateCategory(id, { color })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>

      {/* Theme */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Erscheinungsbild
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Dark Mode</div>
            <div className="text-sm text-gray-500">Dunkles Farbschema verwenden</div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isDark ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                isDark ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Kategorie-Farben
        </h2>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between">
              <span>{cat.name}</span>
              <input
                type="color"
                value={cat.color}
                onChange={(e) => handleCategoryColor(cat.id, e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Tags verwalten
        </h2>

        {tags.length === 0 ? (
          <p className="text-gray-500">Keine Tags vorhanden</p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                  <span className="text-xs text-gray-500">({tag.usage_count} Verwendungen)</span>
                </div>
                <button
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Export/Import */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Daten Export / Import
        </h2>

        <div className="space-y-4">
          <div>
            <div className="font-medium mb-2">Exportieren</div>
            <p className="text-sm text-gray-500 mb-3">
              Alle Prompts, Kategorien, Tags und Wissensbasis als JSON exportieren.
            </p>
            <button onClick={handleExport} className="btn btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export herunterladen
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div>
            <div className="font-medium mb-2">Importieren</div>
            <p className="text-sm text-gray-500 mb-3">
              Eine zuvor exportierte JSON-Datei importieren.
            </p>
            <label className="btn btn-secondary flex items-center gap-2 cursor-pointer inline-flex">
              <Upload className="w-4 h-4" />
              {importing ? 'Importiert...' : 'Datei auswählen'}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>

            {importMessage && (
              <div className={`mt-3 p-3 rounded-lg ${
                importMessage.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {importMessage.text}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="card p-6 border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Gefahrenzone
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Diese Aktionen können nicht rückgängig gemacht werden!
        </p>

        <button
          onClick={() => {
            if (confirm('ALLE Daten wirklich löschen? Dies kann nicht rückgängig gemacht werden!')) {
              // In einer echten App würde hier ein API-Call zum Löschen aller Daten kommen
              alert('Diese Funktion ist noch nicht implementiert.')
            }
          }}
          className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Alle Daten löschen
        </button>
      </section>
    </div>
  )
}
