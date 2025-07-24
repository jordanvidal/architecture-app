
import { useState } from 'react'
import ProjectCard from './ProjectCard'

interface Project {
  id: string
  name: string
  clientName: string
  status: string
  budgetTotal: number
  budgetSpent: number
  progressPercentage: number
  createdAt: string
  imageUrl?: string
}

interface ProjectGridProps {
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
}

export default function ProjectGrid({ projects, setProjects }: ProjectGridProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    if (!selectedProjectId) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`/api/projects/${selectedProjectId}/upload-image`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? { ...p, imageUrl: data.imageUrl }
            : p
        ))
        setUploadModalOpen(false)
        setSelectedProjectId(null)
      }
    } catch (error) {
      console.error('Erreur upload:', error)
    } finally {
      setUploading(false)
    }
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Aucun projet pour le moment
        </h2>
        <p className="text-slate-600">
          Commencez par créer votre premier projet d'architecture d'intérieur.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onImageUpload={(projectId) => {
              setSelectedProjectId(projectId)
              setUploadModalOpen(true)
            }}
          />
        ))}
      </div>

      {/* Modal d'upload d'image */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Ajouter une image au projet
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Upload en cours...</p>
              </div>
            ) : (
              <div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-slate-600 mb-2">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG jusqu'à 5MB
                    </p>
                  </label>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}