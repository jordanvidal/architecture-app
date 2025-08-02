// scripts/add-default-spaces.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🏠 Ajout d\'espaces par défaut aux projets...\n')

  // Récupérer tous les projets
  const projects = await prisma.project.findMany({
    include: {
      spaces: true
    }
  })

  console.log(`📋 ${projects.length} projets trouvés`)

  for (const project of projects) {
    if (project.spaces.length === 0) {
      // Ajouter un espace par défaut
      await prisma.spaces.create({
        data: {
          projectId: project.id,
          name: 'Espace Principal',
          type: 'SALON',
          description: 'Espace principal du projet'
        }
      })
      console.log(`✅ Espace ajouté au projet "${project.name}"`)
    } else {
      console.log(`⏭️ Projet "${project.name}" a déjà ${project.spaces.length} espace(s)`)
    }
  }

  // Vérification finale
  const projectsWithSpaces = await prisma.project.findMany({
    include: {
      _count: {
        select: { spaces: true }
      }
    }
  })

  console.log('\n📊 Résumé :')
  projectsWithSpaces.forEach(project => {
    console.log(`   📂 ${project.name} : ${project._count.spaces} espace(s)`)
  })

  console.log('\n🎉 Espaces par défaut ajoutés avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })