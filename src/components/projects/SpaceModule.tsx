import { useState } from 'react'

interface Space {
  id: string
  name: string
  type: string
  description?: string
  surfaceM2?: number
}

interface SpacesModuleProps {
  projectId: string
  spaces: Space[]
  onSpacesUpdate: () => void
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

export default function SpacesModule({ projectId, spaces, onSpacesUpdate }: SpacesModuleProps) {
  const [isAddingSpace, setIsAddingSpace] = useState(false)
  const [editingSpace, setEditingSpace] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'AUTRE',
    description: '',
    surfaceM2: ''
  })

  const handleSubmit = async () => {
    if (!formData.name.trim()) return
    
    const payload = {
      name: formData.name,
      type: formData.type,
      description: formData.description || undefined,
      surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : undefined
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setFormData({ name: '', type: 'AUTRE', description: '', surfaceM2: '' })
        setIsAddingSpace(false)
        onSpacesUpdate()
      }
    } catch (error) {
      console.error('Erreur création espace:', error)
    }
  }

  const handleUpdate = async (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId)
    if (!space) return

    const payload = {
      name: formData.name || space.name,
      type: formData.type || space.type,
      description: formData.description,
      surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : space.surfaceM2
    }

    try {
      const response = await fetch(`/api/spaces/${spaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setEditingSpace(null)
        setFormData({ name: '', type: 'AUTRE', description: '', surfaceM2: '' })
        onSpacesUpdate()
      }
    } catch (error) {
      console.error('Erreur mise à jour espace:', error)
    }
  }

  const handleDelete = async (spaceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet espace ?')) return

    try {
      const response = await fetch(`/api/spaces/${spaceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onSpacesUpdate()
      }
    } catch (error) {
      console.error('Erreur suppression espace:', error)
    }
  }

  const startEdit = (space: Space) => {
    setEditingSpace(space.id)
    setFormData({
      name: space.name,
      type: space.type,
      description: space.description || '',
      surfaceM2: space.surfaceM2?.toString() || ''
    })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          🏠 Espaces du projet ({spaces.length})
        </h3>
        {!isAddingSpace && (
          <button
            onClick={() => setIsAddingSpace(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            + Ajouter un espace
          </button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {isAddingSpace && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom de l'espace *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="Ex: Salon principal"
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
                    {type.icon} {type.label}
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
                step="0.1"
                value={formData.surfaceM2}
                onChange={(e) => setFormData({ ...formData, surfaceM2: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="Ex: 25.5"
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
                placeholder="Notes complémentaires"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setIsAddingSpace(false)
                setFormData({ name: '', type: 'AUTRE', description: '', surfaceM2: '' })
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer l'espace
            </button>
          </div>
        </div>
      )}

      {/* Liste des espaces */}
      <div className="grid gap-3">
        {spaces.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="text-3xl mb-2">🏠</div>
            <p>Aucun espace défini pour ce projet</p>
            <p className="text-sm">Commencez par créer vos espaces</p>
          </div>
        ) : (
          spaces.map((space) => {
            const spaceType = SPACE_TYPES.find(t => t.value === space.type)
            const isEditing = editingSpace === space.id

            return (
              <div key={space.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                      />
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                      >
                        {SPACE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingSpace(null)
                          setFormData({ name: '', type: 'AUTRE', description: '', surfaceM2: '' })
                        }}
                        className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleUpdate(space.id)}
                        className="px-3 py-1 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{spaceType?.icon || '📦'}</span>
                      <div>
                        <h4 className="font-medium text-slate-900">{space.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span>{spaceType?.label || 'Autre'}</span>
                          {space.surfaceM2 && (
                            <>
                              <span>•</span>
                              <span>{space.surfaceM2} m²</span>
                            </>
                          )}
                          {space.description && (
                            <>
                              <span>•</span>
                              <span>{space.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(space)}
                        className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(space.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}