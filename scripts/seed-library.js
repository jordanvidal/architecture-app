// scripts/seed-library.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('📚 Création de la bibliothèque de ressources...\n')

  // Récupérer l'utilisateur agence et les catégories
  const agenceUser = await prisma.User.findUnique({
    where: { email: 'marie.dubois@agence.com' }
  })

  if (!agenceUser) {
    console.log('❌ Utilisateur agence non trouvé')
    return
  }

  const categories = await prisma.prescriptionsCategory.findMany()
  console.log(`📋 ${categories.length} catégories trouvées`)

  // Produits de test par catégorie
  const libraryProducts = [
    // MOBILIER
    {
      name: 'Canapé d\'angle KIVIK',
      description: 'Canapé d\'angle modulable en tissu, très confortable pour espaces familiaux',
      categoryName: 'mobilier',
      brand: 'IKEA',
      reference: 'KIVIK-ANGLE-3PL',
      productUrl: 'https://www.ikea.com/fr/fr/p/kivik-canape-angle-hillared-anthracite-s59367408/',
      priceMin: 899,
      priceMax: 899,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['canapé', 'angle', 'modulable', 'familial']
    },
    {
      name: 'Table basse STOCKHOLM',
      description: 'Table basse ronde en bois de noyer, design scandinave intemporel',
      categoryName: 'mobilier',
      brand: 'IKEA',
      reference: 'STOCKHOLM-TB-NOYER',
      productUrl: 'https://www.ikea.com/fr/fr/p/stockholm-table-basse-plaque-noyer-70340977/',
      priceMin: 299,
      priceMax: 299,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['table basse', 'bois', 'scandinave', 'ronde']
    },
    {
      name: 'Fauteuil STRANDMON',
      description: 'Fauteuil à oreilles classique, parfait pour un coin lecture cosy',
      categoryName: 'mobilier',
      brand: 'IKEA',
      reference: 'STRANDMON-SKIFTEBO-JAUNE',
      productUrl: 'https://www.ikea.com/fr/fr/p/strandmon-fauteuil-a-oreilles-skiftebo-jaune-90377287/',
      priceMin: 279,
      priceMax: 279,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['fauteuil', 'lecture', 'classique', 'cosy']
    },

    // ÉCLAIRAGE
    {
      name: 'Suspension FOTO',
      description: 'Suspension design en aluminium, éclairage dirigé idéal pour îlot de cuisine',
      categoryName: 'eclairage',
      brand: 'IKEA',
      reference: 'FOTO-PENDANT-ALU',
      productUrl: 'https://www.ikea.com/fr/fr/p/foto-suspension-aluminium-90416936/',
      priceMin: 45,
      priceMax: 45,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['suspension', 'cuisine', 'aluminium', 'moderne']
    },
    {
      name: 'Lampadaire HOLMÖ',
      description: 'Lampadaire en papier de riz, lumière douce et tamisée pour ambiance zen',
      categoryName: 'eclairage',
      brand: 'IKEA',
      reference: 'HOLMO-FLOOR-LAMP',
      productUrl: 'https://www.ikea.com/fr/fr/p/holmo-lampadaire-blanc-10416934/',
      priceMin: 39,
      priceMax: 39,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['lampadaire', 'papier', 'zen', 'tamisé']
    },

    // DÉCORATION
    {
      name: 'Miroir STOCKHOLM',
      description: 'Grand miroir rond avec cadre en frêne, pièce maîtresse décorative',
      categoryName: 'decoration',
      brand: 'IKEA',
      reference: 'STOCKHOLM-MIRROR-80CM',
      productUrl: 'https://www.ikea.com/fr/fr/p/stockholm-miroir-plaque-frene-60340978/',
      priceMin: 149,
      priceMax: 149,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['miroir', 'rond', 'frêne', 'grand format']
    },
    {
      name: 'Plante MONSTERA',
      description: 'Grande plante d\'intérieur tropicale, apporte une touche de verdure naturelle',
      categoryName: 'decoration',
      brand: 'IKEA',
      reference: 'MONSTERA-DELICIOSA-21CM',
      productUrl: 'https://www.ikea.com/fr/fr/p/monstera-deliciosa-plante-21-cm-40340979/',
      priceMin: 29,
      priceMax: 29,
      supplier: 'IKEA France',
      availability: 'Selon saison',
      imageUrl: 'https://images.unsplash.com/photo-1463154545680-d59320fd685d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['plante', 'tropicale', 'monstera', 'verdure']
    },

    // TEXTILE
    {
      name: 'Tapis STOCKHOLM',
      description: 'Tapis tissé à la main en laine, motifs géométriques contemporains',
      categoryName: 'textile',
      brand: 'IKEA',
      reference: 'STOCKHOLM-TAPIS-170X240',
      productUrl: 'https://www.ikea.com/fr/fr/p/stockholm-tapis-tisse-a-plat-fait-main-motif-en-reseau-gris-fonce-20340976/',
      priceMin: 399,
      priceMax: 399,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['tapis', 'laine', 'géométrique', 'fait main']
    },
    {
      name: 'Coussins GURLI',
      description: 'Set de coussins en coton bio, différentes couleurs disponibles',
      categoryName: 'textile',
      brand: 'IKEA',
      reference: 'GURLI-CUSHION-50X50',
      productUrl: 'https://www.ikea.com/fr/fr/p/gurli-housse-de-coussin-blanc-casse-80340975/',
      priceMin: 12,
      priceMax: 18,
      supplier: 'IKEA France',
      availability: 'En stock',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tags: ['coussins', 'coton bio', 'modulable', 'couleurs']
    }
  ]

  // Créer les produits
  for (const productData of libraryProducts) {
    const category = categories.find(c => c.name === productData.categoryName)
    
    if (!category) {
      console.log(`❌ Catégorie "${productData.categoryName}" non trouvée pour ${productData.name}`)
      continue
    }

    const resource = await prisma.resource_library.create({
      data: {
        name: productData.name,
        description: productData.description,
        categoryId: category.id,
        brand: productData.brand,
        reference: productData.reference,
        productUrl: productData.productUrl,
        priceMin: productData.priceMin,
        priceMax: productData.priceMax,
        supplier: productData.supplier,
        availability: productData.availability,
        imageUrl: productData.imageUrl,
        tags: productData.tags,
        created_by: agenceUser.id
      }
    })

    console.log(`✅ ${productData.name} ajouté à la bibliothèque`)
  }

  console.log(`\n🎉 ${libraryProducts.length} produits ajoutés à la bibliothèque!`)
  console.log('📊 Répartition par catégorie:')
  
  const stats = await prisma.prescriptionsCategory.findMany({
    include: {
      _count: {
        select: { resources: true }
      }
    }
  })

  stats.forEach(cat => {
    if (cat._count.resources > 0) {
      console.log(`   ${cat.icon} ${cat.name}: ${cat._count.resources} produits`)
    }
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