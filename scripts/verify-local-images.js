// scripts/verify-local-images.js
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 VÉRIFICATION IMAGES LOCALES\n')

  // 1. Vérifier les fichiers physiques
  console.log('1️⃣ FICHIERS DANS public/images/projects/:')
  const publicDir = path.join(process.cwd(), 'public', 'images', 'projects')
  
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir)
    if (files.length === 0) {
      console.log('   ❌ Dossier vide!')
    } else {
      files.forEach(file => {
        const stats = fs.statSync(path.join(publicDir, file))
        console.log(`   ✅ ${file} (${Math.round(stats.size/1024)}KB)`)
      })
    }
  } else {
    console.log('   ❌ Dossier public/images/projects/ n\'existe pas!')
  }

  // 2. Vérifier la base de données
  console.log('\n2️⃣ URLs EN BASE:')
  const projects = await prisma.project.findMany({
    select: { name: true, imageUrl: true }
  })
  
  projects.forEach(p => {
    console.log(`   ${p.name}: "${p.imageUrl}"`)
  })

  // 3. Test avec images de secours si problème
  console.log('\n3️⃣ IMAGES DE SECOURS (si problème):')
  const fallbackImages = {
    'Villa Moderne': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjM2NzY3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWxsYSBNb2Rlcm5lPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk0YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgUGxhY2Vob2xkZXI8L3RleHQ+PC9zdmc+',
    'Appartement Parisien': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjM2NzY3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcHBhcnRlbWVudCBQYXJpc2llbjwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5NGEzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==',
    'Maison Familiale': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjM2NzY3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWlzb24gRmFtaWxpYWxlPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk0YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgUGxhY2Vob2xkZXI8L3RleHQ+PC9zdmc+',
    'Loft Industriel': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjM2NzY3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2Z0IEluZHVzdHJpZWw8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTRhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4='
  }

  console.log('   Voulez-vous utiliser des placeholders temporaires ? (Tapez "oui")')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })