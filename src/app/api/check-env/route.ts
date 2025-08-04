// src/app/api/check-env/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Vérifier les variables d'environnement
    const env = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NON DÉFINI',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ DÉFINI' : '❌ NON DÉFINI',
      DATABASE_URL: process.env.DATABASE_URL ? '✅ DÉFINI' : '❌ NON DÉFINI',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
    
    // Tester la session
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      environment: env,
      session: session || null,
      authConfigured: !!authOptions,
      providersCount: authOptions.providers?.length || 0
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Erreur lors de la vérification',
      details: error.message
    }, { status: 500 })
  }
}