// app/client/[projectId]/components/PhotoUpload.tsx
'use client'

import { useState } from 'react'
import { X, Upload, Image as ImageIcon, Ruler } from 'lucide-react'

interface PhotoUploadProps {
  projectId: string
  onClose: () => void
  onUploadSuccess: () => void
}

export default function PhotoUpload({ projectId, onClose, onUploadSuccess }: PhotoUploadProps) {
  const [photoType, setPhotoType] = useState<'INSPIRATION' | 'PROJECT'>('INSPIRATION')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    setFile(selectedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      alert('Veuillez sélectionner une photo')
      return
    }

    if (photoType === 'PROJECT' && (!width || !height)) {
      alert('Les dimensions sont obligatoires pour les photos de projet')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      formData.append('type', photoType)
      formData.append('description', description)
      
      if (photoType === 'PROJECT') {
        formData.append('width', width)
        formData.append('height', height)
      }

      const res = await fetch('/api/client/photos/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        onUploadSuccess()
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload de la photo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Ajouter une photo</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de photo
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPhotoType('INSPIRATION')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  photoType === 'INSPIRATION'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ImageIcon className={`h-8 w-8 mx-auto mb-2 ${
                  photoType === 'INSPIRATION' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-sm">Inspiration</p>
                <p className="text-xs text-gray-500 mt-1">Photo libre</p>
              </button>

              <button
                type="button"
                onClick={() => setPhotoType('PROJECT')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  photoType === 'PROJECT'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Ruler className={`h-8 w-8 mx-auto mb-2 ${
                  photoType === 'PROJECT' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-sm">Projet</p>
                <p className="text-xs text-gray-500 mt-1">Avec dimensions</p>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo <span className="text-red-500">*</span>
            </label>
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour parcourir</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (max. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Dimensions (only for PROJECT type) */}
          {photoType === 'PROJECT' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largeur (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: 250"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hauteur (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: 300"
                  required
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Ajoutez une description..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isUploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isUploading ? 'Upload en cours...' : 'Ajouter la photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}