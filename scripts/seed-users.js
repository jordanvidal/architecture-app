// scripts/seed-users.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Créer les utilisateurs de test
  const users = [
    {
      email: 'marie.dubois@agence.com',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Dubois',
      role: 'AGENCY'
    },
    {
      email: 'jean.dupont@email.com',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'CLIENT'
    },
    {
      email: 'anne.dupont@email.com',
      password: hashedPassword,
      firstName: 'Anne',
      lastName: 'Dupont',
      role: 'CLIENT'
    }
  ]

  for (const userData of users) {
    const user = await prisma.User.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    })
    console.log(`✅ Utilisateur créé: ${user.email}`)
  }

  console.log('🎉 Utilisateurs de test créés avec succès!')
  console.log('Mot de passe pour tous: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })