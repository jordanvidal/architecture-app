// scripts/fix-images.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Images placeholder qui fonctionnent toujours
  const workingImages = [
    'https://i.pinimg.com/1200x/30/e8/75/30e87502a8eb53e918013b7021d6c4f2.jpg', // Villa Moderne
    'https://fr.pinterest.com/pin/2744449768043412/', // Appartement Parisien  
    'https://fr.pinterest.com/pin/1407443629377895/', // Maison Familiale
    'https://fr.pinterest.com/pin/5348093303511392/'  // Loft Industriel
  ]

  const projectNames = ['Villa Moderne', 'Appartement Parisien', 'Maison Familiale', 'Loft Industriel']

  console.log('🔧 Correction des images avec des placeholder qui fonctionnent...')

  for (let i = 0; i < projectNames.length; i++) {
    const projectName = projectNames[i]
    const imageUrl = workingImages[i]

    await prisma.project.updateMany({
      where: { name: projectName },
      data: { imageUrl }
    })

    console.log(`✅ ${projectName}: ${imageUrl}`)
  }

  console.log('🎉 Images corrigées avec des placeholder fiables!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })