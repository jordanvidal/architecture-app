import prisma from '../src/lib/prisma';

async function checkData() {
  const parentCount = await prisma.parentCategory.count();
  const sub1Count = await prisma.subCategory1.count();
  const sub2Count = await prisma.subCategory2.count();
  const resourceCount = await prisma.resourceLibrary.count();
  
  console.log('📊 État de la base de données:');
  console.log(`- Catégories parentes: ${parentCount}`);
  console.log(`- Sous-catégories 1: ${sub1Count}`);
  console.log(`- Sous-catégories 2: ${sub2Count}`);
  console.log(`- Ressources: ${resourceCount}`);
  
  await prisma.$disconnect();
}

checkData();
