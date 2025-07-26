// src/components/spaces/SpaceManager.tsx
'use client'

import { useState, useEffect } from 'react'

interface Space {
  id: string
  name: string
  type: string
  description?: string
  surfaceM2?: number
  _count: {
    prescriptions: number
  }
}

interface SpaceManagerProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onSpacesUpdated: () => void
}

const SPACE_TYPES = [
  { value: 'SALON', label: 'Salon', icon: '🛋️' },
  { value: 'CUISINE', label: 'Cuisine', icon: '🍳' },
  { value: 'CHAMBRE', label: 'Chambre', icon: '🛏️' },
  { value: 'SALLE_DE_BAIN', label: 'Salle de bain', icon: '🚿' },
  { value: 'BUREAU', label: 'Bureau', icon: '💻' },
  { value: 'ENTREE', label: 'Entrée', icon: '🚪' },
  { value: 'COULOIR', label: 'Couloir', icon: '🏃' },
  { value: 'AUTRE', label: 'Autre', icon: '📦' }
]

export default function SpaceManager({ isOpen, onClose, projectId, onSpacesUpdated }: SpaceManagerProps) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'SALON',
    description: '',
    surfaceM2: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchSpaces()
    }
  }, [isOpen, projectId])

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/spaces`)
      if (response.ok) {
        const data = await response.json()
        setSpaces(data)
      }
    } catch (error) {
      console.error('Erreur chargement espaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setLoading(true)
      
      const url = editingSpace 
        ? `/api/spaces/${editingSpace.id}`
        : `/api/projects/${projectId}/spaces`
      
      const method = editingSpace ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim() || null,
          surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : null
        })
      })

      if (response.ok) {
        await fetchSpaces()
        onSpacesUpdated()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde espace:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (space: Space) => {
    setEditingSpace(space)
    setFormData({
      name: space.name,
      type: space.type,
      description: space.description || '',
      surfaceM2: space.surfaceM2?.toString() || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (space: Space) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${space.name}" ?`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/spaces/${space.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchSpaces()
        onSpacesUpdated()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression espace:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'SALON', description: '', surfaceM2: '' })
    setShowCreateForm(false)
    setEditingSpace(null)
  }

  const getSpaceIcon = (type: string) => {
    return SPACE_TYPES.find(t => t.value === type)?.icon || '📦'
  }

  const getSpaceLabel = (type: string) => {
    return SPACE_TYPES.find(t => t.value === type)?.label || type
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Gestion des espaces
            </h2>
            <p className="text-slate-600 text-sm">
              Organisez votre projet par espaces
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Liste des espaces */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-900">
                Espaces existants ({spaces.length})
              </h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                disabled={loading}
              >
                + Ajouter un espace
              </button>
            </div>

            {loading && !showCreateForm ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Chargement...</p>
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <span className="text-3xl mb-2 block">🏠</span>
                <p className="text-slate-600 mb-4">Aucun espace créé</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Créer le premier espace
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {spaces.map((space) => (
                  <div
                    key={space.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getSpaceIcon(space.type)}</span>
                          <div>
                            <h4 className="font-medium text-slate-900">{space.name}</h4>
                            <p className="text-sm text-slate-600">{getSpaceLabel(space.type)}</p>
                          </div>
                        </div>
                        
                        {space.description && (
                          <p className="text-sm text-slate-700 mb-2">{space.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>
                            {space._count.prescriptions} prescription{space._count.prescriptions > 1 ? 's' : ''}
                          </span>
                          {space.surfaceM2 && (
                            <span>{space.surfaceM2} m²</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(space)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(space)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={loading || space._count.prescriptions > 0}
                          title={space._count.prescriptions > 0 ? 'Impossible de supprimer: prescriptions associées' : 'Supprimer l\'espace'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire création/édition */}
          {showCreateForm && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                {editingSpace ? 'Modifier l\'espace' : 'Créer un nouvel espace'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom de l'espace *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Salon principal"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type d'espace *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    >
                      {SPACE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description optionnelle de l'espace..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="w-32">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.surfaceM2}
                    onChange={(e) => setFormData({ ...formData, surfaceM2: e.target.value })}
                    placeholder="Ex: 25.5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sauvegarde...' : editingSpace ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}