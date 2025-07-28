// src/app/api/debug-db/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET'
  const directUrl = process.env.DIRECT_URL || 'NOT SET'
  
  // Parser l'URL pour identifier le problème
  const parseUrl = (url: string) => {
    if (url === 'NOT SET') return { valid: false, reason: 'Variable non définie' }
    
    try {
      // Vérifier le format général
      if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
        return { valid: false, reason: 'URL doit commencer par postgresql:// ou postgres://' }
      }
      
      // Extraire les parties
      const regex = /^(postgresql|postgres):\/\/([^:]+):([^@]+)@([^:\/]+):(\d+)\/(.+)$/
      const match = url.match(regex)
      
      if (!match) {
        return { valid: false, reason: 'Format incorrect' }
      }
      
      const [, protocol, user, password, host, port, database] = match
      
      // Masquer le mot de passe mais montrer sa structure
      const passwordInfo = {
        length: password.length,
        hasSpecialChars: /[^a-zA-Z0-9]/.test(password),
        hasAt: password.includes('@'),
        hasColon: password.includes(':'),
        hasSlash: password.includes('/'),
        hasQuestion: password.includes('?'),
        hasPercent: password.includes('%'),
      }
      
      return {
        valid: true,
        protocol,
        user,
        passwordInfo,
        host,
        port,
        database,
        fullUrl: url.substring(0, 20) + '...' + url.substring(url.length - 20)
      }
    } catch (error: any) {
      return { valid: false, reason: error.message }
    }
  }
  
  return NextResponse.json({
    DATABASE_URL: parseUrl(dbUrl),
    DIRECT_URL: parseUrl(directUrl),
    tip: "Si vous voyez des caractères spéciaux dans passwordInfo, ils doivent être encodés"
  })
}