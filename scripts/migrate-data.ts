// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateData() {
  console.log('🔄 Début de la migration des données...')

  try {
    // 1. Migrer les emails clients (client_email → clientEmails[])
    console.log('\n📧 Migration des emails clients...')
    const projects = await prisma.project.findMany()

    let emailsMigrated = 0
    
    for (const project of projects) {
      // Vérifier si le projet a un client_email mais pas encore de clientEmails
      if (project.client_email && (!project.clientEmails || project.clientEmails.length === 0)) {
        await prisma.project.update({
          where: { id: project.id },
          data: { 
            clientEmails: [project.client_email]
          }
        })
        emailsMigrated++
        console.log(`  ✓ Projet "${project.name}" - email migré`)
      }
    }
    console.log(`- ${emailsMigrated} emails migrés`)

    // 2. Créer des contacts depuis les fournisseurs existants
    console.log('\n👥 Création des contacts fournisseurs...')
    const uniqueSuppliers = await prisma.resource_library.findMany({
      where: { supplier: { not: null } },
      select: { supplier: true },
      distinct: ['supplier']
    })

    const defaultUser = await prisma.User.findFirst()
    let contactsCreated = 0
    
    if (defaultUser) {
      for (const { supplier } of uniqueSuppliers) {
        if (supplier) {
          try {
            await prisma.contacts.create({
              data: {
                name: supplier,
                company: supplier,
                contactType: 'FOURNISSEUR',
                isSupplier: true,
                created_by: defaultUser.id
              }
            })
            contactsCreated++
            console.log(`  ✓ Contact créé : ${supplier}`)
          } catch (error) {
            // Contact existe déjà, on continue
          }
        }
      }
    }
    console.log(`- ${contactsCreated} nouveaux contacts créés`)

    // 3. Afficher les infos sur les prix
    console.log('\n💰 Analyse des prix...')
    const resourcesWithPriceMin = await prisma.resource_library.count({
      where: { priceMin: { not: null } }
    })
    const resourcesWithPriceMax = await prisma.resource_library.count({
      where: { priceMax: { not: null } }
    })
    
    console.log(`- ${resourcesWithPriceMin} ressources avec priceMin`)
    console.log(`- ${resourcesWithPriceMax} ressources avec priceMax`)
    console.log('  → Pour migrer les prix, il faudra ajouter le champ "price" dans le schéma Prisma')

    // 4. Stats finales
    console.log('\n✅ Migration terminée !')
    console.log('\n📊 Résumé :')
    
    const stats = {
      projets: await prisma.project.count(),
      projetAvecEmails: await prisma.project.count({ 
        where: { clientEmails: { isEmpty: false } } 
      }),
      ressources: await prisma.resource_library.count(),
      contacts: await prisma.contacts.count(),
      prescriptions: await prisma.prescriptions.count(),
      espaces: await prisma.spaces.count()
    }
    
    console.log(`- ${stats.projets} projets total (${stats.projetAvecEmails} avec emails migrés)`)
    console.log(`- ${stats.ressources} ressources dans la bibliothèque`)
    console.log(`- ${stats.contacts} contacts`)
    console.log(`- ${stats.prescriptions} prescriptions`)
    console.log(`- ${stats.espaces} espaces`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
migrateData()
  .then(() => {
    console.log('\n🎉 Migration réussie !')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Échec de la migration:', error)
    process.exit(1)
  })