// scripts/seed-addresses.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Récupérer tous les projets existants
  const projects = await prisma.project.findMany()

  if (projects.length === 0) {
    console.log('❌ Aucun projet trouvé. Lancez d\'abord seed-projects.js')
    return
  }

  // Adresses de test pour chaque projet
  const addressesData = [
    {
      // Villa Moderne
      projectName: 'Villa Moderne',
      delivery: {
        contactName: 'Jean Dupont',
        company: null,
        address: '123 Avenue des Lilas',
        city: 'Lyon',
        zipCode: '69000',
        accessCode: 'A1234',
        floor: null,
        doorCode: '5678',
        instructions: 'Livraison côté jardin. Attention marches étroites. Sonner 2 fois.'
      },
      billing: [
        {
          isDefault: true,
          name: 'Jean et Marie Dupont',
          company: null,
          address: '123 Avenue des Lilas',
          city: 'Lyon',
          zipCode: '69000',
          vatNumber: null,
          siret: null
        }
      ]
    },
    {
      // Appartement Parisien
      projectName: 'Appartement Parisien',
      delivery: {
        contactName: 'Claire Martin',
        company: null,
        address: '45 Rue de Rivoli, Apt 34',
        city: 'Paris',
        zipCode: '75001',
        accessCode: 'B5432',
        floor: '3ème étage',
        doorCode: null,
        instructions: 'Immeuble haussmannien. Ascenseur jusqu\'au 2ème puis 1 étage à pied.'
      },
      billing: [
        {
          isDefault: true,
          name: 'Claire Martin',
          company: 'SARL Martin Consulting',
          address: '12 Boulevard Saint-Germain',
          city: 'Paris',
          zipCode: '75005',
          vatNumber: 'FR12345678901',
          siret: '12345678901234'
        }
      ]
    },
    {
      // Maison Familiale
      projectName: 'Maison Familiale',
      delivery: {
        contactName: 'Carlos Rodriguez',
        company: null,
        address: '78 Chemin des Vignes',
        city: 'Bordeaux',
        zipCode: '33000',
        accessCode: null,
        floor: null,
        doorCode: null,
        instructions: 'Maison individuelle avec portail automatique. Laisser ouvert après livraison.'
      },
      billing: [
        {
          isDefault: true,
          name: 'Carlos Rodriguez',
          company: null,
          address: '78 Chemin des Vignes',
          city: 'Bordeaux',
          zipCode: '33000',
          vatNumber: null,
          siret: null
        },
        {
          isDefault: false,
          name: 'Rodriguez EURL',
          company: 'Rodriguez EURL',
          address: '15 Rue du Commerce',
          city: 'Bordeaux',
          zipCode: '33200',
          vatNumber: 'FR98765432109',
          siret: '98765432109876'
        }
      ]
    },
    {
      // Loft Industriel
      projectName: 'Loft Industriel',
      delivery: {
        contactName: 'Paul Lemaire',
        company: 'Atelier Lemaire',
        address: '12 Rue de l\'Industrie',
        city: 'Lille',
        zipCode: '59000',
        accessCode: '1234',
        floor: 'RDC',
        doorCode: 'B567',
        instructions: 'Ancien atelier rénové. Grande porte bleue. Livraison possible camion.'
      },
      billing: [
        {
          isDefault: true,
          name: 'Atelier Lemaire SARL',
          company: 'Atelier Lemaire SARL',
          address: '12 Rue de l\'Industrie',
          city: 'Lille',
          zipCode: '59000',
          vatNumber: 'FR55666777888',
          siret: '55666777888999'
        }
      ]
    }
  ]

  // Créer les adresses pour chaque projet
  for (const addressData of addressesData) {
    const project = projects.find(p => p.name === addressData.projectName)
    
    if (!project) {
      console.log(`⚠️  Projet "${addressData.projectName}" non trouvé`)
      continue
    }

    // Créer l'adresse de livraison
    await prisma.deliveryAddress.upsert({
      where: { projectId: project.id },
      update: addressData.delivery,
      create: {
        projectId: project.id,
        ...addressData.delivery
      }
    })

    console.log(`✅ Adresse de livraison créée pour ${project.name}`)

    // Créer les adresses de facturation
    for (const billingData of addressData.billing) {
      await prisma.billingAddress.create({
        data: {
          projectId: project.id,
          ...billingData
        }
      })
    }

    console.log(`✅ ${addressData.billing.length} adresse(s) de facturation créée(s) pour ${project.name}`)
  }

  console.log('🎉 Adresses de test créées avec succès!')
  console.log('💡 Les adresses incluent codes d\'accès, instructions et infos fiscales')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })