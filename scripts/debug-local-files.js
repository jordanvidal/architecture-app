// scripts/debug-local-files.js
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 DEBUG DES FICHIERS LOCAUX\n')

  const publicDir = path.join(process.cwd(), 'public', 'images', 'projects')
  
  if (!fs.existsSync(publicDir)) {
    console.log('❌ Le dossier public/images/projects/ n\'existe pas!')
    return
  }

  // Lister tous les fichiers
  const files = fs.readdirSync(publicDir)
  console.log('📁 Fichiers trouvés:')
  files.forEach((file, index) => {
    const stats = fs.statSync(path.join(publicDir, file))
    console.log(`   ${index + 1}. "${file}" (${Math.round(stats.size/1024)}KB)`)
  })

  if (files.length === 0) {
    console.log('❌ Aucun fichier trouvé!')
    return
  }

  // Utiliser les vrais noms de fichiers
  console.log('\n🔧 Configuration avec les vrais noms de fichiers:')
  
  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  // Associer chaque projet au premier fichier disponible (temporaire)
  for (let i = 0; i < Math.min(projects.length, files.length); i++) {
    const project = projects[i]
    const fileName = files[i]
    const imageUrl = `/images/projects/${fileName}`

    await prisma.project.update({
      where: { id: project.id },
      data: { imageUrl }
    })

    console.log(`✅ ${project.name}: ${imageUrl}`)
  }

  console.log('\n🎯 TESTEZ CES URLS DIRECTEMENT:')
  files.forEach(file => {
    console.log(`   http://localhost:3000/images/projects/${file}`)
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