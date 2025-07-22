// scripts/use-local-images.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🏠 Configuration des images locales...')

  // URLs locales (Next.js sert automatiquement depuis /public)
  const localImages = {
    'Villa Moderne': '/images/projects/villa-moderne.jpg',
    'Appartement Parisien': '/images/projects/appartement-parisien.jpg',
    'Maison Familiale': '/images/projects/maison-familiale.jpg',
    'Loft Industriel': '/images/projects/loft-industriel.jpg'
  }

  for (const [projectName, imageUrl] of Object.entries(localImages)) {
    await prisma.project.updateMany({
      where: { name: projectName },
      data: { imageUrl }
    })
    console.log(`✅ ${projectName}: ${imageUrl}`)
  }

  console.log('\n🎉 Images locales configurées!')
  console.log('\n📁 Structure attendue:')
  console.log('   public/')
  console.log('   └── images/')
  console.log('       └── projects/')
  console.log('           ├── villa-moderne.jpg')
  console.log('           ├── appartement-parisien.jpg') 
  console.log('           ├── maison-familiale.jpg')
  console.log('           └── loft-industriel.jpg')
  console.log('\n💡 Avantages: Plus rapide, pas de dépendance externe, vos vraies images!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })