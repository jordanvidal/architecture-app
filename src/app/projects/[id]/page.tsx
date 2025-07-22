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

        {activeTab !== 'overview' && (
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
    </div>
  )
}