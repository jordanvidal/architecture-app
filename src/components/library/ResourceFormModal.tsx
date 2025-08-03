import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
    subCategories: {
      id: string;
      name: string;
    }[];
  }[];
}

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  resource?: {
    id: string;
    name: string;
    description?: string;
    brand?: string;
    reference?: string;
    imageUrl?: string;
    productUrl?: string;
    type?: 'INTERIEUR' | 'EXTERIEUR';
    subCategory2Id?: string;
    categoryId?: string;
    price?: number;
    pricePro?: number;
    supplier?: string;
    countryOrigin?: string;
    technicalSheet?: string;
  } | null;
  onSave: (data: any) => void;
}

export default function ResourceFormModal({
  isOpen,
  onClose,
  categories,
  resource,
  onSave
}: ResourceFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    reference: '',
    imageUrl: '',
    productUrl: '',
    type: 'INTERIEUR' as 'INTERIEUR' | 'EXTERIEUR',
    subCategory2Id: '',
    categoryId: '',
    price: '',
    pricePro: '',
    supplier: '',
    countryOrigin: '',
    technicalSheet: ''
  });

  const [selectedParent, setSelectedParent] = useState('');
  const [selectedSub1, setSelectedSub1] = useState('');

  // Trouver la catégorie PrescriptionCategory appropriée basée sur la sélection
  const getCategoryIdFromSelection = () => {
    // Mapping simple basé sur le parent category
    const categoryMapping: { [key: string]: string } = {
      'REVÊTEMENT': 'revetement',
      'LUMINAIRE': 'eclairage',
      "SALLE D'EAU": 'salle-de-bain',
      'ELECTRICITÉ & APPAREILS': 'electricite',
      'MENUISERIE & STAFF': 'menuiserie'
    };

    const parent = categories.find(c => c.id === selectedParent);
    if (parent) {
      return categoryMapping[parent.name] || 'autre';
    }
    return 'autre';
  };

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        description: resource.description || '',
        brand: resource.brand || '',
        reference: resource.reference || '',
        imageUrl: resource.imageUrl || '',
        productUrl: resource.productUrl || '',
        type: resource.type || 'INTERIEUR',
        subCategory2Id: resource.subCategory2Id || '',
        categoryId: resource.categoryId || '',
        price: resource.price?.toString() || '',
        pricePro: resource.pricePro?.toString() || '',
        supplier: resource.supplier || '',
        countryOrigin: resource.countryOrigin || '',
        technicalSheet: resource.technicalSheet || ''
      });

      // Retrouver les catégories parentes
      if (resource.subCategory2Id) {
        categories.forEach(parent => {
          parent.subCategories.forEach(sub1 => {
            const sub2 = sub1.subCategories.find(s => s.id === resource.subCategory2Id);
            if (sub2) {
              setSelectedParent(parent.id);
              setSelectedSub1(sub1.id);
            }
          });
        });
      }
    }
  }, [resource, categories]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.name || !formData.subCategory2Id) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    const dataToSave = {
      ...formData,
      categoryId: getCategoryIdFromSelection(), // Catégorie déduite
      price: formData.price ? parseFloat(formData.price) : undefined,
      pricePro: formData.pricePro ? parseFloat(formData.pricePro) : undefined
    };

    onSave(dataToSave);
    onClose();
  };

  const currentParentCategory = categories.find(c => c.id === selectedParent);
  const currentSub1Categories = currentParentCategory?.subCategories || [];
  const currentSub1Category = currentSub1Categories.find(s => s.id === selectedSub1);
  const currentSub2Categories = currentSub1Category?.subCategories || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {resource ? 'Modifier la ressource' : 'Ajouter une ressource'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Informations générales</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="Ex: Canapé d'angle OSAKA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="Ex: BoConcept"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="Ex: OSAKA-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                placeholder="Description détaillée..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INTERIEUR' })}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    formData.type === 'INTERIEUR'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Intérieur
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXTERIEUR' })}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    formData.type === 'EXTERIEUR'
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Extérieur
                </button>
              </div>
            </div>
          </div>

          {/* Catégorisation */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Catégorisation *</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie principale
                </label>
                <select
                  value={selectedParent}
                  onChange={(e) => {
                    setSelectedParent(e.target.value);
                    setSelectedSub1('');
                    setFormData({ ...formData, subCategory2Id: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-catégorie 1
                </label>
                <select
                  value={selectedSub1}
                  onChange={(e) => {
                    setSelectedSub1(e.target.value);
                    setFormData({ ...formData, subCategory2Id: '' });
                  }}
                  disabled={!selectedParent}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Sélectionner...</option>
                  {currentSub1Categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-catégorie 2
                </label>
                <select
                  value={formData.subCategory2Id}
                  onChange={(e) => setFormData({ ...formData, subCategory2Id: e.target.value })}
                  disabled={!selectedSub1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Sélectionner...</option>
                  {currentSub2Categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Prix et fournisseur */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Prix et disponibilité</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix public TTC
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix HT pro
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePro}
                  onChange={(e) => setFormData({ ...formData, pricePro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fournisseur
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="Ex: BoConcept Lyon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays d'origine
                </label>
                <input
                  type="text"
                  value={formData.countryOrigin}
                  onChange={(e) => setFormData({ ...formData, countryOrigin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="Ex: France"
                />
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Liens</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du produit
              </label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiche technique (URL)
              </label>
              <input
                type="url"
                value={formData.technicalSheet}
                onChange={(e) => setFormData({ ...formData, technicalSheet: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Preview de l'image */}
          {formData.imageUrl && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Aperçu</h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <img 
                  src={formData.imageUrl} 
                  alt="Aperçu"
                  className="max-w-full max-h-48 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
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
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            {resource ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}