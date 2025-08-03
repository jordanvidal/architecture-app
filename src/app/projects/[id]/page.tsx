'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import SpacesTab from '@/components/spaces/SpacesTab'
import FilesPlansModule from '@/components/files/FilesPlansModule'
import PrescriptionFormModal from '@/components/prescriptions/PrescriptionFormModal'
import SpaceManagerModal from '@/components/spaces/SpaceManagerModal'

interface Project {
  id: string
  name: string
  description: string
  clientName: string
  clientEmail: string
  address: string
  status: string
  budgetTotal: number
  budgetSpent: number
  progressPercentage: number
  startDate: string
  endDate?: string
  created_at: string
  deliveryAddress?: {
    contactName: string
    company?: string
    address: string
    city: string
    zipCode: string
    country: string
    accessCode?: string
    floor?: string
    doorCode?: string
    instructions?: string
  }
  billingAddresses?: Array<{
    id: string
    isDefault: boolean
    name: string
    company?: string
    address: string
    city: string
    zipCode: string
    country: string
    vatNumber?: string
    siret?: string
  }>
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
  validatedAt?: string
  orderedAt?: string
  deliveredAt?: string
  created_at: string
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

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showLibraryModal, setShowLibraryModal] = useState(false)
  const [spaces, setSpaces] = useState<Array<{ id: string; name: string }>>([])
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [showSpaceManager, setShowSpaceManager] = useState(false)

  useEffect(() => {
    if (projectId) {
      console.log('Loading project with ID:', projectId)
      fetchProject(projectId)
      fetchPrescriptions(projectId)
      fetchSpaces(projectId)
      fetchCategories()
    }
  }, [projectId])

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

  const fetchProject = async (projectId: string) => {
    try {
      console.log('Fetching project:', projectId)
      const response = await fetch(`/api/projects/${projectId}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Project data:', data)
        setProject(data)
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        router.push('/projects')
      }
    } catch (error) {
      console.error('Erreur fetch project:', error)
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
    }
  }

  const fetchPrescriptions = async (projectId: string) => {
    try {
      setPrescriptionsLoading(true)
      const response = await fetch(`/api/projects/${projectId}/prescriptions`)
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      }
    } catch (error) {
      console.error('Erreur prescriptions:', error)
    } finally {
      setPrescriptionsLoading(false)
    }
  }

  // Fonctions pour les commentaires
  const fetchComments = async (prescriptionId: string) => {
    try {
      setCommentsLoading(true)
      const response = await fetch(`/api/prescriptions/${prescriptionId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Erreur comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const addComment = async () => {
    if (!selectedPrescription || !newComment.trim()) return

    try {
      const response = await fetch(`/api/prescriptions/${selectedPrescription.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setComments(prev => [...prev, newCommentData])
        setNewComment('')
      }
    } catch (error) {
      console.error('Erreur ajout comment:', error)
    }
  }

  const openModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setModalOpen(true)
    setComments([])
    fetchComments(prescription.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header responsive */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4">
            <button
              onClick={() => router.push('/projects')}
              className="px-2 sm:px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm sm:text-base"
            >
              ← Retour
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {project.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mb-1">{project.clientName}</p>
              {project.address && (
                <p className="text-xs sm:text-sm text-slate-500">{project.address}</p>
              )}
            </div>
            
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {project.budgetTotal?.toLocaleString('fr-FR')} €
              </div>
              <div className="text-xs sm:text-sm text-slate-500">
                Dépensé: {project.budgetSpent?.toLocaleString('fr-FR')} €
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-2">
              <span>Avancement prescriptions</span>
              <span>{project.progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-slate-800 h-2 rounded-full transition-all duration-500"
                style={{ width: `${project.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Scrollable sur mobile */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Vue d\'ensemble' },
              { id: 'prescriptions', label: 'Prescriptions' },
              { id: 'files', label: 'Fichiers & Plans' },
              { id: 'budget', label: 'Budget' },
              { id: 'comments', label: 'Commentaires' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id === 'prescriptions' && prescriptions.length === 0) {
                    fetchPrescriptions(project.id)
                  }
                }}
                className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Informations client */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Informations client</h3>
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs sm:text-sm text-slate-600">Description :</span>
                    <p className="text-sm sm:text-base text-slate-900">{project.description}</p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-slate-600">Client :</span>
                    <p className="text-sm sm:text-base text-slate-900">{project.clientName}</p>
                  </div>
                  {project.clientEmail && (
                    <div>
                      <span className="text-xs sm:text-sm text-slate-600">Email :</span>
                      <p className="text-sm sm:text-base text-slate-900 break-all">{project.clientEmail}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs sm:text-sm text-slate-600">Démarré le :</span>
                    <p className="text-sm sm:text-base text-slate-900">
                      {new Date(project.startDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs sm:text-sm text-slate-600">Budget total :</span>
                    <p className="text-sm sm:text-base text-slate-900 font-semibold">
                      {project.budgetTotal?.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-slate-600">Dépensé :</span>
                    <p className="text-sm sm:text-base text-slate-900">
                      {project.budgetSpent?.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-slate-600">Restant :</span>
                    <p className="text-sm sm:text-base text-slate-900">
                      {((project.budgetTotal || 0) - (project.budgetSpent || 0)).toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse de livraison - Responsive */}
            {project.deliveryAddress && (
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Adresse de livraison</h3>
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <div className="font-medium text-sm sm:text-base text-slate-900">
                      {project.deliveryAddress.contactName}
                    </div>
                    {project.deliveryAddress.company && (
                      <div className="text-sm sm:text-base text-slate-700">{project.deliveryAddress.company}</div>
                    )}
                    <div className="text-sm sm:text-base text-slate-700">
                      {project.deliveryAddress.address}
                    </div>
                    <div className="text-sm sm:text-base text-slate-700">
                      {project.deliveryAddress.zipCode} {project.deliveryAddress.city}
                    </div>
                    <div className="text-sm sm:text-base text-slate-700">{project.deliveryAddress.country}</div>
                  </div>
                  
                  <div className="space-y-2">
                    {project.deliveryAddress.accessCode && (
                      <div className="text-sm">
                        <span className="text-xs sm:text-sm text-slate-600">Code d'accès : </span>
                        <span className="font-mono text-sm sm:text-base text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {project.deliveryAddress.accessCode}
                        </span>
                      </div>
                    )}
                    {project.deliveryAddress.floor && (
                      <div className="text-sm">
                        <span className="text-xs sm:text-sm text-slate-600">Étage : </span>
                        <span className="text-sm sm:text-base text-slate-900">{project.deliveryAddress.floor}</span>
                      </div>
                    )}
                    {project.deliveryAddress.doorCode && (
                      <div className="text-sm">
                        <span className="text-xs sm:text-sm text-slate-600">Code porte : </span>
                        <span className="font-mono text-sm sm:text-base text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {project.deliveryAddress.doorCode}
                        </span>
                      </div>
                    )}
                    {project.deliveryAddress.instructions && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-xs sm:text-sm text-blue-800 font-medium">Instructions : </span>
                        <p className="text-xs sm:text-sm text-blue-700 mt-1">
                          {project.deliveryAddress.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Adresses de facturation - Responsive */}
            {project.billingAddresses && project.billingAddresses.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                  Adresse{project.billingAddresses.length > 1 ? 's' : ''} de facturation
                </h3>
                <div className="space-y-4">
                  {project.billingAddresses.map((billing, index) => (
                    <div 
                      key={billing.id} 
                      className={`p-3 sm:p-4 rounded-lg border ${
                        billing.isDefault 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <div className="font-medium text-sm sm:text-base text-slate-900">{billing.name}</div>
                        {billing.isDefault && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full self-start">
                            Par défaut
                          </span>
                        )}
                      </div>
                      
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-1">
                          {billing.company && (
                            <div className="text-sm sm:text-base text-slate-700">{billing.company}</div>
                          )}
                          <div className="text-sm sm:text-base text-slate-700">{billing.address}</div>
                          <div className="text-sm sm:text-base text-slate-700">
                            {billing.zipCode} {billing.city}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {billing.siret && (
                            <div className="text-xs sm:text-sm">
                              <span className="text-slate-600">SIRET : </span>
                              <span className="font-mono text-slate-900">{billing.siret}</span>
                            </div>
                          )}
                          {billing.vatNumber && (
                            <div className="text-xs sm:text-sm">
                              <span className="text-slate-600">TVA : </span>
                              <span className="font-mono text-slate-900">{billing.vatNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Prescriptions */}
        {activeTab === 'prescriptions' && (
          <SpacesTab
            projectId={project.id}
            prescriptions={prescriptions}
            onPrescriptionClick={openModal}
            onPrescriptionsUpdated={() => fetchPrescriptions(project.id)}
            onNavigateToLibrary={() => setShowPrescriptionModal(true)}
            onManageSpaces={() => setShowSpaceManager(true)}
          />
        )}

        {activeTab === 'files' && (
          <FilesPlansModule 
            projectId={project.id}
            spaces={spaces}
          />
        )}

        {activeTab !== 'overview' && activeTab !== 'prescriptions' && activeTab !== 'files' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 text-center">
            <div className="text-5xl sm:text-6xl mb-4">🚧</div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
              Module en développement
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Le module "{activeTab}" sera développé dans les prochaines étapes !
            </p>
          </div>
        )}

        {/* Modal de création de prescription */}
        {showPrescriptionModal && (
          <PrescriptionFormModal
            isOpen={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            projectId={project.id}
            spaces={spaces}
            categories={categories}
            onSuccess={() => {
              setShowPrescriptionModal(false)
              fetchPrescriptions(project.id)
            }}
          />
        )}

        {showSpaceManager && (
          <SpaceManagerModal
            isOpen={showSpaceManager}
            onClose={() => setShowSpaceManager(false)}
            projectId={project.id}
            onSpacesUpdated={() => {
              fetchSpaces(project.id)
              fetchPrescriptions(project.id)
            }}
          />
        )}
      </main>

      {/* Modal de détail prescription - Responsive */}
      {modalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {selectedPrescription.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {selectedPrescription.space ? (
                    <>{selectedPrescription.space.name}</>
                  ) : (
                    'Non assignée'
                  )} • {selectedPrescription.category?.name || 'Sans catégorie'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu du modal - Responsive */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Informations générales */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Description</label>
                    <p className="text-sm sm:text-base text-slate-900 mt-1">
                      {selectedPrescription.description || 'Aucune description'}
                    </p>
                  </div>

                  {selectedPrescription.brand && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Marque</label>
                      <p className="text-sm sm:text-base text-slate-900 mt-1 font-medium">{selectedPrescription.brand}</p>
                    </div>
                  )}

                  {selectedPrescription.reference && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Référence</label>
                      <p className="text-xs sm:text-sm text-slate-900 mt-1 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                        {selectedPrescription.reference}
                      </p>
                    </div>
                  )}

                  {selectedPrescription.supplier && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Fournisseur</label>
                      <p className="text-sm sm:text-base text-slate-900 mt-1">{selectedPrescription.supplier}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Statut</label>
                    <div className="mt-1">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        selectedPrescription.status === 'LIVRE' ? 'bg-green-100 text-green-800' :
                        selectedPrescription.status === 'COMMANDE' ? 'bg-blue-100 text-blue-800' :
                        selectedPrescription.status === 'VALIDE' ? 'bg-purple-100 text-purple-800' :
                        selectedPrescription.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPrescription.status === 'LIVRE' ? 'Livré' :
                         selectedPrescription.status === 'COMMANDE' ? 'Commandé' :
                         selectedPrescription.status === 'VALIDE' ? 'Validé' :
                         selectedPrescription.status === 'EN_COURS' ? 'En cours' :
                         selectedPrescription.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Quantité</label>
                      <p className="text-base sm:text-lg text-slate-900 mt-1 font-semibold">
                        {selectedPrescription.quantity}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Prix unitaire</label>
                      <p className="text-base sm:text-lg text-slate-900 mt-1 font-semibold">
                        {selectedPrescription.unitPrice?.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Total</label>
                    <p className="text-xl sm:text-2xl text-slate-900 mt-1 font-bold">
                      {selectedPrescription.totalPrice?.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </div>

              {/* Lien produit */}
              {selectedPrescription.productUrl && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-600">Lien produit</label>
                  <div className="mt-1">
                    <a
                      href={selectedPrescription.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {selectedPrescription.productUrl}
                    </a>
                  </div>
                </div>
              )}

              {/* Dates importantes */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                {selectedPrescription.validatedAt && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Validé le</label>
                    <p className="text-sm sm:text-base text-slate-900 mt-1">
                      {new Date(selectedPrescription.validatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {selectedPrescription.orderedAt && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Commandé le</label>
                    <p className="text-sm sm:text-base text-slate-900 mt-1">
                      {new Date(selectedPrescription.orderedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {selectedPrescription.deliveredAt && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Livré le</label>
                    <p className="text-sm sm:text-base text-slate-900 mt-1">
                      {new Date(selectedPrescription.deliveredAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-600">Notes</label>
                  <div className="mt-2 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">{selectedPrescription.notes}</p>
                  </div>
                </div>
              )}

              {/* Section commentaires - Responsive */}
              <div className="border-t border-slate-200 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                  Commentaires ({comments.length})
                </h3>
                
                {/* Zone de nouveau commentaire */}
                <div className="mb-4 sm:mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-sm"
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Publier
                    </button>
                  </div>
                </div>

                {/* Liste des commentaires */}
                <div className="space-y-3 sm:space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-slate-500 text-xs sm:text-sm">Chargement des commentaires...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-slate-500">
                      <p className="text-sm">Aucun commentaire pour le moment.</p>
                      <p className="text-xs sm:text-sm">Soyez le premier à commenter cette prescription !</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 mb-2">
                          <div className="font-medium text-sm text-slate-900">
                            {comment.creator.firstName} {comment.creator.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer du modal - Responsive */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between gap-3">
              <div className="text-xs sm:text-sm text-slate-500">
                Créé par {selectedPrescription.creator.firstName} {selectedPrescription.creator.lastName}
                <br />
                le {new Date(selectedPrescription.created_at).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm">
                  Modifier
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal temporaire - Ajouter prescription */}
      {showLibraryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-4 sm:p-6">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                Ajouter une prescription
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mb-6">
                Cette fonctionnalité sera bientôt disponible ! En attendant, vous pouvez :
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowLibraryModal(false)
                    router.push('/library')
                  }}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
                >
                  Accéder à la bibliothèque
                </button>
                <button 
                  onClick={() => setShowLibraryModal(false)}
                  className="w-full px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}