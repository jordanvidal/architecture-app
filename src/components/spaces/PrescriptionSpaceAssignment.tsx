// src/components/spaces/PrescriptionSpaceAssignment.tsx
'use client'

import { useState } from 'react'

interface Space {
  id: string
  name: string
  type: string
  _count: {
    prescriptions: number
  }
}

interface Prescription {
  id: string
  name: string
  brand?: string
  totalPrice?: number
  space: {
    id: string
    name: string
    type?: string
  } | null
  category: {
    name: string
    colorHex?: string
  }
}

interface PrescriptionSpaceAssignmentProps {
  isOpen: boolean
  onClose: () => void
  prescription: Prescription
  spaces: Space[]
  onAssignmentUpdated: () => void
}

export default function PrescriptionSpaceAssignment({ 
  isOpen, 
  onClose, 
  prescription, 
  spaces, 
  onAssignmentUpdated 
}: PrescriptionSpaceAssignmentProps) {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(prescription.space?.id || '')
  const [loading, setLoading] = useState(false)

  const getSpaceIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'SALON': '🛋️',
      'CUISINE': '🍳',
      'CHAMBRE': '🛏️',
      'SALLE_DE_BAIN': '🚿',
      'BUREAU': '💻',
      'ENTREE': '🚪',
      'COULOIR': '🏃',
      'AUTRE': '📦'
    }
    return icons[type] || '📦'
  }

  const handleAssignment = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/prescriptions/${prescription.id}/assign-space`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spaceId: selectedSpaceId || null 
        })
      })

      if (response.ok) {
        onAssignmentUpdated()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'assignation')
      }
    } catch (error) {
      console.error('Erreur assignation:', error)
      alert('Erreur lors de l\'assignation')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Assigner à un espace
              </h3>
              <p className="text-slate-600 text-sm">
                {prescription.name}
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
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Sélectionner un espace :
            </label>
            
            {/* Option "Non assignée" */}
            <label className="flex items-center p-3 border border-slate-200 rounded-lg mb-2 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="space"
                value=""
                checked={selectedSpaceId === ''}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="mr-3"
              />
              <div className="flex items-center gap-3">
                <span className="text-xl">📦</span>
                <div>
                  <div className="font-medium text-slate-900">Non assignée</div>
                  <div className="text-sm text-slate-500">Prescription sans espace défini</div>
                </div>
              </div>
            </label>

            {/* Liste des espaces */}
            {spaces.map((space) => (
              <label 
                key={space.id}
                className="flex items-center p-3 border border-slate-200 rounded-lg mb-2 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="space"
                  value={space.id}
                  checked={selectedSpaceId === space.id}
                  onChange={(e) => setSelectedSpaceId(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getSpaceIcon(space.type)}</span>
                  <div>
                    <div className="font-medium text-slate-900">{space.name}</div>
                    <div className="text-sm text-slate-500">
                      {space.type.toLowerCase()} • {space._count.prescriptions} prescription{space._count.prescriptions > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </label>
            ))}

            {spaces.length === 0 && (
              <div className="text-center py-6 text-slate-500">
                <span className="text-3xl mb-2 block">🏠</span>
                Aucun espace créé.
                <br />
                Créez d'abord des espaces pour assigner cette prescription.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleAssignment}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assignation...' : 'Assigner'}
          </button>
        </div>
      </div>
    </div>
  )
}