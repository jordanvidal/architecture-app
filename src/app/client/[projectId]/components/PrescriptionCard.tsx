// app/client/[projectId]/components/PrescriptionCard.tsx
'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Check, X, MessageCircle, ExternalLink, Package } from 'lucide-react'
import CommentSection from './CommentSection'

interface Approval {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

interface Prescription {
  id: string
  name: string
  description: string | null
  quantity: number
  unitPrice: number | null
  totalPrice: number | null
  brand: string | null
  reference: string | null
  supplier: string | null
  productUrl: string | null
  category: {
    name: string
    colorHex: string | null
  }
  approvals: Approval[]
  comments: any[]
}

interface PrescriptionCardProps {
  prescription: Prescription
  projectId: string
}

export default function PrescriptionCard({ prescription, projectId }: PrescriptionCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [approval, setApproval] = useState<Approval | null>(
    prescription.approvals[0] || null
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const handleApprove = async () => {
    if (isUpdating) return
    setIsUpdating(true)

    try {
      const res = await fetch(`/api/client/prescriptions/${prescription.id}/approve`, {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        setApproval(data.approval)
      }
    } catch (error) {
      console.error('Erreur approbation:', error)
      alert('Erreur lors de l\'approbation')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async () => {
    if (isUpdating) return
    setIsUpdating(true)

    try {
      const res = await fetch(`/api/client/prescriptions/${prescription.id}/reject`, {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        setApproval(data.approval)
      }
    } catch (error) {
      console.error('Erreur rejet:', error)
      alert('Erreur lors du rejet')
    } finally {
      setIsUpdating(false)
    }
  }

  const getApprovalStatus = () => {
    if (!approval) return null
    
    if (approval.status === 'APPROVED') {
      return (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Approuvé</span>
        </div>
      )
    }
    
    if (approval.status === 'REJECTED') {
      return (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
          <X className="h-4 w-4" />
          <span className="text-sm font-medium">Refusé</span>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="h-5 w-5 text-gray-400" />
            <h5 className="font-semibold text-gray-900">{prescription.name}</h5>
            {getApprovalStatus()}
          </div>
          
          {prescription.description && (
            <p className="text-sm text-gray-600 mb-2">{prescription.description}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {prescription.brand && (
              <span className="bg-white px-2 py-1 rounded">
                <strong>Marque:</strong> {prescription.brand}
              </span>
            )}
            {prescription.reference && (
              <span className="bg-white px-2 py-1 rounded">
                <strong>Réf:</strong> {prescription.reference}
              </span>
            )}
            <span className="bg-white px-2 py-1 rounded">
              <strong>Qté:</strong> {prescription.quantity}
            </span>
            {prescription.totalPrice && (
              <span className="bg-white px-2 py-1 rounded font-semibold text-indigo-600">
                {prescription.totalPrice.toLocaleString('fr-FR')} €
              </span>
            )}
          </div>
        </div>

        {prescription.productUrl && (
          <a
            href={prescription.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Voir le produit"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {/* Approve/Reject Buttons */}
          {!approval || approval.status === 'PENDING' ? (
            <>
              <button
                onClick={handleApprove}
                disabled={isUpdating}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                  approval?.status === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600'
                } disabled:opacity-50`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">Approuver</span>
              </button>

              <button
                onClick={handleReject}
                disabled={isUpdating}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                  approval?.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                } disabled:opacity-50`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm font-medium">Refuser</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setApproval(null)}
              className="text-xs text-gray-500 hover:text-indigo-600 underline"
            >
              Modifier mon choix
            </button>
          )}
        </div>

        {/* Comments Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">
            {prescription.comments.length} commentaire{prescription.comments.length > 1 ? 's' : ''}
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <CommentSection
            prescriptionId={prescription.id}
            comments={prescription.comments}
          />
        </div>
      )}
    </div>
  )
}