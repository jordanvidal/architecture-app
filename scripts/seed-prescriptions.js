// scripts/seed-prescriptions.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Récupérer les données nécessaires
  const projects = await prisma.project.findMany()
  const categories = await prisma.prescriptionCategory.findMany()
  const agenceUser = await prisma.user.findUnique({
    where: { email: 'marie.dubois@agence.com' }
  })

  if (!agenceUser) {
    console.log('❌ Utilisateur agence non trouvé')
    return
  }

  console.log(`📋 ${projects.length} projets trouvés`)
  console.log(`🏷️ ${categories.length} catégories trouvées`)

  // Prescriptions pour Villa Moderne
  const villaModerne = projects.find(p => p.name === 'Villa Moderne')
  if (villaModerne) {
    // Créer quelques espaces pour ce projet
    const salon = await prisma.space.upsert({
      where: { 
        id: 'temp-salon-id' // On va utiliser findFirst puis create
      },
      update: {},
      create: {
        projectId: villaModerne.id,
        name: 'Salon',
        type: 'SALON',
        surfaceM2: 35.5
      }
    }).catch(async () => {
      // Si l'upsert échoue, on fait findFirst puis create
      const existingSalon = await prisma.space.findFirst({
        where: { 
          projectId: villaModerne.id,
          name: 'Salon'
        }
      })
      
      if (existingSalon) {
        return existingSalon
      } else {
        return await prisma.space.create({
          data: {
            projectId: villaModerne.id,
            name: 'Salon',
            type: 'SALON',
            surfaceM2: 35.5
          }
        })
      }
    })

    const cuisine = await prisma.space.upsert({
      where: { 
        id: 'temp-cuisine-id'
      },
      update: {},
      create: {
        projectId: villaModerne.id,
        name: 'Cuisine',
        type: 'CUISINE',
        surfaceM2: 18.2
      }
    }).catch(async () => {
      const existingCuisine = await prisma.space.findFirst({
        where: { 
          projectId: villaModerne.id,
          name: 'Cuisine'
        }
      })
      
      if (existingCuisine) {
        return existingCuisine
      } else {
        return await prisma.space.create({
          data: {
            projectId: villaModerne.id,
            name: 'Cuisine',
            type: 'CUISINE',
            surfaceM2: 18.2
          }
        })
      }
    })

    console.log(`✅ Espaces créés pour ${villaModerne.name}`)

    // Prescriptions de test
    const prescriptions = [
      {
        name: 'Canapé d\'angle modulable OSAKA',
        description: 'Canapé d\'angle modulable en tissu gris anthracite, structure bois massif',
        spaceId: salon.id,
        categoryId: categories.find(c => c.name === 'mobilier')?.id,
        brand: 'BoConcept',
        reference: 'OSAKA-001-GREY',
        productUrl: 'https://www.boconcept.com/fr-fr/osaka/osaka-sofa',
        quantity: 1,
        unitPrice: 2450.00,
        totalPrice: 2450.00,
        supplier: 'BoConcept Lyon Part-Dieu',
        status: 'VALIDE',
        notes: 'Livraison prévue fin mai. Couleur gris anthracite validée par les clients lors de la réunion du 15/03. Prévoir protection lors de la livraison (escalier étroit).',
        validatedAt: new Date('2024-03-20')
      },
      {
        name: 'Table basse marbre Calacatta',
        description: 'Table basse en marbre Calacatta avec pieds en acier noir mat',
        spaceId: salon.id,
        categoryId: categories.find(c => c.name === 'mobilier')?.id,
        brand: 'West Elm',
        reference: 'MARBLE-CT-001',
        productUrl: 'https://www.westelm.com/marble-coffee-table',
        quantity: 1,
        unitPrice: 890.00,
        totalPrice: 890.00,
        supplier: 'West Elm France',
        status: 'EN_COURS',
        notes: 'Attente validation client pour la finition des pieds (noir mat vs chrome).'
      },
      {
        name: 'Suspension LED Tolomeo',
        description: 'Suspension design LED dimmable, finition aluminium',
        spaceId: salon.id,
        categoryId: categories.find(c => c.name === 'eclairage')?.id,
        brand: 'Artemide',
        reference: 'TOLOMEO-SOSPENSIONE-LED',
        productUrl: 'https://www.artemide.com/tolomeo-sospensione',
        quantity: 2,
        unitPrice: 380.00,
        totalPrice: 760.00,
        supplier: 'Luminaires Plus',
        status: 'COMMANDE',
        notes: 'Commande passée le 25/03. Délai de livraison 4-6 semaines.',
        orderedAt: new Date('2024-03-25')
      },
      {
        name: 'Tapis berbère 200x300',
        description: 'Tapis berbère fait main, laine naturelle, motifs géométriques',
        spaceId: salon.id,
        categoryId: categories.find(c => c.name === 'textile')?.id,
        brand: 'Benuta',
        reference: 'BERBER-GEO-200300',
        quantity: 1,
        unitPrice: 650.00,
        totalPrice: 650.00,
        supplier: 'Benuta France',
        status: 'LIVRE',
        notes: 'Livré et posé. Client très satisfait de la qualité.',
        orderedAt: new Date('2024-02-15'),
        deliveredAt: new Date('2024-03-10')
      },
      {
        name: 'Îlot central sur mesure',
        description: 'Îlot de cuisine sur mesure, plan de travail quartz, façades laquées',
        spaceId: cuisine.id,
        categoryId: categories.find(c => c.name === 'mobilier')?.id,
        brand: 'Schmidt',
        reference: 'ILOT-CUSTOM-001',
        quantity: 1,
        unitPrice: 4200.00,
        totalPrice: 4200.00,
        supplier: 'Schmidt Lyon',
        status: 'EN_COURS',
        notes: 'Mesures prises. Plans en cours de validation. Installation prévue fin avril.'
      },
      {
        name: 'Spots encastrés LED',
        description: 'Spots LED encastrés dimmables, blanc chaud 3000K',
        spaceId: cuisine.id,
        categoryId: categories.find(c => c.name === 'eclairage')?.id,
        brand: 'Philips',
        reference: 'HUE-DOWNLIGHT-3000K',
        quantity: 8,
        unitPrice: 45.00,
        totalPrice: 360.00,
        supplier: 'Philips Pro',
        status: 'VALIDE',
        notes: 'Compatible avec système Philips Hue existant.',
        validatedAt: new Date('2024-03-18')
      }
    ]

    // Créer les prescriptions
    for (const prescData of prescriptions) {
      if (prescData.categoryId) {
        await prisma.prescription.create({
          data: {
            ...prescData,
            projectId: villaModerne.id,
            createdBy: agenceUser.id
          }
        })
        console.log(`✅ Prescription créée: ${prescData.name}`)
      }
    }
  }

  // Quelques prescriptions pour Appartement Parisien
  const appartParis = projects.find(p => p.name === 'Appartement Parisien')
  if (appartParis) {
    const salon = await prisma.space.findFirst({
      where: { 
        projectId: appartParis.id,
        name: 'Salon'
      }
    }) || await prisma.space.create({
      data: {
        projectId: appartParis.id,
        name: 'Salon',
        type: 'SALON',
        surfaceM2: 28.0
      }
    })

    const prescriptions = [
      {
        name: 'Canapé 3 places velours',
        description: 'Canapé 3 places en velours bleu nuit, pieds dorés',
        spaceId: salon.id,
        categoryId: categories.find(c => c.name === 'mobilier')?.id,
        brand: 'Made.com',
        reference: 'VELVET-NAVY-3S',
        quantity: 1,
        unitPrice: 1200.00,
        totalPrice: 1200.00,
        supplier: 'Made.com',
        status: 'COMMANDE',
        notes: 'Livraison prévue mi-avril. Vérifier l\'accès (3e étage sans ascenseur).',
        orderedAt: new Date('2024-03-20')
      },
      {
        name: 'Lustre cristal vintage',
        description: 'Lustre en cristal style vintage, 12 bras, compatible LED',
        spaceId: salon.id,
        categoryId: categories.find(c => c.name === 'eclairage')?.id,
        brand: 'Maisons du Monde',
        reference: 'CRYSTAL-VINTAGE-12',
        quantity: 1,
        unitPrice: 580.00,
        totalPrice: 580.00,
        supplier: 'Maisons du Monde',
        status: 'EN_COURS',
        notes: 'Vérification de la charge au plafond nécessaire (poids : 8kg).'
      }
    ]

    for (const prescData of prescriptions) {
      if (prescData.categoryId) {
        await prisma.prescription.create({
          data: {
            ...prescData,
            projectId: appartParis.id,
            createdBy: agenceUser.id
          }
        })
        console.log(`✅ Prescription créée: ${prescData.name}`)
      }
    }
  }

  console.log('\n🎉 Prescriptions de test créées avec succès!')
  
  // Statistiques
  const totalPrescriptions = await prisma.prescription.count()
  console.log(`📊 Total prescriptions en base: ${totalPrescriptions}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })