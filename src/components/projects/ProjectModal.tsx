'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectSaved: () => void
  editingProject?: {
    id: string
    name: string
    description?: string
    clientName: string
    clientEmail?: string
    address?: string
    budgetTotal?: number
    startDate?: string
    endDate?: string
    deliveryContactName?: string
    deliveryCompany?: string
    deliveryAddress?: string
    deliveryCity?: string
    deliveryZipCode?: string
    deliveryCountry?: string
    deliveryAccessCode?: string
    deliveryFloor?: string
    deliveryDoorCode?: string
    deliveryInstructions?: string
  }
  isEditing?: boolean
}

export default function ProjectModal({
  isOpen,
  onClose,
  onProjectSaved,
  editingProject,
  isEditing = false
}: ProjectModalProps) {
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    clientEmail: '',
    address: '',
    budgetTotal: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    // Adresse de livraison
    deliveryContactName: '',
    deliveryCompany: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryZipCode: '',
    deliveryCountry: 'France',
    deliveryAccessCode: '',
    deliveryFloor: '',
    deliveryDoorCode: '',
    deliveryInstructions: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (editingProject && isEditing) {
      setFormData({
        name: editingProject.name || '',
        description: editingProject.description || '',
        clientName: editingProject.clientName || '',
        clientEmail: editingProject.clientEmail || '',
        address: editingProject.address || '',
        budgetTotal: editingProject.budgetTotal?.toString() || '',
        startDate: editingProject.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: editingProject.endDate?.split('T')[0] || '',
        deliveryContactName: editingProject.deliveryContactName || '',
        deliveryCompany: editingProject.deliveryCompany || '',
        deliveryAddress: editingProject.deliveryAddress || '',
        deliveryCity: editingProject.deliveryCity || '',
        deliveryZipCode: editingProject.deliveryZipCode || '',
        deliveryCountry: editingProject.deliveryCountry || 'France',
        deliveryAccessCode: editingProject.deliveryAccessCode || '',
        deliveryFloor: editingProject.deliveryFloor || '',
        deliveryDoorCode: editingProject.deliveryDoorCode || '',
        deliveryInstructions: editingProject.deliveryInstructions || ''
      })
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        clientName: '',
        clientEmail: '',
        address: '',
        budgetTotal: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        deliveryContactName: '',
        deliveryCompany: '',
        deliveryAddress: '',
        deliveryCity: '',
        deliveryZipCode: '',
        deliveryCountry: 'France',
        deliveryAccessCode: '',
        deliveryFloor: '',
        deliveryDoorCode: '',
        deliveryInstructions: ''
      })
    }
  }, [editingProject, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      }

      const url = isEditing && editingProject 
        ? `/api/projects/${editingProject.id}`
        : '/api/projects'
      
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement')
      }

      onProjectSaved()
      onClose()
      
      // Toast de succès
      addToast(
        isEditing ? 'Projet modifié avec succès' : 'Projet créé avec succès',
        'success'
      )
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      // Toast d'erreur
      addToast('Erreur lors de l\'enregistrement du projet', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingProject || !confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      onProjectSaved()
      onClose()
      
      // Toast de succès
      addToast('Projet supprimé avec succès', 'success')
    } catch (err) {
      setError('Impossible de supprimer le projet.')
      // Toast d'erreur
      addToast('Erreur lors de la suppression du projet', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-hidden mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - Scrollable sur mobile */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'general'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Informations générales
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'delivery'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Adresse de livraison
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {activeTab === 'general' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom du client *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email du client
                    </label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Adresse du projet
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Budget total (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.budgetTotal}
                      onChange={(e) => setFormData({ ...formData, budgetTotal: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date de fin prévisionnelle
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom du contact
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryContactName}
                      onChange={(e) => setFormData({ ...formData, deliveryContactName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryCompany}
                      onChange={(e) => setFormData({ ...formData, deliveryCompany: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryCity}
                      onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryZipCode}
                      onChange={(e) => setFormData({ ...formData, deliveryZipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryCountry}
                      onChange={(e) => setFormData({ ...formData, deliveryCountry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Code d'accès
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryAccessCode}
                      onChange={(e) => setFormData({ ...formData, deliveryAccessCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Étage
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryFloor}
                      onChange={(e) => setFormData({ ...formData, deliveryFloor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Code porte
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryDoorCode}
                      onChange={(e) => setFormData({ ...formData, deliveryDoorCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Instructions de livraison
                  </label>
                  <textarea
                    rows={3}
                    value={formData.deliveryInstructions}
                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none text-sm md:text-base"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-slate-200 bg-slate-50">
            <div className="w-full sm:w-auto">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-sm md:text-base"
                >
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-initial px-4 py-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm md:text-base"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}