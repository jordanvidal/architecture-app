import { useState, useEffect } from 'react'
import LibraryHeader from './LibraryHeader'
import LibraryFilters from './LibraryFilters'
import ResourceGrid from './ResourceGrid'
import ResourceModal from './ResourceModal'
import AddToProjectModal from './AddToProjectModal'

interface Project {
  id: string
  name: string
  clientName: string
}

interface LibraryViewProps {
  projects: Project[]
}

export default function LibraryView({ projects }: LibraryViewProps) {
  const [resources, setResources] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  const [addToProjectModal, setAddToProjectModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [editingResource, setEditingResource] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchResources()
    fetchCategories()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/library/resources')
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error('Erreur chargement ressources:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
    }
  }

  const toggleFavorite = async (resourceId: string, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/library/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFavorite })
      })

      if (response.ok) {
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, isFavorite: !currentFavorite } : r
        ))
      }
    } catch (error) {
      console.error('Erreur toggle favorite:', error)
    }
  }

  const handleEditResource = (resource: any) => {
    setEditingResource(resource)
    setIsEditing(true)
    setResourceModalOpen(true)
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      return
    }

    try {
      const response = await fetch(`/api/library/resources/${resourceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setResources(prev => prev.filter(r => r.id !== resourceId))
      }
    } catch (error) {
      console.error('Erreur suppression ressource:', error)
    }
  }

  const filteredResources = resources.filter(resource => {
    let matchesCategory = true
    if (selectedCategory === 'ALL') {
      matchesCategory = true
    } else if (selectedCategory === 'FAVORITES') {
      matchesCategory = resource.isFavorite
    } else {
      matchesCategory = resource.category?.name === selectedCategory
    }
    
    let matchesRoom = true
    if (selectedRoom !== 'ALL') {
      matchesRoom = resource.tags?.some((tag: string) => 
        tag.toLowerCase().includes(selectedRoom.toLowerCase())
      ) || false
    }
    
    const matchesSearch = searchQuery === '' || 
      resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesRoom && matchesSearch
  })

  return (
    <div className="space-y-6">
      <LibraryHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddResource={() => {
          setIsEditing(false)
          setEditingResource(null)
          setResourceModalOpen(true)
        }}
        filteredCount={filteredResources.length}
      />

      <LibraryFilters
        resources={resources}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <ResourceGrid
        resources={filteredResources}
        viewMode={viewMode}
        selectedCategory={selectedCategory}
        selectedRoom={selectedRoom}
        onToggleFavorite={toggleFavorite}
        onEditResource={handleEditResource}
        onDeleteResource={handleDeleteResource}
        onAddToProject={(resource) => {
          setSelectedResource(resource)
          setAddToProjectModal(true)
        }}
        onAddResource={() => {
          setIsEditing(false)
          setEditingResource(null)
          setResourceModalOpen(true)
        }}
      />

      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => {
          setResourceModalOpen(false)
          setIsEditing(false)
          setEditingResource(null)
        }}
        categories={categories}
        editingResource={editingResource}
        isEditing={isEditing}
        onResourceSaved={fetchResources}
      />

      <AddToProjectModal
        isOpen={addToProjectModal}
        onClose={() => {
          setAddToProjectModal(false)
          setSelectedResource(null)
        }}
        resource={selectedResource}
        projects={projects}
      />
    </div>
  )
}