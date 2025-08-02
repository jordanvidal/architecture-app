// src/app/api/debug-auth/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL ? 'Définie' : 'NON DÉFINIE ❌',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Définie' : 'NON DÉFINIE ❌',
    databaseUrl: process.env.DATABASE_URL ? 'Définie' : 'NON DÉFINIE ❌',
    session: session ? 'Session active' : 'Pas de session',
    sessionData: session ? {
      user: session.user?.email,
      expires: session.expires
    } : null,
    authOptions: {
      hasProviders: authOptions.providers?.length > 0,
      providersCount: authOptions.providers?.length,
      hasCallbacks: !!authOptions.callbacks,
      pages: authOptions.pages
    }
  }
  
  // Ne pas exposer en production réelle
  if (process.env.NODE_ENV === 'development') {
    debug.nextAuthUrlValue = process.env.NEXTAUTH_URL
  }
  
  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}