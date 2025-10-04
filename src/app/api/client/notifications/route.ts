// app/api/client/notifications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    if (unreadOnly) {
      // Retourner seulement le compte des notifications non lues
      const count = await prisma.notification.count({
        where: {
          receiverId: user.id,
          read: false
        }
      })
      return NextResponse.json({ count })
    }

    // Récupérer toutes les notifications
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: user.id
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limiter à 50 dernières notifications
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Erreur chargement notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Marquer toutes comme lues
      await prisma.notification.updateMany({
        where: {
          receiverId: user.id,
          read: false
        },
        data: {
          read: true
        }
      })
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      // Marquer une notification comme lue
      await prisma.notification.update({
        where: {
          id: notificationId,
          receiverId: user.id
        },
        data: {
          read: true
        }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action non spécifiée' }, { status: 400 })
  } catch (error) {
    console.error('Erreur mise à jour notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}