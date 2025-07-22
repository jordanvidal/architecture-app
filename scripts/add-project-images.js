// scripts/add-project-images.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Vos images d'appartements parisiens de luxe
  // Note: Les URLs Pinterest ne permettent pas l'affichage direct
  // J'utilise des équivalents Unsplash en attendant la conversion
  const luxuryParisianImages = [
    // Image 1 - Style classique parisien avec moulures
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    
    // Image 2 - Salon moderne avec cheminée 
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    
    // Image 3 - Appartement haussmannien élégant
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    
    // Image 4 - Loft parisien avec verrière
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    
    // Images supplémentaires dans le même style
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  ]

  // Associations spécifiques par projet
  const projectImageMapping = {
    'Villa Moderne': luxuryParisianImages[1], // Salon moderne
    'Appartement Parisien': luxuryParisianImages[0], // Style classique parisien
    'Maison Familiale': luxuryParisianImages[2], // Haussmannien élégant
    'Loft Industriel': luxuryParisianImages[3] // Loft avec verrière
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' }
  })

  console.log(`🏠 Ajout d'images de luxe parisien à ${projects.length} projets...`)

  for (const project of projects) {
    // Utiliser l'image spécifique ou une par défaut
    const imageUrl = projectImageMapping[project.name] || luxuryParisianImages[0]

    await prisma.project.update({
      where: { id: project.id },
      data: { imageUrl }
    })

    console.log(`✅ Image ajoutée à "${project.name}": ${imageUrl}`)
  }

  console.log('🎉 Images d\'appartements parisiens de luxe ajoutées!')
  console.log('📌 Note: URLs Pinterest converties en équivalents Unsplash')
  console.log('💡 Pour utiliser les vraies images Pinterest, il faudrait les télécharger et les héberger')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })