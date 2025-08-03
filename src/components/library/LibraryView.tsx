import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronRight, Grid, List, Plus, Search, X, Heart, Edit, Trash2, FolderPlus } from 'lucide-react';
import ResourceFormModal from './ResourceFormModal';
import UserFavoritesModal from './UserFavoritesModal';
import AddToProjectModal from './AddToProjectModal';
import { useToast } from '@/contexts/ToastContext';

// Types
interface ParentCategory {
  id: string;
  name: string;
  displayOrder: number;
  subCategories: SubCategory1[];
}

interface SubCategory1 {
  id: string;
  name: string;
  displayOrder: number;
  subCategories: SubCategory2[];
}

interface SubCategory2 {
  id: string;
  name: string;
  displayOrder: number;
}

interface Resource {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  reference?: string;
  imageUrl?: string;
  productUrl?: string;
  price?: number;
  pricePro?: number;
  type?: 'INTERIEUR' | 'EXTERIEUR';
  category?: { id: string; name: string };
  subCategory2?: SubCategory2 & {
    subCategory1: SubCategory1 & {
      parent: ParentCategory;
    };
  };
  addedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  userFavorites?: {
    status: 'PAS_OK' | 'OK' | 'J_ADORE';
    notes?: string;
  }[];
  isFavorite?: boolean;
}

interface SelectedCategory {
  level: 'parent' | 'sub1' | 'sub2';
  parentId?: string;
  sub1Id?: string;
  sub2Id?: string;
}

interface LibraryViewProps {
  projects: any[];
}

export default function LibraryView({ projects }: LibraryViewProps) {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  
  // Modals
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showAddToProjectModal, setShowAddToProjectModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Chargement des données
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, resourcesRes] = await Promise.all([
        fetch('/api/library/categories'),
        fetch('/api/library/resources')
      ]);

      console.log('Categories response:', categoriesRes.status);
      console.log('Resources response:', resourcesRes.status);

      if (categoriesRes.ok && resourcesRes.ok) {
        const categoriesData = await categoriesRes.json();
        const resourcesData = await resourcesRes.json();
        
        console.log('Categories data:', categoriesData);
        console.log('Resources count:', resourcesData.length);
        
        setCategories(categoriesData);
        setResources(resourcesData);
      } else {
        console.error('Error fetching data:', {
          categories: categoriesRes.status,
          resources: resourcesRes.status
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      addToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des favoris
  const handleFavoriteClick = (resource: Resource) => {
    setSelectedResource(resource);
    setShowFavoritesModal(true);
  };

  const handleSaveFavorite = async (data: { status: 'PAS_OK' | 'OK' | 'J_ADORE'; notes?: string }) => {
    if (!selectedResource) return;

    try {
      const response = await fetch('/api/library/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: selectedResource.id,
          ...data
        })
      });

      if (response.ok) {
        await fetchData();
        addToast('Favori mis à jour', 'success');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  // Gestion des ressources
  const handleSaveResource = async (data: any) => {
    try {
      const url = editingResource 
        ? `/api/library/resources/${editingResource.id}`
        : '/api/library/resources';
      
      const method = editingResource ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await fetchData();
        addToast(
          editingResource ? 'Ressource modifiée' : 'Ressource ajoutée',
          'success'
        );
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) return;

    try {
      const response = await fetch(`/api/library/resources?id=${resourceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
        addToast('Ressource supprimée', 'success');
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  // Filtrage des ressources
  const filteredResources = useMemo(() => {
    let filtered = resources;

    // Filtre par catégorie
    if (selectedCategory) {
      if (selectedCategory.sub2Id) {
        filtered = filtered.filter(r => r.subCategory2?.id === selectedCategory.sub2Id);
      } else if (selectedCategory.sub1Id) {
        const sub1 = categories
          .flatMap(p => p.subCategories)
          .find(s => s.id === selectedCategory.sub1Id);
        const sub2Ids = sub1?.subCategories.map(s => s.id) || [];
        filtered = filtered.filter(r => r.subCategory2?.id && sub2Ids.includes(r.subCategory2.id));
      } else if (selectedCategory.parentId) {
        const parent = categories.find(p => p.id === selectedCategory.parentId);
        const sub2Ids = parent?.subCategories
          .flatMap(s1 => s1.subCategories.map(s2 => s2.id)) || [];
        filtered = filtered.filter(r => r.subCategory2?.id && sub2Ids.includes(r.subCategory2.id));
      }
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.brand?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.reference?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [resources, selectedCategory, searchQuery, categories]);

  // Composant Sidebar
  const Sidebar = () => {
    const [expandedParent, setExpandedParent] = useState<string | null>(null);
    const [expandedSub1, setExpandedSub1] = useState<string | null>(null);

    return (
      <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h3>
          
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
              !selectedCategory ? 'bg-slate-800 text-white' : 'hover:bg-gray-50'
            }`}
          >
            Toutes les ressources ({resources.length})
          </button>

          <div className="space-y-1">
            {categories.map(parent => (
              <div key={parent.id}>
                <button
                  onClick={() => {
                    console.log('Clicked on parent:', parent.name, parent.id);
                    console.log('Current expanded:', expandedParent);
                    setExpandedParent(expandedParent === parent.id ? null : parent.id);
                    setSelectedCategory({ level: 'parent', parentId: parent.id });
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory?.parentId === parent.id && selectedCategory.level === 'parent'
                      ? 'bg-slate-100 text-slate-800'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{parent.name}</span>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform ${
                      expandedParent === parent.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expandedParent === parent.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {parent.subCategories.map(sub1 => (
                      <div key={sub1.id}>
                        <button
                          onClick={() => {
                            setExpandedSub1(expandedSub1 === sub1.id ? null : sub1.id);
                            setSelectedCategory({ 
                              level: 'sub1', 
                              parentId: parent.id, 
                              sub1Id: sub1.id 
                            });
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory?.sub1Id === sub1.id && selectedCategory.level === 'sub1'
                              ? 'bg-slate-100 text-slate-800'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm">{sub1.name}</span>
                          <ChevronRight 
                            className={`w-3 h-3 transition-transform ${
                              expandedSub1 === sub1.id ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {expandedSub1 === sub1.id && (
                          <div className="ml-4 mt-1 space-y-1">
                            {sub1.subCategories.map(sub2 => (
                              <button
                                key={sub2.id}
                                onClick={() => setSelectedCategory({ 
                                  level: 'sub2', 
                                  parentId: parent.id, 
                                  sub1Id: sub1.id,
                                  sub2Id: sub2.id 
                                })}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                  selectedCategory?.sub2Id === sub2.id
                                    ? 'bg-slate-800 text-white'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                {sub2.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Composant ResourceCard
  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const userFavorite = resource.userFavorites?.[0];
    
    const getFavoriteColor = () => {
      if (!userFavorite) return 'text-gray-400';
      switch (userFavorite.status) {
        case 'J_ADORE': return 'text-red-500';
        case 'OK': return 'text-green-500';
        case 'PAS_OK': return 'text-gray-500';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
        <div className="aspect-square relative bg-gray-100">
          {resource.imageUrl ? (
            <img 
              src={resource.imageUrl} 
              alt={resource.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📷</span>
            </div>
          )}
          
          {/* Actions overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={() => handleFavoriteClick(resource)}
                className={`p-2 bg-white rounded-full shadow-lg ${getFavoriteColor()}`}
              >
                <Heart className="w-5 h-5" fill={userFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => {
                  setEditingResource(resource);
                  setShowResourceModal(true);
                }}
                className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-900"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setSelectedResource(resource);
                  setShowAddToProjectModal(true);
                }}
                className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-900"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{resource.name}</h3>
          {resource.brand && (
            <p className="text-sm text-gray-600 mb-2">{resource.brand}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
            <span>{resource.addedBy.name}</span>
            <span>{new Date(resource.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>

          {resource.type && (
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
              resource.type === 'INTERIEUR' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {resource.type === 'INTERIEUR' ? 'Intérieur' : 'Extérieur'}
            </span>
          )}

          {resource.price && (
            <p className="mt-2 font-semibold text-gray-900">
              {resource.price.toFixed(2)} € TTC
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Bibliothèque</h1>
              
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Toggle vue */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Bouton ajouter */}
              <button
                onClick={() => {
                  setEditingResource(null);
                  setShowResourceModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Fil d'ariane */}
          {selectedCategory && (
            <div className="mt-3 text-sm text-gray-600">
              <button onClick={() => setSelectedCategory(null)} className="hover:text-gray-900">
                Toutes les ressources
              </button>
              {selectedCategory.parentId && (
                <>
                  <span className="mx-2">/</span>
                  <button className="hover:text-gray-900">
                    {categories.find(c => c.id === selectedCategory.parentId)?.name}
                  </button>
                </>
              )}
              {selectedCategory.sub1Id && (
                <>
                  <span className="mx-2">/</span>
                  <button className="hover:text-gray-900">
                    {categories
                      .flatMap(c => c.subCategories)
                      .find(s => s.id === selectedCategory.sub1Id)?.name}
                  </button>
                </>
              )}
              {selectedCategory.sub2Id && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900">
                    {categories
                      .flatMap(c => c.subCategories)
                      .flatMap(s => s.subCategories)
                      .find(s => s.id === selectedCategory.sub2Id)?.name}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucune ressource trouvée</p>
              <button
                onClick={() => {
                  setEditingResource(null);
                  setShowResourceModal(true);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une ressource</span>
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {filteredResources.length} ressource{filteredResources.length > 1 ? 's' : ''}
              </p>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResources.map(resource => (
                    <div key={resource.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {resource.imageUrl && (
                            <img 
                              src={resource.imageUrl} 
                              alt={resource.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                            {resource.brand && (
                              <p className="text-sm text-gray-600">{resource.brand}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>Ajouté par {resource.addedBy.name}</span>
                              <span>{new Date(resource.createdAt).toLocaleDateString('fr-FR')}</span>
                              {resource.type && (
                                <span className={`px-2 py-1 rounded-full ${
                                  resource.type === 'INTERIEUR' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {resource.type === 'INTERIEUR' ? 'Intérieur' : 'Extérieur'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleFavoriteClick(resource)}
                            className={`p-2 rounded-lg hover:bg-gray-100 ${
                              resource.userFavorites?.[0]?.status === 'J_ADORE' ? 'text-red-500' :
                              resource.userFavorites?.[0]?.status === 'OK' ? 'text-green-500' :
                              resource.userFavorites?.[0]?.status === 'PAS_OK' ? 'text-gray-500' :
                              'text-gray-400'
                            }`}
                          >
                            <Heart className="w-5 h-5" fill={resource.userFavorites?.length ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingResource(resource);
                              setShowResourceModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showResourceModal && (
        <ResourceFormModal
          isOpen={showResourceModal}
          onClose={() => {
            setShowResourceModal(false);
            setEditingResource(null);
          }}
          categories={categories}
          resource={editingResource}
          onSave={handleSaveResource}
        />
      )}

      {showFavoritesModal && selectedResource && (
        <UserFavoritesModal
          isOpen={showFavoritesModal}
          onClose={() => {
            setShowFavoritesModal(false);
            setSelectedResource(null);
          }}
          resource={selectedResource}
          currentFavorite={selectedResource.userFavorites?.[0]}
          userName={session?.user?.name || 'Utilisateur'}
          onSave={handleSaveFavorite}
        />
      )}

      {showAddToProjectModal && selectedResource && (
        <AddToProjectModal
          isOpen={showAddToProjectModal}
          onClose={() => {
            setShowAddToProjectModal(false);
            setSelectedResource(null);
          }}
          resource={selectedResource}
          projects={projects}
          onSuccess={() => {
            setShowAddToProjectModal(false);
            setSelectedResource(null);
            addToast('Ressource ajoutée au projet', 'success');
          }}
        />
      )}
    </div>
  );
}