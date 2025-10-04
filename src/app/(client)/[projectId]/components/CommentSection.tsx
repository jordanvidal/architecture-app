// app/client/[projectId]/components/CommentSection.tsx
'use client'

import { useState } from 'react'
import { Send, User } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    role: string
  }
}

interface CommentSectionProps {
  prescriptionId: string
  comments: Comment[]
}

export default function CommentSection({ prescriptionId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/client/prescriptions/${prescriptionId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (res.ok) {
        const data = await res.json()
        setComments([data.comment, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('Erreur envoi commentaire:', error)
      alert('Erreur lors de l\'envoi du commentaire')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  const getUserDisplayName = (comment: Comment) => {
    if (comment.user.firstName || comment.user.lastName) {
      return `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim()
    }
    return 'Utilisateur'
  }

  const isArchitect = (comment: Comment) => comment.user.role === 'ARCHITECT'

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajoutez un commentaire..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span className="text-sm">Envoyer</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isArchitect(comment)
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}>
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 bg-white rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(comment)}
                    {isArchitect(comment) && (
                      <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Architecte
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-4">
          Aucun commentaire pour le moment
        </p>
      )}
    </div>
  )
}