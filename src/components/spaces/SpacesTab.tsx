// src/components/spaces/SpacesTab.tsx
'use client'

import { useState, useEffect } from 'react'
import SpaceManager from './SpaceManager'
import PrescriptionSpaceAssignment from './PrescriptionSpaceAssignment'

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
  onPrescriptionsUpdated?: () => void
  onNavigateToLibrary?: () => void
}

const PRESCRIPTION_CATEGORIES = [
  {
    id: 'materiaux',
    name: 'Matériaux',
    icon: '🏗️',
    subcategories: [
      { id: 'sol', name: 'Sol', icon: '🟫' },
      { id: 'mur', name: 'Mur', icon: '🧱' },
      { id: 'plafond', name: 'Plafond', icon: '⬜' },
      { id: 'menuiserie', name: 'Menuiserie', icon: '🚪' },
      { id: 'autre_materiau', name: 'Autre matériau', icon: '📦' }
    ]
  },
  {
    id: 'equipements',
    name: 'Équipements techniques',
    icon: '⚡',
    subcategories: [
      { id: 'luminaires', name: 'Luminaires', icon: '💡' },
      { id: 'electrique', name: 'Électrique (prises/inter.)', icon: '🔌' },
      { id: 'robinetterie', name: 'Robinetterie & Sanitaires', icon: '🚿' }
    ]
  },
  {
    id: 'decoration',
    name: 'Détails décoratifs',
    icon: '✨',
    subcategories: [
      { id: 'corniques', name: 'Corniches', icon: '📏' },
      { id: 'moulures', name: 'Moulures', icon: '🎨' },
      { id: 'plinthes', name: 'Plinthes', icon: '📐' },
      { id: 'autre_deco', name: 'Autres détails', icon: '🎭' }
    ]
  },
  {
    id: 'quincaillerie',
    name: 'Quincaillerie',
    icon: '🔧',
    subcategories: [
      { id: 'poignees_portes', name: 'Poignées de portes', icon: '🚪' },
      { id: 'poignees_placards', name: 'Poignées de placards', icon: '🗄️' },
      { id: 'autre_quinc', name: 'Autre quincaillerie', icon: '⚙️' }
    ]
  },
  {
    id: 'autre',
    name: 'Autre',
    icon: '📦',
    subcategories: []
  },
  {
    id: 'mobilier',
    name: 'Mobilier',
    icon: '🛋️',
    subcategories: [
      { id: 'assise', name: 'Assise', icon: '🪑' },
      { id: 'rangement', name: 'Rangement', icon: '📚' },
      { id: 'tables', name: 'Tables', icon: '🪑' },
      { id: 'decoration_mobilier', name: 'Décoration', icon: '🖼️' },
      { id: 'autre_mobilier', name: 'Autre mobilier', icon: '🛋️' }
    ]
  }
]

export default function SpacesTab({ projectId, prescriptions, onPrescriptionClick, onPrescriptionsUpdated, onNavigateToLibrary }: SpacesTabProps) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [selectedSpace, setSelectedSpace] = useState<string>('ALL')
  const [spaceManagerOpen, setSpaceManagerOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [selectedPrescriptionForAssignment, setSelectedPrescriptionForAssignment] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['materiaux']))

  useEffect(() => {
    fetchSpaces()
  }, [projectId])

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/spaces`)
      if (response.ok) {
        const data = await response.json()
        setSpaces(data)
      }
    } catch (error) {
      console.error('Erreur espaces:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const getFilteredPrescriptions = () => {
    return prescriptions.filter(prescription => {
      if (selectedSpace === 'ALL') return true
      if (selectedSpace === 'UNASSIGNED') return !prescription.space
      return prescription.space?.id === selectedSpace
    })
  }

  const categorizePrescriptions = (prescriptions: Prescription[]) => {
    const grouped: { [key: string]: Prescription[] } = {}
    
    prescriptions.forEach(prescription => {
      const categoryName = prescription.category.name
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(prescription)
    })
    
    return grouped
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleAssignPrescription = (prescription: Prescription) => {
    setSelectedPrescriptionForAssignment(prescription)
    setAssignmentModalOpen(true)
  }

  const handleCloseAssignmentModal = () => {
    setAssignmentModalOpen(false)
    setSelectedPrescriptionForAssignment(null)
  }

  const onAssignmentUpdated = () => {
    fetchSpaces()
    if (onPrescriptionsUpdated) {
      onPrescriptionsUpdated()
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Chargement des espaces...</p>
      </div>
    )
  }

  const filteredPrescriptions = getFilteredPrescriptions()
  const categorizedPrescriptions = categorizePrescriptions(filteredPrescriptions)
  const unassignedCount = prescriptions.filter(p => !p.space).length

  return (
    <div className="space-y-6">
      {/* Header avec sélection d'espace */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Gestion des espaces
          </h3>
          <button
            onClick={() => setSpaceManagerOpen(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            ⚙️ Gérer les espaces
          </button>
        </div>

        {/* Sélecteur d'espace */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-slate-600">Espace sélectionné:</span>
          <select
            value={selectedSpace}
            onChange={(e) => setSelectedSpace(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
          >
            <option value="ALL">📋 Vue globale - Tous les espaces</option>
            <option value="UNASSIGNED">
              📦 Prescriptions non assignées ({unassignedCount})
            </option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {getSpaceIcon(space.type)} {space.name} ({space._count?.prescriptions || 0} prescriptions)
              </option>
            ))}
          </select>
        </div>

        {/* Action rapide pour prescriptions non assignées */}
        {unassignedCount > 0 && selectedSpace !== 'UNASSIGNED' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-600">⚠️</span>
                <span className="text-sm text-amber-800">
                  {unassignedCount} prescription{unassignedCount > 1 ? 's' : ''} non assignée{unassignedCount > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setSelectedSpace('UNASSIGNED')}
                className="text-sm text-amber-700 hover:text-amber-900 underline"
              >
                Voir et assigner →
              </button>
            </div>
          </div>
        )}

        {/* Grille des espaces */}
        {spaces.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <div
                key={space.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSpace === space.id
                    ? 'border-slate-800 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedSpace(space.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getSpaceIcon(space.type)}</span>
                  <div>
                    <h4 className="font-medium text-slate-900">{space.name}</h4>
                    <p className="text-sm text-slate-600">{space.type.toLowerCase()}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {space._count.prescriptions} prescription{space._count.prescriptions > 1 ? 's' : ''}
                  {space.surfaceM2 && ` • ${space.surfaceM2} m²`}
                </div>
              </div>
            ))}
          </div>
        )}

        {spaces.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <span className="text-3xl mb-2 block">🏠</span>
            <p className="text-slate-600 mb-4">Aucun espace créé</p>
            <button
              onClick={() => setSpaceManagerOpen(true)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Créer le premier espace
            </button>
          </div>
        )}
      </div>

      {/* Section 3D et Plans */}
      {selectedSpace !== 'ALL' && selectedSpace !== 'UNASSIGNED' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            📐 Visuels et Plans - {spaces.find(s => s.id === selectedSpace)?.name}
          </h3>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Zone 3D */}
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">🎨</div>
              <h4 className="font-medium text-slate-900 mb-2">Visuel 3D</h4>
              <p className="text-sm text-slate-600 mb-4">
                Ajoutez des rendus 3D de cet espace
              </p>
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                + Ajouter visuel 3D
              </button>
            </div>

            {/* Zone Plans */}
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">📋</div>
              <h4 className="font-medium text-slate-900 mb-2">Plans & Élévations</h4>
              <p className="text-sm text-slate-600 mb-4">
                Téléchargez les plans techniques
              </p>
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                + Ajouter plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions organisées par catégories */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            🛋️ Prescriptions ({filteredPrescriptions.length})
          </h3>
          <button 
            onClick={() => onNavigateToLibrary ? onNavigateToLibrary() : alert('Fonctionnalité en développement')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            + Ajouter prescription
          </button>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <span className="text-4xl mb-2 block">📝</span>
            <p className="text-slate-600">
              {selectedSpace === 'ALL' 
                ? 'Aucune prescription dans ce projet'
                : selectedSpace === 'UNASSIGNED'
                ? 'Aucune prescription non assignée'
                : `Aucune prescription dans ${spaces.find(s => s.id === selectedSpace)?.name}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Navigation par catégorie métier */}
            {PRESCRIPTION_CATEGORIES.map((category) => {
              const categoryPrescriptions = Object.entries(categorizedPrescriptions)
                .filter(([_, prescriptions]) => prescriptions.length > 0)
              
              if (categoryPrescriptions.length === 0) return null

              const isExpanded = expandedCategories.has(category.id)
              
              return (
                <div key={category.id} className="border border-slate-200 rounded-lg">
                  {/* Header catégorie */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-slate-900">{category.name}</span>
                      <span className="text-sm text-slate-500">
                        ({categoryPrescriptions.reduce((total, [_, prescriptions]) => total + prescriptions.length, 0)})
                      </span>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Contenu catégorie */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 p-4">
                      {/* Sous-catégories si définies */}
                      {category.subcategories.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.map((sub) => (
                              <span 
                                key={sub.id}
                                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                              >
                                {sub.icon} {sub.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Liste des prescriptions */}
                      <div className="space-y-3">
                        {categoryPrescriptions.map(([categoryName, prescriptions]) => (
                          <div key={categoryName}>
                            <h5 className="text-sm font-medium text-slate-700 mb-2">{categoryName}</h5>
                            <div className="grid gap-3">
                              {prescriptions.map((prescription) => (
                                <div
                                  key={prescription.id}
                                  className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h6 
                                          className="font-medium text-slate-900 cursor-pointer hover:text-slate-700"
                                          onClick={() => onPrescriptionClick(prescription)}
                                        >
                                          {prescription.name}
                                        </h6>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          prescription.status === 'LIVRE' ? 'bg-green-100 text-green-800' :
                                          prescription.status === 'COMMANDE' ? 'bg-blue-100 text-blue-800' :
                                          prescription.status === 'VALIDE' ? 'bg-purple-100 text-purple-800' :
                                          prescription.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {prescription.status === 'LIVRE' ? '✅' :
                                           prescription.status === 'COMMANDE' ? '📦' :
                                           prescription.status === 'VALIDE' ? '👍' :
                                           prescription.status === 'EN_COURS' ? '⏳' :
                                           '📋'}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 mb-2">
                                        {prescription.space ? (
                                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            {getSpaceIcon(prescription.space.type)} {prescription.space.name}
                                          </span>
                                        ) : (
                                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                            📦 Non assignée
                                          </span>
                                        )}
                                        <button
                                          onClick={() => handleAssignPrescription(prescription)}
                                          className="text-xs text-slate-600 hover:text-slate-900 underline"
                                        >
                                          {prescription.space ? 'Changer' : 'Assigner'}
                                        </button>
                                      </div>
                                      
                                      {prescription.brand && (
                                        <p className="text-sm text-slate-600">{prescription.brand}</p>
                                      )}
                                    </div>
                                    <div className="text-right ml-3">
                                      <div className="font-semibold text-slate-900">
                                        {prescription.totalPrice?.toLocaleString('fr-FR')} €
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Qté: {prescription.quantity}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de gestion des espaces */}
      <SpaceManager
        isOpen={spaceManagerOpen}
        onClose={() => setSpaceManagerOpen(false)}
        projectId={projectId}
        onSpacesUpdated={fetchSpaces}
      />

      {/* Modal d'assignation prescription-espace */}
      {selectedPrescriptionForAssignment && (
        <PrescriptionSpaceAssignment
          isOpen={assignmentModalOpen}
          onClose={handleCloseAssignmentModal}
          prescription={selectedPrescriptionForAssignment}
          spaces={spaces}
          onAssignmentUpdated={onAssignmentUpdated}
        />
      )}
    </div>
  )
}