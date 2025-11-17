import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting inventory seed...');

  // Get first product
  const product = await prisma.product.findFirst({
    where: { slug: 'iphone-15-pro-max' },
  });

  if (!product) {
    console.log('Product not found');
    return;
  }

  console.log(`Found product: ${product.name}`);

  // Create variants for iPhone 15 Pro Max
  const variants = [
    {
      productId: product.id,
      color: 'Titan Tự Nhiên',
      colorCode: '#8B8589',
      storage: '256GB',
      ram: '8GB',
      price: 29990000,
      comparePrice: 32990000,
      sku: 'IP15PM-TN-256',
      isActive: true,
    },
    {
      productId: product.id,
      color: 'Titan Xanh',
      colorCode: '#3C4D5C',
      storage: '512GB',
      ram: '8GB',
      price: 35990000,
      comparePrice: 38990000,
      sku: 'IP15PM-TX-512',
      isActive: true,
    },
    {
      productId: product.id,
      color: 'Titan Trắng',
      colorCode: '#E8E8E8',
      storage: '1TB',
      ram: '8GB',
      price: 41990000,
      comparePrice: 44990000,
      sku: 'IP15PM-TT-1TB',
      isActive: true,
    },
  ];

  for (const variantData of variants) {
    // Check if variant exists
    const existingVariant = await prisma.productVariant.findFirst({
      where: { sku: variantData.sku },
    });

    if (!existingVariant) {
      const variant = await prisma.productVariant.create({
        data: variantData,
      });

      // Create inventory for this variant
      const inventory = await prisma.inventory.create({
        data: {
          variantId: variant.id,
          quantity: 100,
          reserved: 0,
          available: 100,
          minStock: 10,
          maxStock: 500,
        },
      });

      console.log(`Created variant: ${variant.color} ${variant.storage} - Inventory: ${inventory.available}`);
    } else {
      console.log(`Variant already exists: ${variantData.sku}`);

      // Check if inventory exists
      const existingInventory = await prisma.inventory.findUnique({
        where: { variantId: existingVariant.id },
      });

      if (!existingInventory) {
        const inventory = await prisma.inventory.create({
          data: {
            variantId: existingVariant.id,
            quantity: 100,
            reserved: 0,
            available: 100,
            minStock: 10,
            maxStock: 500,
          },
        });
        console.log(`Created inventory for existing variant: ${existingInventory ? 'Updated' : 'Created'}`);
      } else {
        console.log(`Inventory already exists for variant: ${existingVariant.sku}`);
      }
    }
  }

  console.log('Inventory seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
