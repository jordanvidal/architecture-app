import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Image, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Filter,
  Grid,
  List,
  Search,
  FolderOpen,
  Calendar,
  User
} from 'lucide-react'
import FileUploadZone from './FileUploadZone'

interface ProjectFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  category: string
  spaceId?: string
  spaceName?: string
  uploadedBy: {
    firstName?: string
    lastName?: string
    email: string
  }
  created_at: string
}

interface FilesPlansModuleProps {
  projectId: string
  spaces?: Array<{ id: string; name: string }>
}

const FILE_CATEGORIES = [
  { id: 'GENERAL', label: 'Général', icon: '📁' },
  { id: 'PLAN_2D', label: 'Plans 2D', icon: '📐' },
  { id: 'PLAN_3D', label: 'Plans 3D', icon: '🏗️' },
  { id: 'PHOTO', label: 'Photos', icon: '📸' },
  { id: 'DOCUMENT', label: 'Documents', icon: '📄' },
  { id: 'DEVIS', label: 'Devis', icon: '💰' },
  { id: 'AUTRE', label: 'Autre', icon: '📎' }
]

export default function FilesPlansModule({ projectId, spaces = [] }: FilesPlansModuleProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedSpace, setSelectedSpace] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [projectId])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/files`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Erreur chargement fichiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'ALL' || file.category === selectedCategory
    const matchesSpace = selectedSpace === 'ALL' || file.spaceId === selectedSpace
    const matchesSearch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSpace && matchesSearch
  })

  const getCategoryStats = () => {
    const stats: Record<string, number> = {}
    files.forEach(file => {
      stats[file.category] = (stats[file.category] || 0) + 1
    })
    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Fichiers & Plans
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {files.length} fichier{files.length > 1 ? 's' : ''} au total
            </p>
          </div>
          
          <button
            onClick={() => setShowUploadZone(!showUploadZone)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            + Ajouter des fichiers
          </button>
        </div>

        {/* Zone d'upload (affichée conditionnellement) */}
        {showUploadZone && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-slate-900">Upload de fichiers</h3>
              <button
                onClick={() => setShowUploadZone(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Sélection de l'espace et de la catégorie */}
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Espace
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  onChange={(e) => {/* À implémenter */}}
                >
                  <option value="">Général (pas d'espace spécifique)</option>
                  {spaces.map(space => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  onChange={(e) => {/* À implémenter */}}
                >
                  {FILE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <FileUploadZone
              projectId={projectId}
              onUploadComplete={() => {
                fetchFiles()
                setShowUploadZone(false)
              }}
            />
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              <option value="ALL">Toutes catégories</option>
              {FILE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} {categoryStats[cat.id] ? `(${categoryStats[cat.id]})` : ''}
                </option>
              ))}
            </select>

            {spaces.length > 0 && (
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              >
                <option value="ALL">Tous les espaces</option>
                {spaces.map(space => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            )}

            {/* Toggle vue */}
            <div className="flex border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des fichiers */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement des fichiers...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchQuery || selectedCategory !== 'ALL' || selectedSpace !== 'ALL'
                ? 'Aucun fichier ne correspond à vos critères'
                : 'Aucun fichier pour le moment'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="group border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedFile(file)
                  setShowPreview(true)
                }}
              >
                {/* Aperçu */}
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-slate-400">
                        {getFileIcon(file.type)}
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(file.url, '_blank')
                        }}
                        className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <a
                        href={file.url}
                        download={file.name}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white rounded-lg text-slate-700 hover:bg-slate-100"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFileDelete(file.id)
                        }}
                        className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Infos */}
                <div className="p-4">
                  <h4 className="font-medium text-slate-900 truncate mb-1">
                    {file.name}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>
                      {FILE_CATEGORIES.find(c => c.id === file.category)?.icon}
                    </span>
                  </div>
                  {file.spaceName && (
                    <p className="text-xs text-slate-500 mt-1">
                      📍 {file.spaceName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 truncate">
                      {file.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{FILE_CATEGORIES.find(c => c.id === file.category)?.label}</span>
                      {file.spaceName && <span>📍 {file.spaceName}</span>}
                      <span>
                        <User className="w-3 h-3 inline mr-1" />
                        {file.uploadedBy.firstName || file.uploadedBy.email}
                      </span>
                      <span>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(file.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)} • {FILE_CATEGORIES.find(c => c.id === selectedFile.category)?.label}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false)
                  setSelectedFile(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {selectedFile.type.startsWith('image/') ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="w-full h-auto rounded-lg"
                />
              ) : selectedFile.type === 'application/pdf' ? (
                <iframe
                  src={selectedFile.url}
                  className="w-full h-[600px] rounded-lg"
                  title={selectedFile.name}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {getFileIcon(selectedFile.type)}
                  </div>
                  <p className="text-slate-600 mb-4">
                    Aperçu non disponible pour ce type de fichier
                  </p>
                  <a
                    href={selectedFile.url}
                    download={selectedFile.name}
                    className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger le fichier
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div>
                  <span className="text-slate-600">Uploadé par:</span>
                  <p className="text-slate-900 font-medium">
                    {selectedFile.uploadedBy.firstName} {selectedFile.uploadedBy.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Date d'upload:</span>
                  <p className="text-slate-900 font-medium">
                    {new Date(selectedFile.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {selectedFile.spaceName && (
                  <div>
                    <span className="text-slate-600">Espace:</span>
                    <p className="text-slate-900 font-medium">
                      {selectedFile.spaceName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}