// scripts/seed-projects.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Récupérer l'utilisateur agence pour créer les projets
  const agenceUser = await prisma.user.findUnique({
    where: { email: 'marie.dubois@agence.com' }
  })

  if (!agenceUser) {
    console.error('❌ Utilisateur agence non trouvé')
    return
  }

  // Projets de test
  const projects = [
    {
      name: 'Villa Moderne',
      description: 'Rénovation complète d\'une villa contemporaine avec piscine',
      clientName: 'M. et Mme Dubois',
      clientEmail: 'jean.dupont@email.com',
      address: '123 Avenue des Lilas, 69000 Lyon',
      status: 'PRESCRIPTION',
      budgetTotal: 45200.00,
      budgetSpent: 28750.00,
      progressPercentage: 65,
      startDate: new Date('2024-03-01'),
      createdBy: agenceUser.id
    },
    {
      name: 'Appartement Parisien',
      description: 'Aménagement d\'un appartement haussmannien de 120m²',
      clientName: 'Mme Martin',
      clientEmail: 'claire.martin@email.com',
      address: '45 Rue de Rivoli, 75001 Paris',
      status: 'CHANTIER',
      budgetTotal: 28500.00,
      budgetSpent: 22800.00,
      progressPercentage: 80,
      startDate: new Date('2024-02-08'),
      createdBy: agenceUser.id
    },
    {
      name: 'Maison Familiale',
      description: 'Création d\'espaces de vie pour une famille de 5 personnes',
      clientName: 'Famille Rodriguez',
      clientEmail: 'carlos.rodriguez@email.com',
      address: '78 Chemin des Vignes, 33000 Bordeaux',
      status: 'CONCEPTION',
      budgetTotal: 62000.00,
      budgetSpent: 15500.00,
      progressPercentage: 25,
      startDate: new Date('2024-01-22'),
      createdBy: agenceUser.id
    },
    {
      name: 'Loft Industriel',
      description: 'Transformation d\'un ancien atelier en loft moderne',
      clientName: 'M. Lemaire',
      clientEmail: 'paul.lemaire@email.com',
      address: '12 Rue de l\'Industrie, 59000 Lille',
      status: 'TERMINE',
      budgetTotal: 35000.00,
      budgetSpent: 34200.00,
      progressPercentage: 100,
      startDate: new Date('2023-12-12'),
      endDate: new Date('2024-04-15'),
      createdBy: agenceUser.id
    }
  ]

  // Créer les projets
  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: projectData
    })
    console.log(`✅ Projet créé: ${project.name}`)
  }

  // Créer les catégories de prescriptions par défaut
  const categories = [
    { name: 'mobilier', description: 'Meubles et ameublement', colorHex: '#1a1a1a', icon: '🛋️' },
    { name: 'eclairage', description: 'Luminaires et éclairage', colorHex: '#374151', icon: '💡' },
    { name: 'decoration', description: 'Objets décoratifs et art', colorHex: '#6b7280', icon: '🖼️' },
    { name: 'textile', description: 'Rideaux, tapis, coussins', colorHex: '#9ca3af', icon: '🏺' },
    { name: 'revetement', description: 'Sols, murs, plafonds', colorHex: '#d1d5db', icon: '🧱' },
    { name: 'peinture', description: 'Peintures et finitions', colorHex: '#e5e7eb', icon: '🎨' }
  ]

  for (const categoryData of categories) {
    await prisma.prescriptionCategory.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData
    })
    console.log(`✅ Catégorie créée: ${categoryData.name}`)
  }

  console.log('🎉 Projets et catégories de test créés avec succès!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })