// scripts/fix-working-images.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🏠 Remplacement par de vraies images d\'appartements parisiens...')

  // Images d'appartements parisiens de luxe qui FONCTIONNENT
  const luxuryImages = {
    'Villa Moderne': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Appartement Parisien': 'https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 
    'Maison Familiale': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Loft Industriel': 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  }

  for (const [projectName, imageUrl] of Object.entries(luxuryImages)) {
    await prisma.project.updateMany({
      where: { name: projectName },
      data: { imageUrl }
    })
    console.log(`✅ ${projectName}: Image mise à jour`)
  }

  console.log('\n🎉 Images corrigées avec des URLs qui fonctionnent!')
  console.log('💡 Astuce: Les URLs Pinterest ne sont pas des images directes')
  console.log('📸 Pour utiliser vos images Pinterest:')
  console.log('   1. Clic droit > "Enregistrer l\'image sous"')
  console.log('   2. Héberger sur un service (Cloudinary, imgur, etc.)')
  console.log('   3. Utiliser l\'URL directe de l\'image')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })