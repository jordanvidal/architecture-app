// app/api/debug/projects/route.ts
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/get-prisma'

export async function GET() {
  try {
    // Récupérer TOUS les projets sans filtre
    const allProjects = await prisma.project.findMany({
      include: {
        creator: true,
        spaces: true,
        prescriptions: true
      }
    })

    // Récupérer tous les utilisateurs
    const allUsers = await prisma.User.findMany()

    return NextResponse.json({
      projectCount: allProjects.length,
      projects: allProjects,
      userCount: allUsers.length,
      users: allUsers.map(u => ({ id: u.id, email: u.email }))
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}