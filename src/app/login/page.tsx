'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else {
        // Récupérer la session pour obtenir le rôle
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        // Rediriger selon le rôle
        if (session?.user?.role === 'CLIENT') {
          router.push('/client')
        } else {
          router.push('/projects')
        }
      }
    } catch (error) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">AI</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Connexion
            </h1>
            <p className="text-slate-600">
              Accédez à votre espace projet
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 rounded-b-2xl p-6 border-x border-b border-slate-200 text-center">
          <p className="text-slate-600 text-sm">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-slate-800 font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Comptes de démonstration</h3>
          <div className="space-y-2 text-sm">
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-blue-100 p-2 rounded"
              onClick={() => {
                setEmail('marie.dubois@agence.com')
                setPassword('password123')
              }}
            >
              <span className="text-blue-800">marie.dubois@agence.com</span>
              <span className="text-blue-600">(Architecte)</span>
            </div>
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-blue-100 p-2 rounded"
              onClick={() => {
                setEmail('client@test.com')
                setPassword('password123')
              }}
            >
              <span className="text-blue-800">client@test.com</span>
              <span className="text-blue-600">(Client)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
