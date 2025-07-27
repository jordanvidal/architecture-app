'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ResourceModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Array<{
    id: string
    name: string
    icon?: string
  }>
  editingResource?: any
  isEditing?: boolean
  onResourceSaved: () => void
}

export default function ResourceModal({
  isOpen,
  onClose,
  categories,
  editingResource,
  isEditing = false,
  onResourceSaved
}: ResourceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    reference: '',
    productUrl: '',
    priceMin: '',
    priceMax: '',
    supplier: '',
    availability: '',
    imageUrl: '',
    tags: [] as string[]
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')

  const roomTags = [
    { value: 'salon', label: '🛋️ Salon' },
    { value: 'cuisine', label: '🍳 Cuisine' },
    { value: 'chambre', label: '🛏️ Chambre' },
    { value: 'salle_de_bain', label: '🚿 Salle de bain' },
    { value: 'bureau', label: '💻 Bureau' },
    { value: 'entree', label: '🚪 Entrée' }
  ]

  useEffect(() => {
    if (editingResource && isEditing) {
      setFormData({
        name: editingResource.name || '',
        description: editingResource.description || '',
        categoryId: editingResource.categoryId || '',
        brand: editingResource.brand || '',
        reference: editingResource.reference || '',
        productUrl: editingResource.productUrl || '',
        priceMin: editingResource.priceMin?.toString() || '',
        priceMax: editingResource.priceMax?.toString() || '',
        supplier: editingResource.supplier || '',
        availability: editingResource.availability || '',
        imageUrl: editingResource.imageUrl || '',
        tags: editingResource.tags || []
      })
    } else {
      // Reset form
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        brand: '',
        reference: '',
        productUrl: '',
        priceMin: '',
        priceMax: '',
        supplier: '',
        availability: '',
        imageUrl: '',
        tags: []
      })
    }
  }, [editingResource, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        priceMin: formData.priceMin ? parseFloat(formData.priceMin) : null,
        priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null
      }

      const url = isEditing && editingResource 
        ? `/api/library/resources/${editingResource.id}`
        : '/api/library/resources'
      
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement')
      }

      onResourceSaved()
      onClose()
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const toggleRoomTag = (roomValue: string) => {
    if (formData.tags.includes(roomValue)) {
      removeTag(roomValue)
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, roomValue]
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            {isEditing ? 'Modifier la ressource' : 'Nouvelle ressource'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Nom et catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-sm md:text-base"
                />
              </div>

              {/* Marque et référence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prix min (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prix max (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Fournisseur et disponibilité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Disponibilité
                  </label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="Ex: En stock, 2-3 semaines"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL du produit
                  </label>
                  <input
                    type="url"
                    value={formData.productUrl}
                    onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Tags pièces */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pièces associées
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {roomTags.map(room => (
                    <button
                      key={room.value}
                      type="button"
                      onClick={() => toggleRoomTag(room.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.tags.includes(room.value)
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {room.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags personnalisés */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags personnalisés
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                  >
                    Ajouter
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm md:text-base"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm md:text-base"
            >
              {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}