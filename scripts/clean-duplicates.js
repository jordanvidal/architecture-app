// scripts/clean-duplicates.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nettoyage des projets en double...')

  // Grouper les projets par nom
  const projects = await prisma.project.findMany({
    include: {
      deliveryAddress: true,
      billingAddresses: true
    },
    orderBy: { createdAt: 'asc' }
  })

  // Grouper par nom
  const projectsByName = {}
  projects.forEach(project => {
    if (!projectsByName[project.name]) {
      projectsByName[project.name] = []
    }
    projectsByName[project.name].push(project)
  })

  // Pour chaque nom, garder celui avec adresses ou le plus récent
  for (const [name, duplicates] of Object.entries(projectsByName)) {
    if (duplicates.length > 1) {
      console.log(`\n📋 Projet "${name}" - ${duplicates.length} exemplaires trouvés`)
      
      // Trouver le meilleur : celui avec adresses
      const withAddresses = duplicates.find(p => p.deliveryAddress || p.billingAddresses.length > 0)
      const toKeep = withAddresses || duplicates[0] // Sinon garder le premier
      
      console.log(`  ✅ Garder: ${toKeep.id} (${withAddresses ? 'avec adresses' : 'sans adresses'})`)
      
      // Supprimer les autres
      const toDelete = duplicates.filter(p => p.id !== toKeep.id)
      for (const project of toDelete) {
        console.log(`  🗑️  Supprimer: ${project.id}`)
        
        // Supprimer les dépendances d'abord
        await prisma.deliveryAddress.deleteMany({ where: { projectId: project.id } })
        await prisma.billingAddress.deleteMany({ where: { projectId: project.id } })
        await prisma.project.delete({ where: { id: project.id } })
      }
    }
  }

  console.log('\n🎉 Nettoyage terminé!')
  
  // Afficher le résultat
  const remainingProjects = await prisma.project.findMany({
    include: {
      deliveryAddress: true,
      billingAddresses: true
    }
  })
  
  console.log('\n📊 Projets restants:')
  remainingProjects.forEach(p => {
    console.log(`  - ${p.name} (${p.deliveryAddress ? 'avec' : 'sans'} adresses)`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })