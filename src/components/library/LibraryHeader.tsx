interface LibraryHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onAddResource: () => void
  filteredCount: number
}

export default function LibraryHeader({ 
  searchQuery, 
  setSearchQuery, 
  onAddResource, 
  filteredCount 
}: LibraryHeaderProps) {
  return (
    <>
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Bibliothèque de ressources</h2>
          <p className="text-slate-600 text-sm mt-1">
            Gérez votre catalogue de produits et matériaux
          </p>
        </div>
        <button 
          onClick={onAddResource}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
        >
          + Ajouter un produit
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rechercher par nom, marque ou description..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-slate-600 mt-2">
            🔍 {filteredCount} résultat{filteredCount !== 1 ? 's' : ''} pour "{searchQuery}"
          </p>
        )}
      </div>
    </>
  )
}