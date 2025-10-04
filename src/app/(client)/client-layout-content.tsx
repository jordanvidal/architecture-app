// src/app/(client)/client-layout-content.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bell, LogOut, User } from 'lucide-react'

export default function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated' && session?.user?.role !== 'CLIENT') {
      router.push('/projects')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnreadNotifications()
    }
  }, [status])

  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch('/api/client/notifications?unread=true')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count || 0)
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Speccio
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                onClick={() => router.push('/client/notifications')}
                className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {session?.user?.name || session?.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}