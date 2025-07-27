// src/app/api/projects/route.ts - VERSION CORRIGÉE
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import prisma from '@/lib/prisma'


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            prescriptions: true,
            spaces: true
          }
        }
      }
    })

    // Transformer les données pour correspondre au front
    const transformedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.client_name,
      clientEmail: project.client_email,
      status: project.status,
      budgetTotal: project.budget_total,
      budgetSpent: project.budget_spent,
      progressPercentage: project.progress_percentage,
      imageUrl: project.image_url,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      creator: project.creator,
      _count: project._count
    }))
    
    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error('❌ Erreur API projects:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, clientName, clientEmail, budgetTotal } = body

    if (!name || !clientName) {
      return NextResponse.json({ 
        error: 'Nom du projet et nom du client requis' 
      }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        client_name: clientName,
        client_email: clientEmail,
        budget_total: budgetTotal ? parseFloat(budgetTotal) : null,
        created_by: session.user.id
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    const transformedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.client_name,
      clientEmail: project.client_email,
      status: project.status,
      budgetTotal: project.budget_total,
      budgetSpent: project.budget_spent,
      progressPercentage: project.progress_percentage,
      imageUrl: project.image_url,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      creator: project.creator
    }

    return NextResponse.json(transformedProject, { status: 201 })
  } catch (error) {
    console.error('❌ Erreur POST project:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}