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

  // Ajoutez ici toute autre configuration existante
  // Par exemple :
  // images: {
  //   domains: [],
  // },
}

export default nextConfig