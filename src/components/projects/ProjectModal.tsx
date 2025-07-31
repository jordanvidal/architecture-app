import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: any
  onProjectSaved?: () => void
}

export default function ProjectModal({ isOpen, onClose, project, onProjectSaved }: ProjectModalProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const isEditing = !!project
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    projectType: project?.projectType || '',
    surfaceM2: project?.surfaceM2 || '',
    hasExterior: project?.hasExterior || false,
    exteriorType: project?.exteriorType || '',
    exteriorSurfaceM2: project?.exteriorSurfaceM2 || '',
    clientName: project?.clientName || '',
    clientEmails: project?.clientEmails || [''],
    address: project?.address || '',
    zipCode: project?.deliveryZipCode || '',
    city: project?.deliveryCity || '',
    country: project?.deliveryCountry || 'France',
    accessCode: project?.deliveryAccessCode || '',
    floor: project?.deliveryFloor || '',
    doorCode: project?.deliveryDoorCode || '',
    deliveryInstructions: project?.deliveryInstructions || '',
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    endDate: project?.endDate || '',
    budgetTotal: project?.budgetTotal || ''
  })

  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const addEmail = () => {
    setFormData(prev => ({
      ...prev,
      clientEmails: [...prev.clientEmails, '']
    }))
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...formData.clientEmails]
    newEmails[index] = value
    setFormData(prev => ({ ...prev, clientEmails: newEmails }))
  }

  const removeEmail = (index: number) => {
    if (formData.clientEmails.length > 1) {
      setFormData(prev => ({
        ...prev,
        clientEmails: prev.clientEmails.filter((_: string, i: number) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validEmails = formData.clientEmails.filter(email => email.trim())
      
      const payload = {
        ...formData,
        clientEmails: validEmails,
        surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : null,
        exteriorSurfaceM2: formData.exteriorSurfaceM2 ? parseFloat(formData.exteriorSurfaceM2) : null,
        budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : null,
      }

      const response = await fetch(
        isEditing ? `/api/projects/${project.id}` : '/api/projects',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      if (response.ok) {
        const data = await response.json()
        addToast(isEditing ? 'Projet modifié avec succès' : 'Projet créé avec succès', 'success')
        onProjectSaved?.()
        onClose()
        if (!isEditing) {
          router.push(`/projects/${data.id}`)
        }
      } else {
        const error = await response.json()
        addToast(error.error || 'Erreur lors de la sauvegarde', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      addToast('Erreur lors de la sauvegarde du projet', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?\n\nCette action est irréversible et supprimera toutes les prescriptions, espaces et fichiers associés.`)) {
      return
    }

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addToast('Projet supprimé avec succès', 'success')
        onProjectSaved?.() // Pour rafraîchir la liste
        onClose()
        router.push('/projects')
      } else {
        const error = await response.json()
        addToast(error.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      addToast('Erreur lors de la suppression du projet', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Informations projet */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Informations projet</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type de projet
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="HOTEL">Hôtel</option>
                    <option value="RESIDENTIEL_APPARTEMENT">Appartement</option>
                    <option value="RESIDENTIEL_MAISON">Maison</option>
                    <option value="RESIDENTIEL_IMMEUBLE">Immeuble</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="RETAIL">Retail</option>
                    <option value="BUREAUX">Bureaux</option>
                    <option value="SCENOGRAPHIE">Scénographie</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Surface intérieure (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.surfaceM2}
                    onChange={(e) => setFormData({ ...formData, surfaceM2: e.target.value })}
                    placeholder="Optionnel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasExterior}
                      onChange={(e) => setFormData({ ...formData, hasExterior: e.target.checked })}
                      className="rounded border-slate-300 text-slate-800 focus:ring-slate-800"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Le projet inclut un espace extérieur
                    </span>
                  </label>
                </div>

                {formData.hasExterior && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Type d'extérieur
                      </label>
                      <select
                        value={formData.exteriorType}
                        onChange={(e) => setFormData({ ...formData, exteriorType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                      >
                        <option value="">Sélectionner</option>
                        <option value="JARDIN">Jardin</option>
                        <option value="TERRASSE">Terrasse</option>
                        <option value="BALCON">Balcon</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Surface extérieure (m²)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.exteriorSurfaceM2}
                        onChange={(e) => setFormData({ ...formData, exteriorSurfaceM2: e.target.value })}
                        placeholder="Optionnel"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Informations client */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Informations client</h3>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email(s) du client
                  </label>
                  {formData.clientEmails.map((email, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder="email@exemple.com"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                      />
                      {formData.clientEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmail(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEmail}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    + Ajouter un email
                  </button>
                </div>
              </div>
            </div>

            {/* Adresse de livraison */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Adresse du projet</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Code accès
                    </label>
                    <input
                      type="text"
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                      placeholder="Optionnel"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Étage
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="Optionnel"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Instructions de livraison
                  </label>
                  <textarea
                    value={formData.deliveryInstructions}
                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    rows={3}
                    placeholder="Instructions spéciales, horaires, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Planning et budget */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Planning et budget</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Budget prescriptions (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budgetTotal}
                    onChange={(e) => setFormData({ ...formData, budgetTotal: e.target.value })}
                    placeholder="Optionnel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Budget prescriptions uniquement (hors travaux)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 mt-6 pt-6 border-t border-slate-200">
            {/* Bouton supprimer à gauche pour les projets existants */}
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer le projet
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Boutons d'action à droite */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? 'Modification...' : 'Création...'}
                  </span>
                ) : (
                  isEditing ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}