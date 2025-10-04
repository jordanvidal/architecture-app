'use client'

import { useState } from 'react';

interface Prescription {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  unitPrice?: number | null;
  status: string;
  category?: {
    name: string;
  } | null;
  approvals?: Array<{
    status: string;
    comment?: string | null;
  }>;
  comments?: Array<{
    comment: string;
    createdAt: Date;
    user: {
      firstName?: string | null;
      lastName?: string | null;
    };
  }>;
}

interface PrescriptionCardProps {
  prescription: Prescription;
  onUpdate: () => void;
}

export default function PrescriptionCard({ prescription, onUpdate }: PrescriptionCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentApproval = prescription.approvals?.[0];

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await fetch(`/api/client/prescriptions/${prescription.id}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    
    setIsRejecting(true);
    try {
      const response = await fetch(`/api/client/prescriptions/${prescription.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (response.ok) {
        setShowRejectModal(false);
        setRejectReason('');
        onUpdate();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/client/prescriptions/${prescription.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
      if (response.ok) {
        setComment('');
        setShowCommentForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="border border-stone-200 p-6 hover:border-stone-400 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-light text-lg mb-1">{prescription.name}</h3>
            {prescription.brand && (
              <p className="text-sm text-stone-500">{prescription.brand}</p>
            )}
          </div>
          <div
            className={`px-3 py-1 text-xs uppercase tracking-wider ${
              prescription.status === 'LIVRE'
                ? 'bg-green-100 text-green-800'
                : prescription.status === 'COMMANDE'
                ? 'bg-blue-100 text-blue-800'
                : prescription.status === 'VALIDE'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-stone-100 text-stone-800'
            }`}
          >
            {prescription.status}
          </div>
        </div>

        {prescription.description && (
          <p className="text-sm text-stone-600 mb-4 line-clamp-2">
            {prescription.description}
          </p>
        )}

        {prescription.unitPrice && (
          <div className="text-2xl font-light mb-4">
            {prescription.unitPrice.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </div>
        )}

        {prescription.category && (
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-6">
            {prescription.category.name}
          </div>
        )}

        {/* Client Actions */}
        <div className="pt-6 border-t border-stone-200">
          {currentApproval ? (
            <div className="space-y-3">
              <div
                className={`text-sm font-light ${
                  currentApproval.status === 'APPROVED'
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {currentApproval.status === 'APPROVED' ? '✓ Approuvé' : '✗ Refusé'}
              </div>
              {currentApproval.comment && (
                <p className="text-sm text-stone-600 italic">"{currentApproval.comment}"</p>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1 py-2 text-sm uppercase tracking-wider border border-stone-900 hover:bg-stone-900 hover:text-white transition-colors disabled:opacity-50"
              >
                {isApproving ? 'En cours...' : 'Approuver'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 py-2 text-sm uppercase tracking-wider border border-stone-300 hover:border-stone-900 transition-colors"
              >
                Refuser
              </button>
            </div>
          )}

          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="w-full mt-3 py-2 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
          >
            {showCommentForm ? 'Annuler' : '+ Ajouter un commentaire'}
          </button>

          {showCommentForm && (
            <div className="mt-4 space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Votre commentaire..."
                className="w-full p-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-400 resize-none"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={isSubmitting || !comment.trim()}
                className="w-full py-2 text-sm uppercase tracking-wider bg-stone-900 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          )}

          {prescription.comments && prescription.comments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-200 space-y-4">
              <div className="text-xs uppercase tracking-wider text-stone-500">
                Commentaires ({prescription.comments.length})
              </div>
              {prescription.comments.map((c, i) => (
                <div key={i} className="text-sm">
                  <p className="text-stone-700">{c.comment}</p>
                  <div className="text-xs text-stone-400 mt-1">
                    {c.user.firstName} {c.user.lastName} · {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8">
            <h3 className="text-2xl font-light mb-6">Refuser cette sélection</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Pourquoi refusez-vous cette sélection ?"
              className="w-full p-4 border border-stone-200 text-sm focus:outline-none focus:border-stone-400 resize-none mb-6"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 text-sm uppercase tracking-wider border border-stone-300 hover:border-stone-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="flex-1 py-3 text-sm uppercase tracking-wider bg-stone-900 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {isRejecting ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
