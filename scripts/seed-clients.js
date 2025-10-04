// prisma/seed-client-all-projects.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Création du client avec accès à TOUS les projets...\n')

  // 1. Créer un client de test
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Vérifier si le client existe déjà
  let client = await prisma.user.findUnique({
    where: { email: 'client@test.com' }
  })

  if (client) {
    console.log('ℹ️  Client existe déjà, réutilisation du compte existant')
  } else {
    // Créer le client
    client = await prisma.user.create({
      data: {
        email: 'client@test.com',
        password: hashedPassword,
        firstName: 'Marie',
        lastName: 'Dupont',
        role: 'CLIENT'
      }
    })
  }

  console.log('✅ Client créé:')
  console.log(`   Email: ${client.email}`)
  console.log(`   ID: ${client.id}\n`)

  // 2. Récupérer TOUS les projets
  const allProjects = await prisma.project.findMany({
    include: {
      creator: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  })

  if (allProjects.length === 0) {
    console.log('⚠️  Aucun projet trouvé. Crée d\'abord des projets avec ton compte architecte.')
    return
  }

  console.log(`📋 ${allProjects.length} projet(s) trouvé(s)\n`)

  // 3. Donner accès à tous les projets
  let accessCount = 0
  for (const project of allProjects) {
    await prisma.projectClient.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: client.id
        }
      },
      update: {},
      create: {
        projectId: project.id,
        userId: client.id
      }
    })
    
    console.log(`   ✅ ${project.name}`)
    accessCount++
  }

  console.log(`\n🎉 TERMINÉ! Accès donné à ${accessCount} projet(s)\n`)
  console.log('📱 Pour tester:')
  console.log('   Connecte-toi avec: client@test.com / password123')
  console.log('   Visite: http://localhost:3000/client\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erreur:', e)
    await prisma.$disconnect()
    process.exit(1)
  })