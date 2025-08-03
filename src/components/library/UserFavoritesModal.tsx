import React, { useState } from 'react';
import { X, Heart } from 'lucide-react';

interface UserFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    id: string;
    name: string;
    brand?: string;
    imageUrl?: string;
  };
  currentFavorite?: {
    status: 'PAS_OK' | 'OK' | 'J_ADORE';
    notes?: string;
  };
  userName: string;
  onSave: (data: { status: 'PAS_OK' | 'OK' | 'J_ADORE'; notes?: string }) => void;
}

export default function UserFavoritesModal({
  isOpen,
  onClose,
  resource,
  currentFavorite,
  userName,
  onSave
}: UserFavoritesModalProps) {
  const [status, setStatus] = useState<'PAS_OK' | 'OK' | 'J_ADORE'>(
    currentFavorite?.status || 'OK'
  );
  const [notes, setNotes] = useState(currentFavorite?.notes || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ status, notes: notes.trim() || undefined });
    onClose();
  };

  const statusOptions = [
    { value: 'PAS_OK', label: 'PAS OK', color: 'text-red-600 bg-red-50 border-red-200' },
    { value: 'OK', label: 'OK', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'J_ADORE', label: "J'ADORE", color: 'text-pink-600 bg-pink-50 border-pink-200' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Favoris de {userName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Évaluer cette ressource
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Resource preview */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-start space-x-4">
            {resource.imageUrl && (
              <img 
                src={resource.imageUrl} 
                alt={resource.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{resource.name}</h3>
              {resource.brand && (
                <p className="text-sm text-gray-600">{resource.brand}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status selection */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Statut d'évaluation
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value as typeof status)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all ${
                    status === option.value
                      ? option.color + ' border-opacity-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.value === 'J_ADORE' && (
                    <Heart className="w-4 h-4 inline mr-1" />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ajouter des notes personnelles..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}