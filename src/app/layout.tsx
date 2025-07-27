// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArchiApp - Architecture d\'Intérieur',
  description: 'Gestion collaborative de projets d\'architecture d\'intérieur',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-slate-50">
              <Navbar />
              <main>{children}</main>
              <ToastContainer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}