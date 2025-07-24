import { useState, useEffect } from 'react'

interface ResourceModalProps {
  isOpen: boolean
  onClose: () => void
  categories: any[]
  editingResource: any
  isEditing: boolean
  onResourceSaved: () => void
}

export default function ResourceModal({
  isOpen,
  onClose,
  categories,
  editingResource,
  isEditing,
  onResourceSaved
}: ResourceModalProps) {
  const [newResource, setNewResource] = useState({
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
    tags: ''
  })

  useEffect(() => {
    if (isEditing && editingResource) {
      setNewResource({
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
        tags: editingResource.tags?.join(', ') || ''
      })
    } else {
      setNewResource({
        name: '', description: '', categoryId: '', brand: '', reference: '',
        productUrl: '', priceMin: '', priceMax: '', supplier: '', availability: '', tags: ''
      })
    }
  }, [isEditing, editingResource])

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/library/resources/${editingResource.id}` : '/api/library/resources'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newResource,
          tags: newResource.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
        })
      })

      if (response.ok) {
        onResourceSaved()
        onClose()
      }
    } catch (error) {
      console.error('Erreur ajout/édition ressource:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-900">
              {isEditing ? 'Modifier le produit' : 'Ajouter un produit à la bibliothèque'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                value={newResource.name}
                onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Canapé d'angle KIVIK"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Catégorie *
              </label>
              <select
                value={newResource.categoryId}
                onChange={(e) => setNewResource(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
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
              value={newResource.description}
              onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Description détaillée du produit..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Marque
              </label>
              <input
                type="text"
                value={newResource.brand}
                onChange={(e) => setNewResource(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: IKEA, BoConcept..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Référence
              </label>
              <input
                type="text"
                value={newResource.reference}
                onChange={(e) => setNewResource(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: KIVIK-ANGLE-3PL"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prix minimum (€)
              </label>
              <input
                type="number"
                value={newResource.priceMin}
                onChange={(e) => setNewResource(prev => ({ ...prev, priceMin: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="299"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prix maximum (€)
              </label>
              <input
                type="number"
                value={newResource.priceMax}
                onChange={(e) => setNewResource(prev => ({ ...prev, priceMax: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="399"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fournisseur
              </label>
              <input
                type="text"
                value={newResource.supplier}
                onChange={(e) => setNewResource(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: IKEA France"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Disponibilité
              </label>
              <select
                value={newResource.availability}
                onChange={(e) => setNewResource(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner</option>
                <option value="En stock">En stock</option>
                <option value="Sur commande">Sur commande</option>
                <option value="Selon saison">Selon saison</option>
                <option value="Rupture">Rupture temporaire</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lien produit
            </label>
            <input
              type="url"
              value={newResource.productUrl}
              onChange={(e) => setNewResource(prev => ({ ...prev, productUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.ikea.com/fr/fr/p/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags / Pièces (séparés par des virgules)
            </label>
            <input
              type="text"
              value={newResource.tags}
              onChange={(e) => setNewResource(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="salon, moderne, familial, cuisine"
            />
            <p className="text-xs text-slate-500 mt-1">
              Ajoutez des pièces (salon, cuisine, chambre...) pour le filtre par pièce
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newResource.name || !newResource.categoryId}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter le produit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}