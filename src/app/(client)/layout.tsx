// src/app/(client)/layout.tsx
'use client'  

import { SessionProvider } from 'next-auth/react'
import ClientLayoutContent from './client-layout-content'
import '../globals.css'

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <ClientLayoutContent>
            {children}
          </ClientLayoutContent>
        </SessionProvider>
      </body>
    </html>
  )
}