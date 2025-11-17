import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const variant = await prisma.productVariant.findFirst({
    where: {
      isActive: true,
      stock: { gt: 0 },
    },
    select: {
      id: true,
      productId: true,
      color: true,
      storage: true,
      price: true,
      stock: true,
    },
  });

  console.log(JSON.stringify(variant, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
