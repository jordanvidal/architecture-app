// src/app/init-db/page.tsx
// ⚠️ SUPPRIMER CETTE PAGE APRÈS UTILISATION
'use client'

import { useState } from 'react'

export default function InitPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  
  const initDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret: 'votre-secret-temporaire-12345' 
        })
      })
      
      const data = await response.json()
      setStatus(data.message || 'Erreur')
    } catch (error) {
      setStatus('Erreur: ' + error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Initialisation Base de Données</h1>
        <p className="text-gray-600 mb-6">
          Cliquez pour créer l&apos;utilisateur initial et les catégories.
        </p>
        
        <button
          onClick={initDatabase}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Initialisation...' : 'Initialiser la DB'}
        </button>
        
        {status && (
          <div className={`mt-4 p-3 rounded ${
            status.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {status}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p>⚠️ Page temporaire - À supprimer après utilisation</p>
        </div>
      </div>
    </div>
  )
}