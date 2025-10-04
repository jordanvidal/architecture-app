'use client'

import Link from 'next/link';
import { useState } from 'react';

export default function DesignPreviewPage() {
  const [activeOption, setActiveOption] = useState<'E' | 'F' | 'G'>('E');

  const projects = [
    {
      id: '1',
      name: 'Appartement Marais',
      address: '15 Rue des Archives, Paris',
      description: 'Rénovation complète d\'un appartement haussmannien',
      spaces: 5,
      prescriptions: 32,
      progress: 65,
    },
    {
      id: '2',
      name: 'Villa Méditerranée',
      address: 'Nice',
      description: 'Aménagement intérieur villa contemporaine',
      spaces: 8,
      prescriptions: 48,
      progress: 40,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/client" className="text-white/60 hover:text-white text-sm">
              ← Retour
            </Link>
            <div className="flex gap-4">
              {['E', 'F', 'G'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveOption(opt as any)}
                  className={`px-6 py-2 text-sm font-medium transition-all ${
                    activeOption === opt
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Option {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Option E - Brutalist Neo */}
      {activeOption === 'E' && (
        <div className="min-h-screen bg-black text-white p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-20 pt-20">
              <div className="relative">
                <h1 className="text-[12vw] font-black leading-none tracking-tighter">
                  VOS
                </h1>
                <h1 className="text-[12vw] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                  PROJETS
                </h1>
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400 mix-blend-difference blur-3xl"></div>
              </div>
              <p className="text-xl mt-8 text-white/60 max-w-md">
                ARCHITECTURE · DESIGN · INNOVATION
              </p>
            </div>

            {/* Projects */}
            <div className="space-y-16">
              {projects.map((project, i) => (
                <div 
                  key={project.id}
                  className="group relative border-4 border-white hover:border-yellow-400 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Colored blocks */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-red-500 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="p-12 relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex-1">
                        <div className="text-yellow-400 font-mono text-sm mb-4">
                          [ PROJET-{String(i + 1).padStart(2, '0')} ]
                        </div>
                        <h2 className="text-6xl font-black mb-4 group-hover:text-yellow-400 transition-colors">
                          {project.name.toUpperCase()}
                        </h2>
                        <p className="text-white/60 text-lg">{project.address}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-8xl font-black">{project.progress}</div>
                        <div className="text-xl">%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 border-t-4 border-white pt-8">
                      <div>
                        <div className="text-4xl font-black">{project.spaces}</div>
                        <div className="text-white/60 text-sm mt-1">ESPACES</div>
                      </div>
                      <div>
                        <div className="text-4xl font-black">{project.prescriptions}</div>
                        <div className="text-white/60 text-sm mt-1">ITEMS</div>
                      </div>
                      <div className="flex items-end justify-end">
                        <div className="text-yellow-400 font-mono text-sm group-hover:text-white transition-colors">
                          VOIR →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Option F - Swiss Luxury */}
      {activeOption === 'F' && (
        <div className="min-h-screen bg-[#fafaf9] text-stone-900">
          <div className="max-w-6xl mx-auto px-16 py-24">
            {/* Header */}
            <div className="mb-32">
              <div className="flex items-center gap-8 mb-12">
                <div className="w-2 h-2 bg-stone-900 rounded-full"></div>
                <span className="text-xs tracking-[0.3em] uppercase text-stone-500">Speccio Client</span>
              </div>
              <h1 className="text-[8rem] leading-[0.9] font-light tracking-tight mb-8">
                Vos<br/>Projets
              </h1>
            </div>

            {/* Projects */}
            <div className="space-y-32">
              {projects.map((project) => (
                <div key={project.id} className="group cursor-pointer">
                  <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Number */}
                    <div className="col-span-2">
                      <div className="text-8xl font-light text-stone-300 group-hover:text-stone-900 transition-colors">
                        {project.id.padStart(2, '0')}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="col-span-10">
                      <div className="border-t border-stone-300 pt-8">
                        <h2 className="text-5xl font-light mb-6 group-hover:translate-x-4 transition-transform">
                          {project.name}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-16 mb-12">
                          <div>
                            <p className="text-stone-500 mb-4">{project.address}</p>
                            <p className="text-stone-700 leading-relaxed">{project.description}</p>
                          </div>
                          <div className="space-y-6">
                            <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
                              <span className="text-sm text-stone-500 uppercase tracking-wider">Progression</span>
                              <span className="text-3xl font-light">{project.progress}%</span>
                            </div>
                            <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
                              <span className="text-sm text-stone-500 uppercase tracking-wider">Espaces</span>
                              <span className="text-3xl font-light">{project.spaces}</span>
                            </div>
                            <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
                              <span className="text-sm text-stone-500 uppercase tracking-wider">Sélections</span>
                              <span className="text-3xl font-light">{project.prescriptions}</span>
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-stone-900 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Option G - Glassmorphic Future */}
      {activeOption === 'G' && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-8 py-24">
            {/* Header */}
            <div className="mb-24">
              <div className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
                <span className="text-white/80 text-sm tracking-wider">Portfolio Client</span>
              </div>
              <h1 className="text-8xl font-bold text-white mb-6 tracking-tight">
                Vos Projets
              </h1>
              <p className="text-2xl text-white/70 font-light">
                L'architecture de demain, aujourd'hui
              </p>
            </div>

            {/* Projects */}
            <div className="grid gap-8">
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className="group relative cursor-pointer"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Glass card */}
                  <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-10 overflow-hidden hover:bg-white/15 transition-all duration-500 hover:scale-[1.02]">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
                      {/* Progress Circle */}
                      <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                          <svg className="transform -rotate-90 w-40 h-40">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="url(#gradient)"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${project.progress * 4.4} 440`}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#ec4899" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold text-white">{project.progress}</span>
                            <span className="text-white/60 text-sm">%</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="md:col-span-2 space-y-6">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                            <span className="text-white/60 text-sm uppercase tracking-wider">En cours</span>
                          </div>
                          <h2 className="text-5xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                            {project.name}
                          </h2>
                          <p className="text-white/60 text-lg">{project.address}</p>
                        </div>

                        <p className="text-white/80 text-lg leading-relaxed">
                          {project.description}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 pt-4">
                          <div className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                            <div className="text-3xl font-bold text-white">{project.spaces}</div>
                            <div className="text-white/60 text-xs uppercase tracking-wider mt-1">Espaces</div>
                          </div>
                          <div className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                            <div className="text-3xl font-bold text-white">{project.prescriptions}</div>
                            <div className="text-white/60 text-xs uppercase tracking-wider mt-1">Produits</div>
                          </div>
                          <div className="flex items-center ml-auto">
                            <button className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                              Explorer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
