import prisma from '../src/lib/prisma';

const categories = [
  {
    parent: 'REVÊTEMENT',
    sub1: 'SOL',
    sub2: ['Parquet', 'Moquette', 'Marbre', 'Carrelage', 'Autre']
  },
  {
    parent: 'REVÊTEMENT',
    sub1: 'MUR',
    sub2: ['Marbre', 'Carrelage', 'Papier-peint', 'Peinture & Enduit décoratif', 'Autre']
  },
  {
    parent: 'LUMINAIRE',
    sub1: 'SOL',
    sub2: ['Lampe de table', 'Lampadaire', 'Spot au sol', 'Abat-jour', 'Ampoules']
  },
  {
    parent: 'LUMINAIRE',
    sub1: 'MUR',
    sub2: ['Appliques murales', 'Balisage', 'Abat-jour', 'Ampoules']
  },
  {
    parent: 'LUMINAIRE',
    sub1: 'PLAFOND',
    sub2: ['Suspensions', 'Lustre', 'Plafonnier', 'Spot encastrable', 'Spot sur rails', 'Projecteur', 'Abat-jour', 'Ampoules']
  },
  {
    parent: "SALLE D'EAU",
    sub1: 'ROBINETTERIE',
    sub2: ['Robinetterie pour lavabo', 'Robinetterie pour baignoire', 'Robinetterie pour douche', 'Accessoire']
  },
  {
    parent: "SALLE D'EAU",
    sub1: 'BAIN',
    sub2: ['Baignoire en ilot', 'Baignoire encastrée', 'Petite baignoire', 'Grande baignoire', 'Pare-bain']
  },
  {
    parent: "SALLE D'EAU",
    sub1: 'DOUCHE',
    sub2: ['Porte de douche', 'Receveur de douche', 'Accessoires']
  },
  {
    parent: "SALLE D'EAU",
    sub1: 'SANITAIRES',
    sub2: ['Lavabo', 'Vasque', 'Lave-main', 'Bidet', 'Toilette', 'Abattant', 'Plaque de déclanchement']
  },
  {
    parent: "SALLE D'EAU",
    sub1: 'LUMINAIRES & ACCESSOIRE',
    sub2: ['Luminaire', 'Miroir', 'Sèche-serviette', 'Accessoire']
  },
  {
    parent: "SALLE D'EAU",
    sub1: 'REVETEMENT',
    sub2: ['Carrelage', 'Marbre', 'Peinture & Enduit décoratif']
  },
  {
    parent: 'ELECTRICITÉ & APPAREILS',
    sub1: 'INTERRUPTEUR & PRISE',
    sub2: ['Par Marque', 'Par Gamme', 'Par Finition']
  },
  {
    parent: 'ELECTRICITÉ & APPAREILS',
    sub1: 'AUDIO VIDEO',
    sub2: ['TV', 'Ecran', 'Vidéoprojecteur', 'Enceinte']
  },
  {
    parent: 'ELECTRICITÉ & APPAREILS',
    sub1: 'ELECTROMENAGER',
    sub2: ['Lave-Linge', 'Sèche-linge', 'Lave-vaisselle', 'Réfrigirateur', 'Congélateur', 'Cave à vin', 'Four', 'Micro-onde', 'Plaque de cuisson', 'Hotte aspirante', 'Cuisinière']
  },
  {
    parent: 'ELECTRICITÉ & APPAREILS',
    sub1: 'CVC',
    sub2: ['Chauffage', 'Ventilation', 'Climatisation']
  },
  {
    parent: 'MENUISERIE & STAFF',
    sub1: 'PORTE',
    sub2: ['Intérieur', 'Extérieur']
  },
  {
    parent: 'MENUISERIE & STAFF',
    sub1: 'RANGEMENT',
    sub2: ['Placard', 'Dressing', 'Étagère']
  },
  {
    parent: 'MENUISERIE & STAFF',
    sub1: 'MOULURE',
    sub2: ['Corniche', 'Cimaise', 'Plinthe', 'Element décoratif']
  },
  {
    parent: 'MENUISERIE & STAFF',
    sub1: 'FENETRE',
    sub2: ['Fenêtre', 'Volet', 'Store']
  },
  {
    parent: 'MENUISERIE & STAFF',
    sub1: 'FINITION',
    sub2: ['Budget €', 'Budget €€', 'Budget €€€+']
  }
];

async function importCategories() {
  console.log('🚀 Début de l\'import des catégories...');

  try {
    // Supprimer les catégories existantes
    await prisma.subCategory2.deleteMany();
    await prisma.subCategory1.deleteMany();
    await prisma.parentCategory.deleteMany();
    console.log('✅ Catégories existantes supprimées');

    let parentOrder = 0;
    const parentMap = new Map<string, string>();

    for (const categoryGroup of categories) {
      // Créer ou récupérer la catégorie parent
      let parentId = parentMap.get(categoryGroup.parent);
      
      if (!parentId) {
        const parent = await prisma.parentCategory.create({
          data: {
            name: categoryGroup.parent,
            displayOrder: parentOrder++
          }
        });
        parentId = parent.id;
        parentMap.set(categoryGroup.parent, parent.id);
        console.log(`✅ Catégorie parent créée: ${categoryGroup.parent}`);
      }

      // Créer la sous-catégorie 1
      const sub1 = await prisma.subCategory1.create({
        data: {
          name: categoryGroup.sub1,
          parentId: parentId,
          displayOrder: 0
        }
      });
      console.log(`  ✅ Sous-catégorie 1 créée: ${categoryGroup.sub1}`);

      // Créer les sous-catégories 2
      let sub2Order = 0;
      for (const sub2Name of categoryGroup.sub2) {
        await prisma.subCategory2.create({
          data: {
            name: sub2Name,
            subCategory1Id: sub1.id,
            displayOrder: sub2Order++
          }
        });
        console.log(`    ✅ Sous-catégorie 2 créée: ${sub2Name}`);
      }
    }

    // Compter le total
    const totalParents = await prisma.parentCategory.count();
    const totalSub1 = await prisma.subCategory1.count();
    const totalSub2 = await prisma.subCategory2.count();

    console.log('\n📊 Résumé de l\'import:');
    console.log(`- ${totalParents} catégories parentes`);
    console.log(`- ${totalSub1} sous-catégories niveau 1`);
    console.log(`- ${totalSub2} sous-catégories niveau 2`);
    console.log('\n✅ Import terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import
importCategories();