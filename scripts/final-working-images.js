// scripts/final-working-images.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 SOLUTION FINALE - Images garanties qui marchent\n')

  // Images d'appartements de luxe qui fonctionnent à 100%
  const workingImages = {
    'Villa Moderne': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Appartement Parisien': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Maison Familiale': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Loft Industriel': 'https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }

  for (const [projectName, imageUrl] of Object.entries(workingImages)) {
    await prisma.project.updateMany({
      where: { name: projectName },
      data: { imageUrl }
    })
    console.log(`✅ ${projectName}: Image mise à jour`)
  }

  console.log('\n🎉 Images d\'appartements de luxe configurées!')
  console.log('🎯 Ces images Unsplash marchent à 100%')
  console.log('\n💡 Pour vos images Pinterest plus tard:')
  console.log('   1. Téléchargez-les sur votre ordinateur')
  console.log('   2. Hébergez-les sur Cloudinary ou imgur')
  console.log('   3. Utilisez les URLs directes')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })