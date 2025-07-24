import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  clientName: string
}

interface AddToProjectModalProps {
  isOpen: boolean
  onClose: () => void
  resource: any
  projects: Project[]
}

export default function AddToProjectModal({
  isOpen,
  onClose,
  resource,
  projects
}: AddToProjectModalProps) {
  const [targetProjectId, setTargetProjectId] = useState<string>('')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('')
  const [projectSpaces, setProjectSpaces] = useState<any[]>([])
  const [prescriptionData, setPrescriptionData] = useState({
    quantity: 1,
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      setTargetProjectId('')
      setSelectedSpaceId('')
      setProjectSpaces([])
      setPrescriptionData({ quantity: 1, notes: '' })
    }
  }, [isOpen])

  const fetchProjectSpaces = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/spaces`)
      if (response.ok) {
        const data = await response.json()
        setProjectSpaces(data)
      }
    } catch (error) {
      console.error('Erreur chargement espaces:', error)
    }
  }

  const handleCreatePrescription = async () => {
    if (!targetProjectId || !resource) return

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: targetProjectId,
          spaceId: selectedSpaceId,
          categoryId: resource.categoryId,
          name: resource.name,
          description: resource.description,
          brand: resource.brand,
          reference: resource.reference,
          productUrl: resource.productUrl,
          quantity: prescriptionData.quantity,
          unitPrice: resource.priceMin || resource.priceMax,
          totalPrice: (resource.priceMin || resource.priceMax || 0) * prescriptionData.quantity,
          supplier: resource.supplier,
          notes: prescriptionData.notes
        })
      })

      if (response.ok) {
        alert(`✅ Prescription "${resource.name}" ajoutée au projet !`)
        onClose()
      }
    } catch (error) {
      console.error('Erreur création prescription:', error)
    }
  }

  if (!isOpen || !resource) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Ajouter à un projet
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: resource.category?.colorHex || '#64748b' }}
              ></div>
              <div>
                <h4 className="font-semibold text-slate-900">{resource.name}</h4>
                <p className="text-sm text-slate-600">
                  {resource.brand} • {resource.category?.name}
                </p>
                {(resource.priceMin || resource.priceMax) && (
                  <p className="text-sm font-medium text-blue-700">
                    {resource.priceMin && resource.priceMax && resource.priceMin !== resource.priceMax
                      ? `${resource.priceMin} - ${resource.priceMax} €`
                      : `${resource.priceMin || resource.priceMax} €`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projet *
              </label>
              <select
                value={targetProjectId}
                onChange={(e) => {
                  setTargetProjectId(e.target.value)
                  setSelectedSpaceId('')
                  if (e.target.value) {
                    fetchProjectSpaces(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choisir un projet</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.clientName}
                  </option>
                ))}
              </select>
            </div>

            {targetProjectId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Espace *
                </label>
                <select
                  value={selectedSpaceId}
                  onChange={(e) => setSelectedSpaceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choisir un espace</option>
                  {projectSpaces.map((space: any) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>
                {projectSpaces.length === 0 && targetProjectId && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Aucun espace défini pour ce projet. Les espaces seront créés automatiquement.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                value={prescriptionData.quantity}
                onChange={(e) => setPrescriptionData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Notes spécifiques pour cette prescription..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreatePrescription}
              disabled={!targetProjectId || !resource}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Créer la prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}