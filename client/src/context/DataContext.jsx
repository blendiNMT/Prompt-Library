import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const DataContext = createContext()

const API_BASE = '/api'

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState([])
  const [prompts, setPrompts] = useState([])
  const [tags, setTags] = useState([])
  const [aiPlatforms, setAiPlatforms] = useState([])
  const [aiResponses, setAiResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedAiPlatform, setSelectedAiPlatform] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Kategorien laden
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, { credentials: 'include' })
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error)
    }
  }, [])

  // Prompts laden
  const fetchPrompts = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.category_id) params.append('category_id', filters.category_id)
      if (filters.tag_id) params.append('tag_id', filters.tag_id)
      if (filters.ai_platform_id) params.append('ai_platform_id', filters.ai_platform_id)
      if (filters.search) params.append('search', filters.search)
      if (filters.is_building_block !== undefined) params.append('is_building_block', filters.is_building_block)
      if (filters.parent_id !== undefined) params.append('parent_id', filters.parent_id)

      const res = await fetch(`${API_BASE}/prompts?${params}`, { credentials: 'include' })
      const data = await res.json()
      setPrompts(data)
    } catch (error) {
      console.error('Fehler beim Laden der Prompts:', error)
    }
  }, [])

  // Tags laden
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tags`, { credentials: 'include' })
      const data = await res.json()
      setTags(data)
    } catch (error) {
      console.error('Fehler beim Laden der Tags:', error)
    }
  }, [])

  // KI-Plattformen laden
  const fetchAiPlatforms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/ai-platforms`, { credentials: 'include' })
      const data = await res.json()
      setAiPlatforms(data)
    } catch (error) {
      console.error('Fehler beim Laden der KI-Plattformen:', error)
    }
  }, [])

  // KI-Antworten laden
  const fetchAiResponses = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.ai_platform_id) params.append('ai_platform_id', filters.ai_platform_id)
      if (filters.tag_id) params.append('tag_id', filters.tag_id)
      if (filters.topic) params.append('topic', filters.topic)
      if (filters.search) params.append('search', filters.search)
      if (filters.is_favorite) params.append('is_favorite', 'true')

      const res = await fetch(`${API_BASE}/ai-responses?${params}`, { credentials: 'include' })
      const data = await res.json()
      setAiResponses(data)
    } catch (error) {
      console.error('Fehler beim Laden der KI-Antworten:', error)
    }
  }, [])

  // Initial laden - nur wenn eingeloggt
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCategories(), fetchPrompts(), fetchTags(), fetchAiPlatforms(), fetchAiResponses()])
      setLoading(false)
    }
    loadData()
  }, [isAuthenticated, fetchCategories, fetchPrompts, fetchTags, fetchAiPlatforms, fetchAiResponses])

  // Prompts neu laden wenn Filter sich ändern
  useEffect(() => {
    const filters = {}
    if (selectedCategory) filters.category_id = selectedCategory
    if (selectedTags.length > 0) filters.tag_id = selectedTags[0]
    if (selectedAiPlatform) filters.ai_platform_id = selectedAiPlatform
    if (searchQuery) filters.search = searchQuery
    fetchPrompts(filters)
  }, [selectedCategory, selectedTags, selectedAiPlatform, searchQuery, fetchPrompts])

  // CRUD Operationen
  const createPrompt = async (promptData) => {
    const res = await fetch(`${API_BASE}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(promptData)
    })
    const newPrompt = await res.json()
    await fetchPrompts()
    await fetchCategories()
    return newPrompt
  }

  const updatePrompt = async (id, promptData) => {
    const res = await fetch(`${API_BASE}/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(promptData)
    })
    const updated = await res.json()
    await fetchPrompts()
    return updated
  }

  const deletePrompt = async (id) => {
    await fetch(`${API_BASE}/prompts/${id}`, { method: 'DELETE', credentials: 'include' })
    await fetchPrompts()
    await fetchCategories()
  }

  const copyPrompt = async (id) => {
    await fetch(`${API_BASE}/prompts/${id}/copy`, { method: 'POST', credentials: 'include' })
    await fetchPrompts()
  }

  const createCategory = async (categoryData) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(categoryData)
    })
    const newCategory = await res.json()
    await fetchCategories()
    return newCategory
  }

  const updateCategory = async (id, categoryData) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(categoryData)
    })
    const updated = await res.json()
    await fetchCategories()
    return updated
  }

  const deleteCategory = async (id) => {
    await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE', credentials: 'include' })
    await fetchCategories()
    await fetchPrompts()
  }

  const createTag = async (tagData) => {
    const res = await fetch(`${API_BASE}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(tagData)
    })
    const newTag = await res.json()
    await fetchTags()
    return newTag
  }

  const deleteTag = async (id) => {
    await fetch(`${API_BASE}/tags/${id}`, { method: 'DELETE', credentials: 'include' })
    await fetchTags()
  }

  // KI-Antworten CRUD
  const createAiResponse = async (responseData) => {
    const res = await fetch(`${API_BASE}/ai-responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(responseData)
    })
    const newResponse = await res.json()
    await fetchAiResponses()
    return newResponse
  }

  const updateAiResponse = async (id, responseData) => {
    const res = await fetch(`${API_BASE}/ai-responses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(responseData)
    })
    const updated = await res.json()
    await fetchAiResponses()
    return updated
  }

  const deleteAiResponse = async (id) => {
    await fetch(`${API_BASE}/ai-responses/${id}`, { method: 'DELETE', credentials: 'include' })
    await fetchAiResponses()
  }

  const toggleAiResponseFavorite = async (id) => {
    await fetch(`${API_BASE}/ai-responses/${id}/favorite`, { method: 'POST', credentials: 'include' })
    await fetchAiResponses()
  }

  // Export/Import
  const exportData = async () => {
    const res = await fetch(`${API_BASE}/export`, { credentials: 'include' })
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-sammlung-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (jsonData, merge = false) => {
    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ data: jsonData, merge })
    })
    if (res.ok) {
      await fetchCategories()
      await fetchPrompts()
      await fetchTags()
    }
    return res.json()
  }

  return (
    <DataContext.Provider value={{
      categories,
      prompts,
      tags,
      aiPlatforms,
      aiResponses,
      loading,
      selectedCategory,
      setSelectedCategory,
      selectedTags,
      setSelectedTags,
      selectedAiPlatform,
      setSelectedAiPlatform,
      searchQuery,
      setSearchQuery,
      fetchPrompts,
      fetchCategories,
      fetchTags,
      fetchAiPlatforms,
      fetchAiResponses,
      createPrompt,
      updatePrompt,
      deletePrompt,
      copyPrompt,
      createCategory,
      updateCategory,
      deleteCategory,
      createTag,
      deleteTag,
      createAiResponse,
      updateAiResponse,
      deleteAiResponse,
      toggleAiResponseFavorite,
      exportData,
      importData
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
