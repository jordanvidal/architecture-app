import React, { useState, useCallback, useRef } from 'react'
import { Upload, File, Image, FileText, X, Check, AlertCircle } from 'lucide-react'

interface FileUploadZoneProps {
  projectId: string
  spaceId?: string
  category?: string
  onUploadComplete?: (files: UploadedFile[]) => void
  onError?: (error: string) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number // en MB
  multiple?: boolean
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  category?: string
  uploadedAt: string
}

interface FileWithProgress extends File {
  progress?: number
  status?: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function FileUploadZone({
  projectId,
  spaceId,
  category = 'GENERAL',
  onUploadComplete,
  onError,
  acceptedFileTypes = ['image/*', 'application/pdf', '.dwg', '.dxf', '.3ds', '.obj', '.fbx'],
  maxFileSize = 50, // 50MB par défaut
  multiple = true
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-5 h-5" />
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

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Vérifier la taille
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `Fichier trop volumineux (max ${maxFileSize}MB)` }
    }

    // Vérifier le type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = acceptedFileTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''))
      }
      return type === fileExtension || file.type === type
    })

    if (!isValidType) {
      return { valid: false, error: 'Type de fichier non accepté' }
    }

    return { valid: true }
  }

  const uploadFile = async (file: FileWithProgress, index: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    if (spaceId) formData.append('spaceId', spaceId)

    try {
      // Mise à jour du statut
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ))

      // Simulation de progression (à remplacer par XMLHttpRequest pour une vraie progression)
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map((f, i) => {
          if (i === index && f.progress !== undefined && f.progress < 90) {
            return { ...f, progress: f.progress + 10 }
          }
          return f
        }))
      }, 200)

      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload')
      }

      const uploadedFile = await response.json()

      // Succès
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'success' as const, progress: 100 } : f
      ))

      setUploadedFiles(prev => [...prev, uploadedFile])

      // Nettoyer après 2 secondes
      setTimeout(() => {
        setFiles(prev => prev.filter((_, i) => i !== index))
      }, 2000)

    } catch (error) {
      // Erreur
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Erreur inconnue' 
        } : f
      ))
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
      }
    }
  }

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList).map(file => {
      const validation = validateFile(file)
      return Object.assign(file, {
        progress: 0,
        status: validation.valid ? 'pending' as const : 'error' as const,
        error: validation.error
      })
    })

    setFiles(prev => [...prev, ...newFiles])

    // Upload automatique des fichiers valides
    newFiles.forEach((file, index) => {
      if (file.status === 'pending') {
        uploadFile(file, files.length + index)
      }
    })
  }, [files.length])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-slate-800 bg-slate-50' 
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={acceptedFileTypes.join(',')}
          multiple={multiple}
          className="hidden"
        />

        <Upload className={`
          w-12 h-12 mx-auto mb-4 transition-colors
          ${isDragging ? 'text-slate-800' : 'text-slate-400'}
        `} />
        
        <p className="text-lg font-medium text-slate-900 mb-1">
          {isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
        </p>
        <p className="text-sm text-slate-600 mb-4">
          ou <span className="text-slate-800 font-medium">cliquez pour parcourir</span>
        </p>
        
        <div className="text-xs text-slate-500">
          <p>Formats acceptés: Images, PDF, DWG, DXF, 3DS, OBJ, FBX</p>
          <p>Taille max: {maxFileSize}MB par fichier</p>
        </div>
      </div>

      {/* Liste des fichiers en cours d'upload */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className={`
                bg-white border rounded-lg p-4
                ${file.status === 'error' ? 'border-red-200' : 'border-slate-200'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`
                    p-2 rounded-lg
                    ${file.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}
                  `}>
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {file.error && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {file.error}
                      </div>
                    )}
                    
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-slate-800 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{file.progress}%</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className={`
                    ml-2 p-1 rounded-lg transition-colors
                    ${file.status === 'success' 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  {file.status === 'success' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message de succès */}
      {uploadedFiles.length > 0 && onUploadComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center text-green-800">
            <Check className="w-5 h-5 mr-2" />
            <p className="text-sm font-medium">
              {uploadedFiles.length} fichier{uploadedFiles.length > 1 ? 's' : ''} uploadé{uploadedFiles.length > 1 ? 's' : ''} avec succès
            </p>
          </div>
        </div>
      )}
    </div>
  )
}