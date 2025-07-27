'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Projets', href: '/projects', icon: '📊' },
    { name: 'Bibliothèque', href: '/library', icon: '📚' },
  ]

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            {/* Logo et navigation principale */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-lg sm:text-xl font-bold text-slate-900">
                  ArchiApp
                </Link>
              </div>
              
              {/* Navigation desktop */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Menu utilisateur desktop */}
            <div className="hidden sm:flex sm:items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600">
                    {session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Connexion
                </Link>
              )}
            </div>
            
            {/* Bouton menu mobile */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
              >
                <span className="sr-only">Ouvrir le menu</span>
                {!mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile - En dehors de la navbar pour éviter les problèmes de z-index */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-white" style={{ top: '56px' }}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-3 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-slate-50 border-l-4 border-slate-900 text-slate-900'
                    : 'border-l-4 border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
          {session && (
            <div className="pt-4 pb-3 border-t border-slate-200">
              <div className="px-4 space-y-3">
                <div className="text-sm font-medium text-slate-900">
                  {session.user?.email}
                </div>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/login' })
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left text-base text-slate-500 hover:text-slate-700 py-2"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le menu mobile */}
      {mobileMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-25 z-40" 
          onClick={() => setMobileMenuOpen(false)}
          style={{ top: '56px' }}
        />
      )}
    </>
  )
}