// scripts/seed-projects.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🏗️ Création des projets de test...\n')

  // Récupérer l'utilisateur agence
  const agenceUser = await prisma.User.findUnique({
    where: { email: 'marie.dubois@agence.com' }
  })

  if (!agenceUser) {
    console.log('❌ Utilisateur agence non trouvé')
    return
  }

  console.log(`✅ Utilisateur agence trouvé: ${agenceUser.firstName} ${agenceUser.lastName}`)

  // Projets de test
  const projects = [
    {
      name: 'Villa Moderne Lyon',
      description: 'Rénovation complète d\'une villa contemporaine avec piscine et jardin paysager',
      clientName: 'M. et Mme Dubois',
      clientEmail: 'jean.dubois@email.com',
      status: 'EN_COURS',
      budgetTotal: 45000,
      budgetSpent: 28750,
      progressPercentage: 65
    },
    {
      name: 'Appartement Haussmannien Paris',
      description: 'Réaménagement d\'un 120m² dans le 8ème arrondissement avec conservation des éléments d\'époque',
      clientName: 'Mme Sophie Martin',
      clientEmail: 'sophie.martin@email.com',
      status: 'EN_COURS',
      budgetTotal: 85000,
      budgetSpent: 12500,
      progressPercentage: 15
    },
    {
      name: 'Loft Industriel Marseille',
      description: 'Transformation d\'un ancien atelier en loft moderne avec mezzanine',
      clientName: 'M. Alexandre Petit',
      clientEmail: 'alex.petit@email.com',
      status: 'BROUILLON',
      budgetTotal: 65000,
      budgetSpent: 0,
      progressPercentage: 5
    }
  ]

  // Créer les projets
  for (const projectData of projects) {
    try {
      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          client_name: projectData.clientName,
          client_email: projectData.clientEmail,
          status: projectData.status,
          budget_total: projectData.budgetTotal,
          budget_spent: projectData.budgetSpent,
          progress_percentage: projectData.progressPercentage,
          created_by: agenceUser.id
        }
      })

      console.log(`✅ Projet "${project.name}" créé`)

      // Créer un espace par défaut pour chaque projet
      const defaultSpace = await prisma.spaces.create({
        data: {
          name: 'Espace Principal',
          type: 'SALON',
          description: 'Espace principal du projet',
          projectId: project.id
        }
      })

      console.log(`   📂 Espace "${defaultSpace.name}" créé`)

    } catch (error) {
      console.error(`❌ Erreur création projet "${projectData.name}":`, error.message)
    }
  }

  // Vérification finale
  const allProjects = await prisma.project.findMany({
    include: {
      spaces: true,
      creator: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  })

  console.log('\n📊 Résumé des projets créés:')
  allProjects.forEach(project => {
    console.log(`   🏗️ ${project.name} (${project.status})`)
    console.log(`      👤 Créé par: ${project.creator.firstName} ${project.creator.lastName}`)
    console.log(`      📂 ${project.spaces.length} espace(s)`)
    console.log(`      💰 Budget: ${project.budgetTotal}€ (${project.budgetSpent}€ dépensés)`)
    console.log(`      📈 Avancement: ${project.progressPercentage}%\n`)
  })

  console.log('🎉 Projets créés avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })