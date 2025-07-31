// src/components/spaces/SpaceManagerModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, Home } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface Space {
  id: string
  name: string
  type: string
  description?: string
  surfaceM2?: number
  _count?: {
    prescriptions: number
  }
}

interface SpaceManagerModalProps {
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
  { value: 'BUREAU', label: 'Bureau', icon: '💼' },
  { value: 'ENTREE', label: 'Entrée', icon: '🚪' },
  { value: 'COULOIR', label: 'Couloir', icon: '🚶' },
  { value: 'AUTRE', label: 'Autre', icon: '📦' }
]

export default function SpaceManagerModal({ 
  isOpen, 
  onClose, 
  projectId, 
  onSpacesUpdated 
}: SpaceManagerModalProps) {
  const { addToast } = useToast()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'AUTRE',
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
      addToast('Erreur lors du chargement des espaces', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'AUTRE',
      description: '',
      surfaceM2: ''
    })
    setEditingSpace(null)
    setShowForm(false)
  }

  const handleEdit = (space: Space) => {
    setEditingSpace(space)
    setFormData({
      name: space.name,
      type: space.type,
      description: space.description || '',
      surfaceM2: space.surfaceM2?.toString() || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      addToast('Le nom de l\'espace est obligatoire', 'error')
      return
    }

    setLoading(true)
    try {
      const url = editingSpace 
        ? `/api/spaces/${editingSpace.id}`
        : `/api/projects/${projectId}/spaces`
      
      const method = editingSpace ? 'PUT' : 'POST'
      
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || null,
        surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : null
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        addToast(
          editingSpace ? 'Espace modifié avec succès' : 'Espace créé avec succès',
          'success'
        )
        await fetchSpaces()
        onSpacesUpdated()
        resetForm()
      } else {
        const error = await response.json()
        addToast(error.error || 'Erreur lors de la sauvegarde', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      addToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (space: Space) => {
    if (space._count?.prescriptions && space._count.prescriptions > 0) {
      addToast(
        `Impossible de supprimer cet espace car il contient ${space._count.prescriptions} prescription(s)`,
        'error'
      )
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${space.name}" ?`)) {
      return
    }

    setDeleteLoading(space.id)
    try {
      const response = await fetch(`/api/spaces/${space.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addToast('Espace supprimé avec succès', 'success')
        await fetchSpaces()
        onSpacesUpdated()
      } else {
        const error = await response.json()
        addToast(error.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      addToast('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteLoading(null)
    }
  }

  const getSpaceTypeLabel = (type: string) => {
    return SPACE_TYPES.find(t => t.value === type)?.label || type
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Gestion des espaces
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Bouton d'ajout */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-6 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border-2 border-dashed border-slate-300"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un espace</span>
            </button>
          )}

          {/* Formulaire */}
          {showForm && (
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                {editingSpace ? 'Modifier l\'espace' : 'Nouvel espace'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom de l'espace *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      placeholder="Ex: Salon principal"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type d'espace
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    >
                      {SPACE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.surfaceM2}
                      onChange={(e) => setFormData({ ...formData, surfaceM2: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      placeholder="Optionnel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      placeholder="Optionnel"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingSpace ? 'Modification...' : 'Création...'}
                      </span>
                    ) : (
                      editingSpace ? 'Modifier' : 'Créer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des espaces */}
          {loading && !showForm ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : spaces.length === 0 && !showForm ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Aucun espace défini
              </h3>
              <p className="text-sm text-slate-600">
                Créez des espaces pour organiser vos prescriptions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">
                          {space.name}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                          {getSpaceTypeLabel(space.type)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {space.surfaceM2 && (
                          <span>{space.surfaceM2} m²</span>
                        )}
                        {space._count?.prescriptions !== undefined && (
                          <span>
                            {space._count.prescriptions} prescription{space._count.prescriptions > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      {space.description && (
                        <p className="text-sm text-slate-500 mt-1">
                          {space.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleEdit(space)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(space)}
                        disabled={deleteLoading === space.id || (space._count?.prescriptions ?? 0) > 0}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={space._count?.prescriptions ? 'Impossible de supprimer (contient des prescriptions)' : 'Supprimer'}
                      >
                        {deleteLoading === space.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}