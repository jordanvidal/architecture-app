// scripts/add-project-data.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('📝 Ajout des données projet...')

  // Trouver le premier projet
  const projects = await prisma.project.findMany({
    take: 1,
    orderBy: { created_at: 'desc' }
  })

  if (projects.length === 0) {
    console.log('❌ Aucun projet trouvé')
    return
  }

  const project = projects[0]

  // Ajouter adresse et infos
  await prisma.project.update({
    where: { id: project.id },
    data: {
      address: '15 Rue de la Paix, 75001 Paris',
      start_date: new Date('2024-01-15'),
      delivery_contact_name: 'Marie Dupont',
      delivery_company: 'Design Studio',
      delivery_address: '15 Rue de la Paix',
      delivery_city: 'Paris',
      delivery_zip_code: '75001',
      delivery_country: 'France',
      delivery_access_code: 'A1234',
      delivery_floor: '3ème étage',
      delivery_door_code: 'B5678',
      delivery_instructions: 'Sonner à l\'interphone, ascenseur à droite',
      billing_addresses: JSON.stringify([
        {
          id: '1',
          isDefault: true,
          name: 'Facturation principale',
          company: 'Design Studio SARL',
          address: '15 Rue de la Paix',
          city: 'Paris',
          zipCode: '75001',
          country: 'France',
          vatNumber: 'FR12345678901',
          siret: '12345678901234'
        }
      ])
    }
  })

  console.log('✅ Données ajoutées au projet:', project.name)
  console.log('🎯 Cliquez sur ce projet pour voir les nouvelles infos !')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())