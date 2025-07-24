// scripts/test-user.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔧 Test création/mise à jour utilisateur...')

    // Hash du mot de passe
    console.log('🔐 Hashage du mot de passe...')
    const hashedPassword = await bcrypt.hash('password123', 12)
    console.log('✅ Password hashé:', hashedPassword.substring(0, 20) + '...')

    // Mettre à jour l'utilisateur existant ou le créer
    const user = await prisma.user.upsert({
      where: { email: 'marie.dubois@agence.com' },
      update: {
        firstName: 'Noemie',
        lastName: 'UZAN (Maison Stellar)',
        role: 'AGENCY',
        password: hashedPassword
      },
      create: {
        email: 'marie.dubois@agence.com',
        firstName: 'Noemie',
        lastName: 'UZAN (Maison Stellar)',
        role: 'AGENCY',
        password: hashedPassword
      }
    })

    console.log('✅ Utilisateur mis à jour:', user.email)
    console.log('✅ Password haché enregistré:', !!user.password)
    console.log('✅ Longueur du hash:', user.password?.length)

    // Vérification
    const verification = await prisma.user.findUnique({
      where: { email: 'marie.dubois@agence.com' },
      select: { id: true, email: true, password: true, role: true, firstName: true, lastName: true }
    })

    console.log('🔍 Vérification utilisateur:', {
      id: verification?.id,
      email: verification?.email,
      name: `${verification?.firstName} ${verification?.lastName}`,
      hasPassword: !!verification?.password,
      passwordLength: verification?.password?.length,
      role: verification?.role
    })

    console.log('\n🎉 Utilisateur prêt pour la connexion!')
    console.log('📧 Email: marie.dubois@agence.com')
    console.log('🔑 Mot de passe: password123')

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })