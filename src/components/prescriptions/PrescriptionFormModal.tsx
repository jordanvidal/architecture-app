import React, { useState, useEffect } from 'react'
import { X, Search, Plus, Link, Package, Euro, ShoppingCart, FileText, ImageIcon } from 'lucide-react'

interface PrescriptionFormModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  spaces: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string; colorHex?: string }>
  editingPrescription?: any // Prescription à éditer
  onSuccess: () => void
}

interface FormData {
  name: string
  description: string
  spaceId: string
  categoryId: string
  brand: string
  reference: string
  supplier: string
  productUrl: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes: string
  status: string
}

export default function PrescriptionFormModal({
  isOpen,
  onClose,
  projectId,
  spaces,
  categories,
  editingPrescription,
  onSuccess
}: PrescriptionFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    spaceId: '',
    categoryId: '',
    brand: '',
    reference: '',
    supplier: '',
    productUrl: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    notes: '',
    status: 'EN_COURS'
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showLibrary, setShowLibrary] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')
  const [libraryItems, setLibraryItems] = useState<any[]>([])

  // Charger les données si on est en mode édition
  useEffect(() => {
    if (editingPrescription) {
      setFormData({
        name: editingPrescription.name || '',
        description: editingPrescription.description || '',
        spaceId: editingPrescription.spaceId || '',
        categoryId: editingPrescription.categoryId || '',
        brand: editingPrescription.brand || '',
        reference: editingPrescription.reference || '',
        supplier: editingPrescription.supplier || '',
        productUrl: editingPrescription.productUrl || '',
        quantity: editingPrescription.quantity || 1,
        unitPrice: editingPrescription.unitPrice || 0,
        totalPrice: editingPrescription.totalPrice || 0,
        notes: editingPrescription.notes || '',
        status: editingPrescription.status || 'EN_COURS'
      })
    } else {
      // Reset form pour création
      setFormData({
        name: '',
        description: '',
        spaceId: '',
        categoryId: '',
        brand: '',
        reference: '',
        supplier: '',
        productUrl: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        notes: '',
        status: 'EN_COURS'
      })
    }
  }, [editingPrescription])

  // Calculer le prix total automatiquement
  useEffect(() => {
    const total = formData.quantity * formData.unitPrice
    setFormData(prev => ({ ...prev, totalPrice: total }))
  }, [formData.quantity, formData.unitPrice])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire'
    }
    if (!formData.spaceId) {
      newErrors.spaceId = 'Veuillez sélectionner un espace'
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Veuillez sélectionner une catégorie'
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'La quantité doit être au moins 1'
    }
    if (formData.unitPrice < 0) {
      newErrors.unitPrice = 'Le prix ne peut pas être négatif'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const url = editingPrescription
        ? `/api/prescriptions/${editingPrescription.id}`
        : `/api/prescriptions`

      const method = editingPrescription ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId
        })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.message || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleLibrarySearch = async () => {
    try {
      const response = await fetch(`/api/library/resources?search=${librarySearch}`)
      if (response.ok) {
        const data = await response.json()
        setLibraryItems(data)
      }
    } catch (error) {
      console.error('Erreur recherche bibliothèque:', error)
    }
  }

  const selectFromLibrary = (item: any) => {
    setFormData({
      ...formData,
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId,
      brand: item.brand || '',
      reference: item.reference || '',
      supplier: item.supplier || '',
      productUrl: item.productUrl || '',
      unitPrice: item.priceMax || 0
    })
    setShowLibrary(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingPrescription ? 'Modifier la prescription' : 'Nouvelle prescription'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Import depuis la bibliothèque */}
          {!editingPrescription && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-blue-900">
                  Importer depuis la bibliothèque
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLibrary(!showLibrary)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showLibrary ? 'Fermer' : 'Parcourir la bibliothèque'}
                </button>
              </div>
              
              {showLibrary && (
                <div className="mt-4">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Rechercher dans la bibliothèque..."
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLibrarySearch()}
                      className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleLibrarySearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {libraryItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => selectFromLibrary(item)}
                        className="p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-sm text-slate-600">
                          {item.brand} {item.reference && `• ${item.reference}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            {/* Informations principales */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Informations principales
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom de la prescription *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Ex: Canapé 3 places"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Espace *
                    </label>
                    <select
                      value={formData.spaceId}
                      onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                        errors.spaceId ? 'border-red-300' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Sélectionner</option>
                      {spaces.map((space) => (
                        <option key={space.id} value={space.id}>
                          {space.name}
                        </option>
                      ))}
                    </select>
                    {errors.spaceId && (
                      <p className="mt-1 text-sm text-red-600">{errors.spaceId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Catégorie *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                        errors.categoryId ? 'border-red-300' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Sélectionner</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                  placeholder="Description détaillée de la prescription..."
                />
              </div>
            </div>

            {/* Détails du produit */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Détails du produit
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Package className="w-4 h-4 inline mr-1" />
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    placeholder="Ex: Ligne Roset"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Référence
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    placeholder="Ex: TOGO-3P-CUIR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <ShoppingCart className="w-4 h-4 inline mr-1" />
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    placeholder="Ex: Showroom Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Link className="w-4 h-4 inline mr-1" />
                    Lien produit
                  </label>
                  <input
                    type="url"
                    value={formData.productUrl}
                    onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Prix et quantité */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Prix et quantité
              </h3>
              
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                      errors.quantity ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Euro className="w-4 h-4 inline mr-1" />
                    Prix unitaire HT
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                      errors.unitPrice ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.unitPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total HT
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-lg font-semibold text-slate-900">
                    {formData.totalPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </div>
                </div>
              </div>
            </div>

            {/* Notes et statut */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Notes et statut
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes internes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                    placeholder="Notes pour l'équipe..."
                  />
                </div>

                {editingPrescription && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    >
                      <option value="EN_COURS">⏳ En cours</option>
                      <option value="VALIDE">👍 Validé</option>
                      <option value="COMMANDE">📦 Commandé</option>
                      <option value="LIVRE">✅ Livré</option>
                      <option value="ANNULE">❌ Annulé</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Zone d'upload d'images (placeholder) */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">
                L'upload d'images sera disponible prochainement
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          
          <div className="flex gap-2">
            {editingPrescription && (
              <button
                type="button"
                onClick={() => {/* Logique de duplication */}}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Dupliquer
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>{editingPrescription ? 'Mettre à jour' : 'Créer la prescription'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}