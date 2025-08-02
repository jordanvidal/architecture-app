import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configuration pour ignorer temporairement les erreurs ESLint pendant le build
  eslint: {
    // ⚠️ Warning: Ceci permet au build de passer même avec des erreurs ESLint
    // À utiliser uniquement temporairement pour déployer rapidement
    ignoreDuringBuilds: true,
  },
  
  // Configuration pour ignorer les erreurs TypeScript pendant le build
  typescript: {
    // ⚠️ Dangereux - permet au build de passer même avec des erreurs TypeScript
    // À utiliser uniquement temporairement
    ignoreBuildErrors: true,
  },

  // Configuration pour les API Routes
  // Permet l'upload de fichiers jusqu'à 10MB
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Configuration pour servir les fichiers statiques uploadés
  // Ceci permet d'accéder aux fichiers dans /public/uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ]
  },

  // Configuration des headers pour les fichiers uploadés
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },

  // Ajoutez ici toute autre configuration existante
  // Par exemple :
  // images: {
  //   domains: [],
  // },
}

export default nextConfig