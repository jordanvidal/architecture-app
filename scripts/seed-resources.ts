import prisma from '../src/lib/prisma';

const fakeResources = [
  // REVÊTEMENT > SOL
  {
    name: 'Parquet Chêne Massif Versailles',
    brand: 'Panaget',
    reference: 'VERSAILLES-14-CHE',
    description: 'Parquet chêne massif point de Hongrie, finition huilée naturelle',
    price: 125.50,
    pricePro: 95.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    productUrl: 'https://panaget.com/parquet-versailles',
    supplier: 'Panaget Paris',
    countryOrigin: 'France',
    categoryPath: ['REVÊTEMENT', 'SOL', 'Parquet']
  },
  {
    name: 'Carrelage Marbre Calacatta Gold',
    brand: 'Marazzi',
    reference: 'CALACATTA-60X120',
    description: 'Grès cérame effet marbre Calacatta, finition polie',
    price: 89.90,
    pricePro: 68.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1564540579594-0930edb6de43?w=800',
    productUrl: 'https://marazzi.com/calacatta',
    supplier: 'Marazzi France',
    countryOrigin: 'Italie',
    categoryPath: ['REVÊTEMENT', 'SOL', 'Marbre']
  },
  {
    name: 'Moquette Bouclée Pure Laine',
    brand: 'Balsan',
    reference: 'PURE-WOOL-850',
    description: 'Moquette 100% pure laine vierge, classement feu M3',
    price: 65.00,
    pricePro: 48.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1565125767132-34ba0a5f3f2e?w=800',
    supplier: 'Balsan Pro',
    countryOrigin: 'France',
    categoryPath: ['REVÊTEMENT', 'SOL', 'Moquette']
  },

  // REVÊTEMENT > MUR
  {
    name: 'Papier Peint Panoramique Forêt Tropicale',
    brand: 'Pierre Frey',
    reference: 'JUNGLE-DREAM-01',
    description: 'Papier peint panoramique sur mesure, impression numérique',
    price: 380.00,
    pricePro: 285.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?w=800',
    productUrl: 'https://pierrefrey.com/jungle-dream',
    supplier: 'Pierre Frey Paris',
    countryOrigin: 'France',
    categoryPath: ['REVÊTEMENT', 'MUR', 'Papier-peint']
  },
  {
    name: 'Enduit Décoratif Tadelakt',
    brand: 'Mercadier',
    reference: 'TADELAKT-GRIS-PERLE',
    description: 'Enduit à la chaux traditionnel marocain, finition cirée',
    price: 45.00,
    pricePro: 32.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800',
    supplier: 'Mercadier',
    countryOrigin: 'France',
    categoryPath: ['REVÊTEMENT', 'MUR', 'Peinture & Enduit décoratif']
  },

  // LUMINAIRE > PLAFOND
  {
    name: 'Suspension Vertigo Large',
    brand: 'Petite Friture',
    reference: 'VERTIGO-L-BLACK',
    description: 'Suspension iconique en fibre de verre et polyuréthane, Ø200cm',
    price: 790.00,
    pricePro: 632.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800',
    productUrl: 'https://petitefriture.com/vertigo',
    supplier: 'Petite Friture',
    countryOrigin: 'France',
    categoryPath: ['LUMINAIRE', 'PLAFOND', 'Suspensions']
  },
  {
    name: 'Lustre Cristal Baccarat',
    brand: 'Baccarat',
    reference: 'ZENITH-24L',
    description: 'Lustre 24 lumières en cristal taillé main',
    price: 28500.00,
    pricePro: 22800.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    productUrl: 'https://baccarat.com/zenith',
    supplier: 'Baccarat Paris',
    countryOrigin: 'France',
    categoryPath: ['LUMINAIRE', 'PLAFOND', 'Lustre']
  },
  {
    name: 'Plafonnier Skygarden',
    brand: 'Flos',
    reference: 'SKYGARDEN-S2-WHITE',
    description: 'Plafonnier design Marcel Wanders, plâtre et aluminium',
    price: 1650.00,
    pricePro: 1320.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1524358375462-b9d99fd20e8f?w=800',
    productUrl: 'https://flos.com/skygarden',
    supplier: 'Flos France',
    countryOrigin: 'Italie',
    categoryPath: ['LUMINAIRE', 'PLAFOND', 'Plafonnier']
  },

  // LUMINAIRE > MUR
  {
    name: 'Applique Lampe Gras N°304',
    brand: 'DCW Editions',
    reference: 'GRAS-304-BLACK',
    description: 'Applique murale orientable design Le Corbusier',
    price: 395.00,
    pricePro: 316.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800',
    productUrl: 'https://dcw-editions.com/lampe-gras-304',
    supplier: 'DCW Editions',
    countryOrigin: 'France',
    categoryPath: ['LUMINAIRE', 'MUR', 'Appliques murales']
  },

  // SALLE D'EAU > ROBINETTERIE
  {
    name: 'Robinet Lavabo Axor Starck',
    brand: 'Hansgrohe',
    reference: 'AXOR-STARCK-250',
    description: 'Mitigeur lavabo design Philippe Starck, finition chromée',
    price: 580.00,
    pricePro: 435.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    productUrl: 'https://hansgrohe.com/axor-starck',
    supplier: 'Hansgrohe France',
    countryOrigin: 'Allemagne',
    categoryPath: ["SALLE D'EAU", 'ROBINETTERIE', 'Robinetterie pour lavabo']
  },
  {
    name: 'Robinetterie Douche Thermostatique',
    brand: 'Grohe',
    reference: 'RAINSHOWER-310',
    description: 'Système de douche avec douche de tête 310mm et douchette',
    price: 1250.00,
    pricePro: 937.50,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800',
    productUrl: 'https://grohe.com/rainshower',
    supplier: 'Grohe Professional',
    countryOrigin: 'Allemagne',
    categoryPath: ["SALLE D'EAU", 'ROBINETTERIE', 'Robinetterie pour douche']
  },

  // SALLE D'EAU > SANITAIRES
  {
    name: 'Vasque à Poser Marble',
    brand: 'Antonio Lupi',
    reference: 'SOLIDEA-MARBLE',
    description: 'Vasque monobloc en marbre de Carrare',
    price: 2850.00,
    pricePro: 2280.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800',
    productUrl: 'https://antoniolupi.com/solidea',
    supplier: 'Antonio Lupi Design',
    countryOrigin: 'Italie',
    categoryPath: ["SALLE D'EAU", 'SANITAIRES', 'Vasque']
  },

  // ELECTRICITÉ & APPAREILS > ELECTROMENAGER
  {
    name: 'Réfrigérateur Intégrable',
    brand: 'Liebherr',
    reference: 'ICBP-3266',
    description: 'Réfrigérateur combiné BioFresh Professional, classe A+++',
    price: 3490.00,
    pricePro: 2792.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',
    productUrl: 'https://liebherr.com/icbp-3266',
    supplier: 'Liebherr France',
    countryOrigin: 'Allemagne',
    categoryPath: ['ELECTRICITÉ & APPAREILS', 'ELECTROMENAGER', 'Réfrigérateur']
  },
  {
    name: 'Four Vapeur Combiné',
    brand: 'Miele',
    reference: 'DGC-7865',
    description: 'Four vapeur combiné XL avec sonde de cuisson',
    price: 4890.00,
    pricePro: 3912.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    productUrl: 'https://miele.com/dgc-7865',
    supplier: 'Miele Professional',
    countryOrigin: 'Allemagne',
    categoryPath: ['ELECTRICITÉ & APPAREILS', 'ELECTROMENAGER', 'Four']
  },

  // MENUISERIE & STAFF > PORTE
  {
    name: 'Porte Invisible Syntesis Line',
    brand: 'Eclisse',
    reference: 'SYNTESIS-LINE-DF',
    description: 'Porte affleurante invisible, double face laquée',
    price: 890.00,
    pricePro: 712.00,
    type: 'INTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800',
    productUrl: 'https://eclisse.com/syntesis',
    supplier: 'Eclisse France',
    countryOrigin: 'Italie',
    categoryPath: ['MENUISERIE & STAFF', 'PORTE', 'Intérieur']
  },

  // JARDIN - EXTÉRIEUR
  {
    name: 'Pergola Bioclimatique',
    brand: 'Biossun',
    reference: 'PERGOLA-BIO-600',
    description: 'Pergola aluminium à lames orientables 6x4m',
    price: 18500.00,
    pricePro: 14800.00,
    type: 'EXTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    productUrl: 'https://biossun.com/pergola',
    supplier: 'Biossun',
    countryOrigin: 'France',
    categoryPath: ['MENUISERIE & STAFF', 'FENETRE', 'Store']
  },
  {
    name: 'Mobilier Jardin Teck',
    brand: 'Tribu',
    reference: 'NATAL-ALU-TEAK',
    description: 'Ensemble salon de jardin aluminium et teck 8 places',
    price: 7850.00,
    pricePro: 6280.00,
    type: 'EXTERIEUR',
    imageUrl: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800',
    productUrl: 'https://tribu.com/natal',
    supplier: 'Tribu Outdoor',
    countryOrigin: 'Belgique',
    categoryPath: ['MENUISERIE & STAFF', 'RANGEMENT', 'Étagère']
  }
];

async function seedResources() {
  console.log('🚀 Début de l\'ajout des ressources de test...');

  try {
    // Récupérer un utilisateur existant (ou en créer un de test)
    let user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé. Veuillez vous connecter d\'abord.');
      return;
    }

    console.log(`✅ Utilisation de l'utilisateur: ${user.email}`);

    // Récupérer ou créer les catégories PrescriptionCategory de base
    const categoryMapping: { [key: string]: string } = {
      'REVÊTEMENT': 'revetement',
      'LUMINAIRE': 'eclairage',
      "SALLE D'EAU": 'salle-de-bain',
      'ELECTRICITÉ & APPAREILS': 'electricite',
      'MENUISERIE & STAFF': 'menuiserie'
    };

    const prescriptionCategories: { [key: string]: any } = {};
    
    for (const [name, slug] of Object.entries(categoryMapping)) {
      let cat = await prisma.prescriptionCategory.findFirst({
        where: { name: { contains: slug, mode: 'insensitive' } }
      });
      
      if (!cat) {
        cat = await prisma.prescriptionCategory.create({
          data: {
            name: slug,
            description: `Catégorie ${name}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      prescriptionCategories[name] = cat;
    }

    // Ajouter les ressources
    for (const resourceData of fakeResources) {
      const [parentName, sub1Name, sub2Name] = resourceData.categoryPath;
      
      // Trouver les catégories hiérarchiques
      const parentCategory = await prisma.parentCategory.findUnique({
        where: { name: parentName }
      });
      
      if (!parentCategory) {
        console.log(`⚠️  Catégorie parent "${parentName}" non trouvée, ressource ignorée`);
        continue;
      }
      
      const subCategory1 = await prisma.subCategory1.findFirst({
        where: {
          name: sub1Name,
          parentId: parentCategory.id
        }
      });
      
      if (!subCategory1) {
        console.log(`⚠️  Sous-catégorie 1 "${sub1Name}" non trouvée, ressource ignorée`);
        continue;
      }
      
      const subCategory2 = await prisma.subCategory2.findFirst({
        where: {
          name: sub2Name,
          subCategory1Id: subCategory1.id
        }
      });
      
      if (!subCategory2) {
        console.log(`⚠️  Sous-catégorie 2 "${sub2Name}" non trouvée, ressource ignorée`);
        continue;
      }
      
      // Créer la ressource
      const resource = await prisma.resourceLibrary.create({
        data: {
          name: resourceData.name,
          brand: resourceData.brand,
          reference: resourceData.reference,
          description: resourceData.description,
          price: resourceData.price,
          pricePro: resourceData.pricePro,
          type: resourceData.type as any,
          imageUrl: resourceData.imageUrl,
          mainImageUrl: resourceData.imageUrl,
          productUrl: resourceData.productUrl,
          supplier: resourceData.supplier,
          countryOrigin: resourceData.countryOrigin,
          subCategory2Id: subCategory2.id,
          categoryId: prescriptionCategories[parentName].id,
          createdBy: user.id,
          images: [],
          tags: [],
          categoryPath: resourceData.categoryPath,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Ressource créée: ${resource.name}`);
    }
    
    console.log('\n✅ Import des ressources de test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import
seedResources();