// src/app/(client)/[projectId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, FileText, Upload, Sparkles, TrendingUp } from 'lucide-react'
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
  const router = useRouter()
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
      } else {
        const error = await res.json()
        console.error('Erreur:', error)
        alert(error.error || 'Erreur lors du chargement du projet')
      }
    } catch (error) {
      console.error('Erreur chargement projet:', error)
      alert('Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-600 animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Projet introuvable</h3>
          <p className="text-gray-600 mb-6">Ce projet n'existe pas ou vous n'y avez pas accès.</p>
          <button
            onClick={() => router.push('/client')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            Retour aux projets
          </button>
        </div>
      </div>
    )
  }

  const moodboardFiles = project.files.filter(f => f.category === 'MOODBOARD')
  const inspirationPhotos = project.files.filter(f => f.category === 'INSPIRATION')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => router.push('/client')}
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour aux projets</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white/95 backdrop-blur-sm text-purple-600 rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="h-5 w-5" />
              <span className="font-medium">Ajouter une photo</span>
            </button>
          </div>

          {/* Progress */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-white/90">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Progression du projet</span>
              </div>
              <span className="text-2xl font-bold">{project.progressPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-1000 shadow-lg"
                style={{ 
                  width: `${project.progressPercentage}%`,
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('spaces')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'spaces'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Pièces & Prescriptions</span>
          </button>

          <button
            onClick={() => setActiveTab('moodboard')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'moodboard'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            <span>Moodboard</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {moodboardFiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            <span>Galerie</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {inspirationPhotos.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'spaces' && (
          <div className="space-y-8">
            {project.spaces.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune pièce</h3>
                <p className="text-gray-600">
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
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {moodboardFiles.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun moodboard</h3>
                <p className="text-gray-600">
                  Le moodboard sera disponible prochainement.
                </p>
              </div>
            ) : (
              moodboardFiles.map((file) => (
                <div key={file.id} className="mb-6 break-inside-avoid">
                  <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-auto group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {inspirationPhotos.map((photo) => (
              <div key={photo.id} className="mb-6 break-inside-avoid">
                <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-auto group-hover:scale-110 transition-transform duration-500"
                  />
                  {photo.description && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm">{photo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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