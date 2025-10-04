// src/app/(client)/[projectId]/components/PrescriptionCard.tsx
'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Package, Check, X } from 'lucide-react'
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
    icon: string | null
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

  const getCategoryColor = () => {
    return prescription.category.colorHex || '#8B5CF6'
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
      {/* Header avec catégorie */}
      <div 
        className="h-2"
        style={{ backgroundColor: getCategoryColor() }}
      ></div>

      <div className="p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="h-5 w-5 text-gray-400" />
              <h3 className="font-bold text-lg text-gray-900">{prescription.name}</h3>
            </div>
            
            {prescription.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{prescription.description}</p>
            )}
          </div>

          {prescription.productUrl && (
            <a
              href={prescription.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
              title="Voir le produit"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>

        {/* Détails */}
        <div className="flex flex-wrap gap-2 mb-4">
          {prescription.brand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {prescription.brand}
            </span>
          )}
          {prescription.reference && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Réf: {prescription.reference}
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Qté: {prescription.quantity}
          </span>
          {prescription.totalPrice && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {prescription.totalPrice.toLocaleString('fr-FR')} €
            </span>
          )}
        </div>

        {/* Statut d'approbation */}
        {approval && (
          <div className="mb-4">
            {approval.status === 'APPROVED' && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">Vous avez approuvé cette prescription</span>
              </div>
            )}
            {approval.status === 'REJECTED' && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <X className="h-5 w-5" />
                <span className="text-sm font-medium">Vous avez refusé cette prescription</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {/* Boutons Approve/Reject */}
            {!approval || approval.status === 'PENDING' ? (
              <>
                <button
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 transform hover:scale-105"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Approuver</span>
                </button>

                <button
                  onClick={handleReject}
                  disabled={isUpdating}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 transform hover:scale-105"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Refuser</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setApproval(null)}
                className="text-sm text-gray-500 hover:text-purple-600 underline transition-colors"
              >
                Modifier mon choix
              </button>
            )}
          </div>

          {/* Toggle Comments */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {prescription.comments.length}
            </span>
          </button>
        </div>

        {/* Section Commentaires */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <CommentSection
              prescriptionId={prescription.id}
              comments={prescription.comments}
            />
          </div>
        )}
      </div>
    </div>
  )
}