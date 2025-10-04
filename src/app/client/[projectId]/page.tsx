// app/client/[projectId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import SpaceCard from './components/SpaceCard'
import PhotoUpload from './components/PhotoUpload'

interface Space {
  id: string
  name: string
  type: string
  surfaceM2: number | null
  prescriptions: any[]
  projectFiles: any[]
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  progressPercentage: number
  imageUrl: string | null
  spaces: Space[]
  files: any[]
}

export default function ClientProjectPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'spaces' | 'moodboard' | 'photos'>('spaces')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/client/projects/${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
      }
    } catch (error) {
      console.error('Erreur chargement projet:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-gray-900">Projet introuvable</h3>
      </div>
    )
  }

  const moodboardFiles = project.files.filter(f => f.category === 'MOODBOARD')
  const inspirationPhotos = project.files.filter(f => f.category === 'INSPIRATION')

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/client"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux projets
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-lg text-gray-600">{project.description}</p>
            )}
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            <Upload className="h-4 w-4" />
            <span>Ajouter une photo</span>
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progression du projet</span>
            <span className="text-lg font-bold text-indigo-600">{project.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${project.progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('spaces')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'spaces'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Pièces & Prescriptions</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('moodboard')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'moodboard'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Moodboard</span>
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {moodboardFiles.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'photos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Galerie Photos</span>
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {inspirationPhotos.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'spaces' && (
        <div className="space-y-6">
          {project.spaces.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune pièce</h3>
              <p className="mt-2 text-sm text-gray-500">
                Les pièces apparaîtront ici une fois ajoutées par votre architecte.
              </p>
            </div>
          ) : (
            project.spaces.map((space) => (
              <SpaceCard key={space.id} space={space} projectId={projectId} />
            ))
          )}
        </div>
      )}

      {activeTab === 'moodboard' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moodboardFiles.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun moodboard</h3>
              <p className="mt-2 text-sm text-gray-500">
                Le moodboard sera disponible prochainement.
              </p>
            </div>
          ) : (
            moodboardFiles.map((file) => (
              <div key={file.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inspirationPhotos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <PhotoUpload
          projectId={projectId}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            setShowUploadModal(false)
            fetchProject()
          }}
        />
      )}
    </div>
  )
}