export default function OptionD() {
  const projects = [
    {
      id: '1',
      name: 'Appartement Marais',
      address: '15 Rue des Archives, Paris',
      description: 'Rénovation complète d\'un appartement haussmannien de 120m²',
      spaces: 5,
      prescriptions: 32,
      progress: 65,
    },
    {
      id: '2',
      name: 'Villa Méditerranée',
      address: 'Nice, Alpes-Maritimes',
      description: 'Aménagement intérieur villa contemporaine vue mer',
      spaces: 8,
      prescriptions: 48,
      progress: 40,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <div className="relative h-[40vh] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 pb-16 w-full">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-emerald-400 to-transparent"></div>
              <span className="text-emerald-400 text-sm tracking-[0.2em] uppercase font-light">Portfolio Client</span>
            </div>
            <h1 className="text-7xl font-light text-white tracking-tight">
              Vos Projets
            </h1>
            <p className="text-xl text-zinc-400 font-light max-w-2xl">
              Suivez l'évolution de vos espaces en temps réel
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="space-y-12">
          {projects.map((project, index) => (
            <div 
              key={project.id}
              className="group cursor-pointer"
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Image */}
                <div className={`relative overflow-hidden ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="aspect-[4/3] bg-zinc-900 rounded-sm overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:scale-105 transition-transform duration-700">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl font-light text-zinc-700">{project.name.charAt(0)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Badge */}
                  <div className="absolute top-6 right-6 backdrop-blur-xl bg-black/40 border border-white/10 rounded-full px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative">
                        <svg className="transform -rotate-90 w-12 h-12">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                            fill="none"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="#10b981"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${project.progress * 1.26} 126`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <span className="tracking-wider uppercase font-light">En cours</span>
                    </div>
                    <h2 className="text-4xl font-light text-white group-hover:text-emerald-400 transition-colors">
                      {project.name}
                    </h2>
                    <p className="text-zinc-500 text-sm tracking-wide">{project.address}</p>
                  </div>

                  <p className="text-zinc-400 text-lg font-light leading-relaxed">
                    {project.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-800">
                    <div>
                      <div className="text-3xl font-light text-white mb-1">{project.spaces}</div>
                      <div className="text-sm text-zinc-500 tracking-wide">Espaces</div>
                    </div>
                    <div>
                      <div className="text-3xl font-light text-white mb-1">{project.prescriptions}</div>
                      <div className="text-sm text-zinc-500 tracking-wide">Sélections</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <button className="group/btn inline-flex items-center gap-3 text-white hover:text-emerald-400 transition-colors">
                      <span className="text-sm tracking-[0.15em] uppercase font-light">Explorer le projet</span>
                      <svg className="w-5 h-5 transform group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
