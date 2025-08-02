interface Project {
  id: string
  name: string
  clientName: string
  status: string
  budgetTotal: number
  budgetSpent: number
  progressPercentage: number
  created_at: string
  imageUrl?: string
}

interface ProjectCardProps {
  project: Project
  onImageUpload: (projectId: string) => void
}

export default function ProjectCard({ project, onImageUpload }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🏠</span>
              <p className="text-sm">Aucune image</p>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onImageUpload(project.id)
            }}
            className="opacity-0 group-hover:opacity-100 bg-white text-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:bg-slate-50"
          >
            {project.imageUrl ? '📷 Changer' : '📷 Ajouter'}
          </button>
        </div>
      </div>

      <a href={`/projects/${project.id}`} className="block p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {project.name}
          </h3>
          <p className="text-slate-600 text-sm">{project.clientName}</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>Avancement</span>
            <span>{project.progressPercentage || 0}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-slate-800 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progressPercentage || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-slate-600">Budget: </span>
            <span className="font-medium text-slate-900">
              {project.budgetTotal?.toLocaleString('fr-FR') || '0'} €
            </span>
          </div>
          <div className="text-slate-500">
            {new Date(project.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </a>
    </div>
  )
}