import { useState, useEffect } from 'react'

interface AddToProjectModalProps {
  isOpen: boolean
  onClose: () => void
  resource: any
  projects: any[]
}

export default function AddToProjectModal({
  isOpen,
  onClose,
  resource,
  projects
}: AddToProjectModalProps) {
  const [prescriptionData, setPrescriptionData] = useState({
    projectId: '',
    spaceId: '',
    quantity: 1,
    unitPrice: resource?.price || 0,
    totalPrice: resource?.price || 0,
    notes: ''
  })
  
  const [spaces, setSpaces] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prescriptionData.projectId) {
      fetchSpaces(prescriptionData.projectId)
    }
  }, [prescriptionData.projectId])

  useEffect(() => {
    if (resource) {
      setPrescriptionData(prev => ({
        ...prev,
        unitPrice: resource.price || 0,
        totalPrice: (resource.price || 0) * prev.quantity
      }))
    }
  }, [resource])

  const fetchSpaces = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/spaces`)
      if (response.ok) {
        const data = await response.json()
        setSpaces(data)
      }
    } catch (error) {
      console.error('Erreur chargement espaces:', error)
    }
  }

  const handleQuantityChange = (value: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      quantity: value,
      totalPrice: (resource.price || 0) * value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const prescription = {
        name: resource.name,
        description: resource.description,
        brand: resource.brand,
        reference: resource.reference,
        productUrl: resource.productUrl,
        quantity: prescriptionData.quantity,
        unitPrice: resource.price || 0,
        totalPrice: (resource.price || 0) * prescriptionData.quantity,
        supplier: resource.supplier,
        status: 'EN_COURS',
        projectId: prescriptionData.projectId,
        spaceId: prescriptionData.spaceId || null,
        categoryId: resource.categoryId,
        notes: prescriptionData.notes
      }

      const response = await fetch(`/api/projects/${prescriptionData.projectId}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescription)
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !resource) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Ajouter au projet
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Info ressource */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-900 mb-2">{resource.name}</h3>
            {resource.brand && (
              <p className="text-sm text-slate-600 mb-1">{resource.brand}</p>
            )}
            {resource.reference && (
              <p className="text-sm text-slate-500">Réf: {resource.reference}</p>
            )}
            {resource.price && (
              <p className="text-sm font-medium text-slate-900 mt-2">
                {resource.price.toFixed(2)}€ TTC
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Projet *
              </label>
              <select
                required
                value={prescriptionData.projectId}
                onChange={(e) => setPrescriptionData({ 
                  ...prescriptionData, 
                  projectId: e.target.value,
                  spaceId: '' 
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              >
                <option value="">Sélectionner un projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.clientName}
                  </option>
                ))}
              </select>
            </div>

            {prescriptionData.projectId && spaces.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Espace
                </label>
                <select
                  value={prescriptionData.spaceId}
                  onChange={(e) => setPrescriptionData({ 
                    ...prescriptionData, 
                    spaceId: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                >
                  <option value="">Non assigné</option>
                  {spaces.map((space) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={prescriptionData.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prix total
                </label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-900 font-medium">
                  {prescriptionData.totalPrice.toFixed(2)} €
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData({ 
                  ...prescriptionData, 
                  notes: e.target.value 
                })}
                rows={3}
                placeholder="Instructions spéciales, finitions, etc."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !prescriptionData.projectId}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ajout...
                </span>
              ) : (
                'Ajouter au projet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}