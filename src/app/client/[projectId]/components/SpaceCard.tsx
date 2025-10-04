// app/client/[projectId]/components/SpaceCard.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sofa } from 'lucide-react'
import PrescriptionCard from './PrescriptionCard'

interface Space {
  id: string
  name: string
  type: string
  surfaceM2: number | null
  prescriptions: any[]
  projectFiles: any[]
}

interface SpaceCardProps {
  space: Space
  projectId: string
}

export default function SpaceCard({ space, projectId }: SpaceCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const get3DFiles = () => space.projectFiles.filter(f => f.type === 'THREE_D')
  const getMaterialPhotos = () => space.projectFiles.filter(f => f.category === 'MATERIAL_PHOTO')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sofa className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{space.name}</h3>
              <p className="text-sm text-gray-500">
                {space.prescriptions.length} prescription{space.prescriptions.length > 1 ? 's' : ''}
                {space.surfaceM2 && ` · ${space.surfaceM2} m²`}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* 3D & Material Photos */}
          {(get3DFiles().length > 0 || getMaterialPhotos().length > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {get3DFiles().map((file) => (
                <div key={file.id} className="relative aspect-video rounded-lg overflow-hidden group">
                  <img
                    src={file.url}
                    alt="Vue 3D"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-white text-xs font-medium">Vue 3D</span>
                  </div>
                </div>
              ))}
              {getMaterialPhotos().map((file) => (
                <div key={file.id} className="relative aspect-video rounded-lg overflow-hidden group">
                  <img
                    src={file.url}
                    alt="Matériau"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-white text-xs font-medium">Matériau</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prescriptions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Prescriptions</h4>
            {space.prescriptions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune prescription pour cette pièce</p>
            ) : (
              <div className="space-y-3">
                {space.prescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    projectId={projectId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}