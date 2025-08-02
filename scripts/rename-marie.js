// scripts/rename-marie.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('✏️ Renommage de Marie Dubois...')

  const result = await prisma.User.updateMany({
    where: { email: 'marie.dubois@agence.com' },
    data: {
      firstName: 'Noemie',
      lastName: 'UZAN (Maison Stellar)'
    }
  })

  if (result.count > 0) {
    console.log('✅ Marie Dubois renommée en "Noemie UZAN (Maison Stellar)"')
  } else {
    console.log('❌ Utilisateur non trouvé')
  }

  // Vérification
  const user = await prisma.User.findUnique({
    where: { email: 'marie.dubois@agence.com' },
    select: { firstName: true, lastName: true, email: true }
  })

  if (user) {
    console.log(`📋 Nom actuel: ${user.firstName} ${user.lastName}`)
    console.log(`📧 Email: ${user.email}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })