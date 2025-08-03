import prisma from '../src/lib/prisma';

async function testAPI() {
  console.log('🔍 Test des APIs de la bibliothèque\n');

  // 1. Tester la récupération des catégories
  console.log('📁 Test des catégories:');
  const categories = await prisma.parentCategory.findMany({
    include: {
      subCategories: {
        include: {
          subCategories: true
        },
        orderBy: { displayOrder: 'asc' }
      }
    },
    orderBy: { displayOrder: 'asc' }
  });

  console.log(`- ${categories.length} catégories parentes trouvées`);
  categories.forEach(cat => {
    console.log(`  • ${cat.name} (${cat.subCategories.length} sous-catégories)`);
  });

  // 2. Tester la récupération des ressources
  console.log('\n📚 Test des ressources:');
  const resources = await prisma.resourceLibrary.findMany({
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      category: true,
      subCategory2: {
        include: {
          subCategory1: {
            include: {
              parent: true
            }
          }
        }
      }
    },
    take: 5 // Limiter à 5 pour l'affichage
  });

  console.log(`- ${resources.length} premières ressources:`);
  resources.forEach(res => {
    console.log(`  • ${res.name} - ${res.brand}`);
    if (res.subCategory2) {
      console.log(`    Catégorie: ${res.subCategory2.subCategory1.parent.name} > ${res.subCategory2.subCategory1.name} > ${res.subCategory2.name}`);
    }
  });

  // 3. Vérifier les relations
  console.log('\n🔗 Vérification des relations:');
  const resourceWithoutCategory = await prisma.resourceLibrary.count({
    where: { subCategory2Id: null }
  });
  console.log(`- Ressources sans catégorie hiérarchique: ${resourceWithoutCategory}`);

  const resourceWithCategory = await prisma.resourceLibrary.count({
    where: { subCategory2Id: { not: null } }
  });
  console.log(`- Ressources avec catégorie hiérarchique: ${resourceWithCategory}`);

  await prisma.$disconnect();
}

testAPI();