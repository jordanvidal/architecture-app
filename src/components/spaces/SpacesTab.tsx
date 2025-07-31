'use client'

import { useState } from 'react'
import { Plus, Filter, Search, Settings } from 'lucide-react'

interface Prescription {
  id: string
  name: string
  description?: string
  brand?: string
  reference?: string
  productUrl?: string
  quantity: number
  unitPrice?: number
  totalPrice?: number
  supplier?: string
  status: string
  notes?: string
  validatedAt?: string
  orderedAt?: string
  deliveredAt?: string
  createdAt: string
  space: {
    id: string
    name: string
    type?: string
  } | null
  category: {
    id: string
    name: string
    colorHex?: string
    icon?: string
  }
  creator: {
    firstName?: string
    lastName?: string
    email: string
  }
}

interface SpacesTabProps {
  projectId: string
  prescriptions: Prescription[]
  onPrescriptionClick: (prescription: Prescription) => void
  onPrescriptionsUpdated: () => void
  onNavigateToLibrary: () => void
  onManageSpaces?: () => void
}

export default function SpacesTab({
  projectId,
  prescriptions,
  onPrescriptionClick,
  onPrescriptionsUpdated,
  onNavigateToLibrary,
  onManageSpaces
}: SpacesTabProps) {
  const [selectedSpace, setSelectedSpace] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const spaces = Array.from(new Set(prescriptions.map(p => p.space?.id).filter(Boolean)))
    .map(spaceId => {
      const prescription = prescriptions.find(p => p.space?.id === spaceId)
      return prescription?.space
    })
    .filter(Boolean)

  const getSpaceIcon = (type?: string) => {
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
    return icons[type || ''] || '📦'
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSpace = selectedSpace === 'ALL' || 
      (selectedSpace === 'UNASSIGNED' && !prescription.space) ||
      prescription.space?.id === selectedSpace
    
    const matchesStatus = selectedStatus === 'ALL' || prescription.status === selectedStatus
    
    const matchesSearch = searchQuery === '' ||
      prescription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSpace && matchesStatus && matchesSearch
  })

  const totalAmount = filteredPrescriptions.reduce((sum, p) => sum + (p.totalPrice || 0), 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une prescription..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onNavigateToLibrary}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une prescription</span>
            </button>
            
            {onManageSpaces && (
              <button
                onClick={onManageSpaces}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm sm:text-base flex items-center gap-2"
                title="Gérer les espaces"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Espaces</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Filtrer par espace</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              <button
                onClick={() => setSelectedSpace('ALL')}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedSpace === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tous les espaces
              </button>
              <button
                onClick={() => setSelectedSpace('UNASSIGNED')}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedSpace === 'UNASSIGNED'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📦 Non assignées
              </button>
              {spaces.map(space => (
                <button
                  key={space.id}
                  onClick={() => setSelectedSpace(space.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                    selectedSpace === space.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {getSpaceIcon(space.type)} {space.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Filtrer par statut</h3>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedStatus === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedStatus('EN_COURS')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedStatus === 'EN_COURS'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                ⏳ En cours
              </button>
              <button
                onClick={() => setSelectedStatus('VALIDE')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedStatus === 'VALIDE'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`}
              >
                👍 Validé
              </button>
              <button
                onClick={() => setSelectedStatus('COMMANDE')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedStatus === 'COMMANDE'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                📦 Commandé
              </button>
              <button
                onClick={() => setSelectedStatus('LIVRE')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedStatus === 'LIVRE'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                ✅ Livré
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="text-sm text-slate-600">
            {filteredPrescriptions.length} prescription{filteredPrescriptions.length > 1 ? 's' : ''} trouvée{filteredPrescriptions.length > 1 ? 's' : ''}
          </div>
          <div className="text-base sm:text-lg font-semibold text-slate-900">
            Total : {totalAmount.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {filteredPrescriptions.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4">🛋️</div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
            Aucune prescription trouvée
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mb-6">
            {searchQuery || selectedSpace !== 'ALL' || selectedStatus !== 'ALL'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter votre première prescription'}
          </p>
          {(!searchQuery && selectedSpace === 'ALL' && selectedStatus === 'ALL') && (
            <button
              onClick={onNavigateToLibrary}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
            >
              Ajouter une prescription
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              onClick={() => onPrescriptionClick(prescription)}
              className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      {prescription.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      prescription.status === 'LIVRE' ? 'bg-green-100 text-green-800' :
                      prescription.status === 'COMMANDE' ? 'bg-blue-100 text-blue-800' :
                      prescription.status === 'VALIDE' ? 'bg-purple-100 text-purple-800' :
                      prescription.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {prescription.status === 'LIVRE' ? '✅ Livré' :
                       prescription.status === 'COMMANDE' ? '📦 Commandé' :
                       prescription.status === 'VALIDE' ? '👍 Validé' :
                       prescription.status === 'EN_COURS' ? '⏳ En cours' :
                       prescription.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-2">
                    {prescription.space ? (
                      <span className="flex items-center gap-1">
                        {getSpaceIcon(prescription.space.type)} {prescription.space.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">📦 Non assignée</span>
                    )}
                    <span>•</span>
                    <span>{prescription.category.icon} {prescription.category.name}</span>
                  </div>

                  {prescription.brand && (
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Marque :</span> {prescription.brand}
                    </p>
                  )}
                  {prescription.reference && (
                    <p className="text-xs text-slate-500 font-mono">
                      Réf: {prescription.reference}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-xs text-slate-600">
                      {prescription.quantity} × {prescription.unitPrice?.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      {prescription.totalPrice?.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                </div>
              </div>

              {prescription.notes && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-700">{prescription.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}