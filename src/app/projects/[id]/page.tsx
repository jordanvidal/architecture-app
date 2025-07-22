'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  createdAt: string
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
  createdAt: string
  space: {
    id: string
    name: string
    type?: string
  }
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
  const [project, setProject] = useState<Project | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string)
      fetchPrescriptions(params.id as string)
    }
  }, [params.id])

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        router.push('/projects')
      }
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/projects')
    } finally {
      setLoading(false)
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

  // Filtrer les prescriptions selon le statut sélectionné
  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (statusFilter === 'ALL') return true
    return prescription.status === statusFilter
  })

  // Focus sur les prescriptions - statuts projet supprimés

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
      {/* Header épuré */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/projects')}
              className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ← Retour
            </button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {project.name}
              </h1>
              <p className="text-slate-600 mb-1">{project.clientName}</p>
              {project.address && (
                <p className="text-sm text-slate-500">{project.address}</p>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {project.budgetTotal?.toLocaleString('fr-FR')} €
              </div>
              <div className="text-sm text-slate-500">
                Dépensé: {project.budgetSpent?.toLocaleString('fr-FR')} €
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
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

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
              { id: 'prescriptions', label: 'Prescriptions', icon: '🛋️' },
              { id: 'files', label: 'Fichiers & Plans', icon: '📁' },
              { id: 'budget', label: 'Budget', icon: '💰' },
              { id: 'comments', label: 'Commentaires', icon: '💬' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id === 'prescriptions' && prescriptions.length === 0) {
                    fetchPrescriptions(project.id)
                  }
                }}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-slate-800 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Informations client */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations client</h3>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-600">Description :</span>
                    <p className="text-slate-900">{project.description}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Client :</span>
                    <p className="text-slate-900">{project.clientName}</p>
                  </div>
                  {project.clientEmail && (
                    <div>
                      <span className="text-sm text-slate-600">Email :</span>
                      <p className="text-slate-900">{project.clientEmail}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-slate-600">Démarré le :</span>
                    <p className="text-slate-900">
                      {new Date(project.startDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-600">Budget total :</span>
                    <p className="text-slate-900 font-semibold">
                      {project.budgetTotal?.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Dépensé :</span>
                    <p className="text-slate-900">
                      {project.budgetSpent?.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Restant :</span>
                    <p className="text-slate-900">
                      {((project.budgetTotal || 0) - (project.budgetSpent || 0)).toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse de livraison */}
            {project.deliveryAddress && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📦 Adresse de livraison</h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <div className="font-medium text-slate-900">
                      {project.deliveryAddress.contactName}
                    </div>
                    {project.deliveryAddress.company && (
                      <div className="text-slate-700">{project.deliveryAddress.company}</div>
                    )}
                    <div className="text-slate-700">
                      {project.deliveryAddress.address}
                    </div>
                    <div className="text-slate-700">
                      {project.deliveryAddress.zipCode} {project.deliveryAddress.city}
                    </div>
                    <div className="text-slate-700">{project.deliveryAddress.country}</div>
                  </div>
                  
                  <div className="space-y-2">
                    {project.deliveryAddress.accessCode && (
                      <div>
                        <span className="text-sm text-slate-600">Code d'accès : </span>
                        <span className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {project.deliveryAddress.accessCode}
                        </span>
                      </div>
                    )}
                    {project.deliveryAddress.floor && (
                      <div>
                        <span className="text-sm text-slate-600">Étage : </span>
                        <span className="text-slate-900">{project.deliveryAddress.floor}</span>
                      </div>
                    )}
                    {project.deliveryAddress.doorCode && (
                      <div>
                        <span className="text-sm text-slate-600">Code porte : </span>
                        <span className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {project.deliveryAddress.doorCode}
                        </span>
                      </div>
                    )}
                    {project.deliveryAddress.instructions && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm text-blue-800 font-medium">Instructions : </span>
                        <p className="text-blue-700 text-sm mt-1">
                          {project.deliveryAddress.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Adresses de facturation */}
            {project.billingAddresses && project.billingAddresses.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  🧾 Adresse{project.billingAddresses.length > 1 ? 's' : ''} de facturation
                </h3>
                <div className="space-y-4">
                  {project.billingAddresses.map((billing, index) => (
                    <div 
                      key={billing.id} 
                      className={`p-4 rounded-lg border ${
                        billing.isDefault 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-slate-900">{billing.name}</div>
                        {billing.isDefault && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Par défaut
                          </span>
                        )}
                      </div>
                      
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-1">
                          {billing.company && (
                            <div className="text-slate-700">{billing.company}</div>
                          )}
                          <div className="text-slate-700">{billing.address}</div>
                          <div className="text-slate-700">
                            {billing.zipCode} {billing.city}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {billing.siret && (
                            <div className="text-sm">
                              <span className="text-slate-600">SIRET : </span>
                              <span className="font-mono text-slate-900">{billing.siret}</span>
                            </div>
                          )}
                          {billing.vatNumber && (
                            <div className="text-sm">
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
          <div className="space-y-6">
            {prescriptionsLoading ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Chargement des prescriptions...</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛋️</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Aucune prescription
                </h3>
                <p className="text-slate-600">
                  Commencez par ajouter des prescriptions à ce projet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header avec titre et bouton d'ajout */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Prescriptions ({filteredPrescriptions.length})
                  </h3>
                  <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                    + Ajouter prescription
                  </button>
                </div>

                {/* Filtres par statut */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'ALL', label: 'Tous', count: prescriptions.length },
                    { key: 'EN_COURS', label: 'En cours', count: prescriptions.filter(p => p.status === 'EN_COURS').length },
                    { key: 'VALIDE', label: 'Validé', count: prescriptions.filter(p => p.status === 'VALIDE').length },
                    { key: 'COMMANDE', label: 'Commandé', count: prescriptions.filter(p => p.status === 'COMMANDE').length },
                    { key: 'LIVRE', label: 'Livré', count: prescriptions.filter(p => p.status === 'LIVRE').length }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setStatusFilter(filter.key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === filter.key
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* Message si aucun résultat */}
                {filteredPrescriptions.length === 0 && statusFilter !== 'ALL' && (
                  <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
                    <span className="text-3xl mb-2 block">🔍</span>
                    <p className="text-slate-600">
                      Aucune prescription avec le statut "{statusFilter.toLowerCase()}"
                    </p>
                  </div>
                )}

                {/* Liste des prescriptions filtrées */}
                <div className="grid gap-4">
                  {filteredPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedPrescription(prescription)
                        setModalOpen(true)
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-slate-900">
                              {prescription.name}
                            </h4>
                            <span className="text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                              {prescription.space.name}
                            </span>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: prescription.category.colorHex || '#64748b' }}
                              title={prescription.category.name}
                            ></div>
                          </div>
                          
                          <div className="text-slate-600 text-sm mb-2">
                            {prescription.brand && (
                              <span className="font-medium">{prescription.brand}</span>
                            )}
                            {prescription.brand && prescription.reference && ' • '}
                            {prescription.reference && (
                              <span className="font-mono">{prescription.reference}</span>
                            )}
                          </div>

                          {prescription.description && (
                            <p className="text-slate-700 text-sm mb-3">
                              {prescription.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-lg font-semibold text-slate-900">
                            {prescription.totalPrice?.toLocaleString('fr-FR')} €
                          </div>
                          <div className="text-sm text-slate-500">
                            Qté: {prescription.quantity}
                          </div>
                        </div>
                      </div>

                      {/* Statut et dates */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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

                          {prescription.supplier && (
                            <span className="text-sm text-slate-500">
                              📍 {prescription.supplier}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-slate-500">
                          {prescription.deliveredAt ? 
                            `Livré le ${new Date(prescription.deliveredAt).toLocaleDateString('fr-FR')}` :
                           prescription.orderedAt ? 
                            `Commandé le ${new Date(prescription.orderedAt).toLocaleDateString('fr-FR')}` :
                           prescription.validatedAt ? 
                            `Validé le ${new Date(prescription.validatedAt).toLocaleDateString('fr-FR')}` :
                            `Créé le ${new Date(prescription.createdAt).toLocaleDateString('fr-FR')}`
                          }
                        </div>
                      </div>

                      {/* Notes si présentes */}
                      {prescription.notes && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-blue-700 text-sm">
                            <strong>💬 Note:</strong> {prescription.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'prescriptions' && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Module en développement
            </h3>
            <p className="text-slate-600">
              Le module "{activeTab}" sera développé dans les prochaines étapes !
            </p>
          </div>
        )}
      </main>

      {/* Modal de détail prescription */}
      {modalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedPrescription.name}
                </h2>
                <p className="text-slate-600 text-sm">
                  {selectedPrescription.space.name} • {selectedPrescription.category.name}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-6">
              {/* Informations générales */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Description</label>
                    <p className="text-slate-900 mt-1">
                      {selectedPrescription.description || 'Aucune description'}
                    </p>
                  </div>

                  {selectedPrescription.brand && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Marque</label>
                      <p className="text-slate-900 mt-1 font-medium">{selectedPrescription.brand}</p>
                    </div>
                  )}

                  {selectedPrescription.reference && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Référence</label>
                      <p className="text-slate-900 mt-1 font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                        {selectedPrescription.reference}
                      </p>
                    </div>
                  )}

                  {selectedPrescription.supplier && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Fournisseur</label>
                      <p className="text-slate-900 mt-1">{selectedPrescription.supplier}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Statut</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedPrescription.status === 'LIVRE' ? 'bg-green-100 text-green-800' :
                        selectedPrescription.status === 'COMMANDE' ? 'bg-blue-100 text-blue-800' :
                        selectedPrescription.status === 'VALIDE' ? 'bg-purple-100 text-purple-800' :
                        selectedPrescription.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPrescription.status === 'LIVRE' ? '✅ Livré' :
                         selectedPrescription.status === 'COMMANDE' ? '📦 Commandé' :
                         selectedPrescription.status === 'VALIDE' ? '👍 Validé' :
                         selectedPrescription.status === 'EN_COURS' ? '⏳ En cours' :
                         selectedPrescription.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Quantité</label>
                      <p className="text-slate-900 mt-1 text-lg font-semibold">
                        {selectedPrescription.quantity}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Prix unitaire</label>
                      <p className="text-slate-900 mt-1 text-lg font-semibold">
                        {selectedPrescription.unitPrice?.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">Total</label>
                    <p className="text-slate-900 mt-1 text-2xl font-bold">
                      {selectedPrescription.totalPrice?.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </div>

              {/* Lien produit */}
              {selectedPrescription.productUrl && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Lien produit</label>
                  <div className="mt-1">
                    <a
                      href={selectedPrescription.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {selectedPrescription.productUrl}
                    </a>
                  </div>
                </div>
              )}

              {/* Dates importantes */}
              <div className="grid gap-4 md:grid-cols-3">
                {selectedPrescription.validatedAt && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Validé le</label>
                    <p className="text-slate-900 mt-1">
                      {new Date(selectedPrescription.validatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {selectedPrescription.orderedAt && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Commandé le</label>
                    <p className="text-slate-900 mt-1">
                      {new Date(selectedPrescription.orderedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {selectedPrescription.deliveredAt && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Livré le</label>
                    <p className="text-slate-900 mt-1">
                      {new Date(selectedPrescription.deliveredAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700">{selectedPrescription.notes}</p>
                  </div>
                </div>
              )}

              {/* Section commentaires */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">💬 Commentaires</h3>
                
                {/* Zone de nouveau commentaire */}
                <div className="mb-6">
                  <textarea
                    placeholder="Ajouter un commentaire..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                      Publier
                    </button>
                  </div>
                </div>

                {/* Liste des commentaires (placeholder) */}
                <div className="space-y-4">
                  <div className="text-center py-8 text-slate-500">
                    <span className="text-4xl mb-2 block">💬</span>
                    Aucun commentaire pour le moment.
                    <br />
                    Soyez le premier à commenter cette prescription !
                  </div>
                </div>
              </div>
            </div>

            {/* Footer du modal */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between">
              <div className="text-sm text-slate-500">
                Créé par {selectedPrescription.creator.firstName} {selectedPrescription.creator.lastName}
                <br />
                le {new Date(selectedPrescription.createdAt).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  Modifier
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
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