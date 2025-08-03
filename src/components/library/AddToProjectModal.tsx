import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client_name: string;
  spaces?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface Resource {
  id: string;
  name: string;
  brand?: string;
  reference?: string;
  price?: number;
  imageUrl?: string;
}

interface AddToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  projects: Project[];
  onSuccess: () => void;
}

export default function AddToProjectModal({
  isOpen,
  onClose,
  resource,
  projects,
  onSuccess
}: AddToProjectModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectSpaces, setProjectSpaces] = useState<Array<{ id: string; name: string; type: string }>>([]);

  // Charger les espaces quand un projet est sélectionné
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectSpaces(selectedProjectId);
    } else {
      setProjectSpaces([]);
      setSelectedSpaceId('');
    }
  }, [selectedProjectId]);

  const fetchProjectSpaces = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/spaces`);
      if (response.ok) {
        const spaces = await response.json();
        setProjectSpaces(spaces);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des espaces:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      alert('Veuillez sélectionner un projet');
      return;
    }

    setLoading(true);

    try {
      // Créer une prescription basée sur la ressource
      const prescriptionData = {
        name: resource.name,
        brand: resource.brand,
        reference: resource.reference,
        quantity: parseInt(quantity),
        unitPrice: resource.price,
        totalPrice: resource.price ? resource.price * parseInt(quantity) : null,
        status: 'EN_COURS',
        spaceId: selectedSpaceId || null,
        notes: notes || null,
        resourceId: resource.id
      };

      const response = await fetch(`/api/projects/${selectedProjectId}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de l\'ajout au projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout au projet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Ajouter au projet
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Aperçu de la ressource */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {resource.imageUrl && (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                {resource.brand && (
                  <p className="text-sm text-gray-600">{resource.brand}</p>
                )}
                {resource.reference && (
                  <p className="text-xs text-gray-500 font-mono">{resource.reference}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sélection du projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projet *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              <option value="">Sélectionner un projet...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection de l'espace (optionnel) */}
          {projectSpaces.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Espace (optionnel)
              </label>
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              >
                <option value="">Aucun espace spécifique</option>
                {projectSpaces.map(space => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            />
          </div>

          {/* Prix total indicatif */}
          {resource.price && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                Prix total indicatif : <span className="font-semibold">
                  {(resource.price * parseInt(quantity || '0')).toFixed(2)} € TTC
                </span>
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
              placeholder="Notes spécifiques pour ce projet..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedProjectId}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Ajout...</span>
              </span>
            ) : (
              'Ajouter au projet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}