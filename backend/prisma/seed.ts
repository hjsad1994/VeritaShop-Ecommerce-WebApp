import { PrismaClient, VoucherType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Admin User
  const email = "admin@gmail.com";
  const password = "123456";
  const name = "Admin User";

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user created:", adminUser.email);
  } else {
    console.log("Admin user already exists");
  }

  // Create Brands
  const brands = [
    { name: "Apple", slug: "apple", description: "Apple Inc.", logo: "https://example.com/apple-logo.png" },
    { name: "Samsung", slug: "samsung", description: "Samsung Electronics", logo: "https://example.com/samsung-logo.png" },
    { name: "Xiaomi", slug: "xiaomi", description: "Xiaomi Corporation", logo: "https://example.com/xiaomi-logo.png" },
  ];

  const createdBrands = [];
  for (const brandData of brands) {
    const existingBrand = await prisma.brand.findUnique({
      where: { slug: brandData.slug }
    });

    if (!existingBrand) {
      const brand = await prisma.brand.create({ data: brandData });
      createdBrands.push(brand);
      console.log("Brand created:", brand.name);
    } else {
      createdBrands.push(existingBrand);
      console.log("Brand already exists:", existingBrand.name);
    }
  }

  // Create Categories with hierarchy
  const parentCategories = [
    { name: "Điện thoại", slug: "dien-thoai", description: "Điện thoại thông minh" },
    { name: "Laptop", slug: "laptop", description: "Máy tính xách tay" },
    { name: "Tablet", slug: "tablet", description: "Máy tính bảng" },
  ];

  const createdParentCategories = [];
  for (const categoryData of parentCategories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug }
    });

    if (!existingCategory) {
      const category = await prisma.category.create({ data: categoryData });
      createdParentCategories.push(category);
      console.log("Parent category created:", category.name);
    } else {
      createdParentCategories.push(existingCategory);
      console.log("Parent category already exists:", existingCategory.name);
    }
  }

  // Create child categories
  const childCategories = [
    { 
      name: "Điện thoại Flagship", 
      slug: "dien-thoai-flagship", 
      description: "Điện thoại cao cấp",
      parentId: createdParentCategories[0].id 
    },
    { 
      name: "Điện thoại Gaming", 
      slug: "dien-thoai-gaming", 
      description: "Điện thoại chuyên game",
      parentId: createdParentCategories[0].id 
    },
    { 
      name: "Điện thoại Phổ thông", 
      slug: "dien-thoai-pho-thong", 
      description: "Điện thoại giá rẻ",
      parentId: createdParentCategories[0].id 
    },
    { 
      name: "Laptop Gaming", 
      slug: "laptop-gaming", 
      description: "Laptop chuyên game",
      parentId: createdParentCategories[1].id 
    },
    { 
      name: "Laptop Văn phòng", 
      slug: "laptop-van-phong", 
      description: "Laptop văn phòng",
      parentId: createdParentCategories[1].id 
    },
  ];

  const createdCategories = [...createdParentCategories];
  for (const categoryData of childCategories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug }
    });

    if (!existingCategory) {
      const category = await prisma.category.create({ data: categoryData });
      createdCategories.push(category);
      console.log("Child category created:", category.name);
    } else {
      createdCategories.push(existingCategory);
      console.log("Child category already exists:", existingCategory.name);
    }
  }

  // Create Sample Products
  const products = [
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Latest flagship iPhone with A17 Pro chip, titanium design, and advanced camera system.",
      brandId: createdBrands[0].id,
      categoryId: createdCategories[0].id,
      basePrice: 29990000,
      discount: 10,
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Premium Samsung flagship with S Pen, powerful camera, and AI features.",
      brandId: createdBrands[1].id,
      categoryId: createdCategories[0].id,
      basePrice: 27990000,
      discount: 5,
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Xiaomi 14 Pro",
      slug: "xiaomi-14-pro",
      description: "High-performance smartphone with Leica camera system.",
      brandId: createdBrands[2].id,
      categoryId: createdCategories[0].id,
      basePrice: 19990000,
      discount: 15,
      isFeatured: false,
      isActive: true,
    },
  ];

  for (const productData of products) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug }
    });

    if (!existingProduct) {
      const product = await prisma.product.create({ data: productData });
      console.log("Product created:", product.name);
    } else {
      console.log("Product already exists:", existingProduct.name);
    }
  }

  // Create additional test products for order testing
  const additionalProducts = [
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description: "Premium smartphone with A17 Pro chip and titanium design.",
      brandId: createdBrands[0].id,
      categoryId: createdCategories[2].id, // Điện thoại Flagship
      basePrice: 24990000,
      discount: 5,
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Samsung Galaxy Tab S9",
      slug: "samsung-galaxy-tab-s9",
      description: "High-end tablet with AMOLED display and S Pen.",
      brandId: createdBrands[1].id,
      categoryId: createdCategories[6].id, // Tablet
      basePrice: 15990000,
      discount: 10,
      isFeatured: false,
      isActive: true,
    },
    {
      name: "MacBook Air M2",
      slug: "macbook-air-m2",
      description: "Ultra-thin laptop with M2 chip and all-day battery life.",
      brandId: createdBrands[0].id,
      categoryId: createdCategories[4].id, // Laptop Văn phòng
      basePrice: 29990000,
      discount: 8,
      isFeatured: true,
      isActive: true,
    },
  ];

  for (const productData of additionalProducts) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug }
    });

    if (!existingProduct) {
      const product = await prisma.product.create({ data: productData });
      console.log("Additional product created:", product.name);

      // Create variants for each product
      if (productData.slug === "iphone-15-pro") {
        const variants = [
          {
            productId: product.id,
            color: "Titanium Natural",
            storage: "128GB",
            price: 24990000,
            comparePrice: 24990000,
            stock: 15,
            sku: "IP15PRO-NAT-128",
            isActive: true,
          },
          {
            productId: product.id,
            color: "Titanium Blue",
            storage: "256GB",
            price: 27990000,
            comparePrice: 27990000,
            stock: 10,
            sku: "IP15PRO-BLU-256",
            isActive: true,
          },
          {
            productId: product.id,
            color: "Titanium White",
            storage: "512GB",
            price: 32990000,
            comparePrice: 32990000,
            stock: 5,
            sku: "IP15PRO-WHT-512",
            isActive: true,
          },
        ];

        for (const variantData of variants) {
          // Extract stock separately and remove from variant data
          const { stock, ...variantDataWithoutStock } = variantData;
          const variant = await prisma.productVariant.create({ data: variantDataWithoutStock });
          // Create inventory record for stock
          await prisma.inventory.create({
            data: {
              variantId: variant.id,
              quantity: stock,
              reserved: 0,
              minStock: 5,
              maxStock: 50,
            }
          });
          console.log("  Variant created:", variant.color, variant.storage, "- Stock:", stock);
        }
      } else if (productData.slug === "samsung-galaxy-tab-s9") {
        const variants = [
          {
            productId: product.id,
            color: "Graphite",
            storage: "128GB WiFi",
            price: 15990000,
            comparePrice: 15990000,
            stock: 8,
            sku: "TABS9-GRP-128W",
            isActive: true,
          },
          {
            productId: product.id,
            color: "Silver",
            storage: "256GB 5G",
            price: 18990000,
            comparePrice: 18990000,
            stock: 6,
            sku: "TABS9-SLV-2565G",
            isActive: true,
          },
        ];

        for (const variantData of variants) {
          // Extract stock separately and remove from variant data
          const { stock, ...variantDataWithoutStock } = variantData;
          const variant = await prisma.productVariant.create({ data: variantDataWithoutStock });
          // Create inventory record for stock
          await prisma.inventory.create({
            data: {
              variantId: variant.id,
              quantity: stock,
              reserved: 0,
              minStock: 5,
              maxStock: 50,
            }
          });
          console.log("  Variant created:", variant.color, variant.storage, "- Stock:", stock);
        }
      } else if (productData.slug === "macbook-air-m2") {
        const variants = [
          {
            productId: product.id,
            color: "Midnight",
            storage: "256GB SSD",
            price: 29990000,
            comparePrice: 29990000,
            stock: 12,
            sku: "MBA-M2-MID-256",
            isActive: true,
          },
          {
            productId: product.id,
            color: "Starlight",
            storage: "512GB SSD",
            price: 34990000,
            comparePrice: 34990000,
            stock: 8,
            sku: "MBA-M2-STL-512",
            isActive: true,
          },
        ];

        for (const variantData of variants) {
          // Extract stock separately and remove from variant data
          const { stock, ...variantDataWithoutStock } = variantData;
          const variant = await prisma.productVariant.create({ data: variantDataWithoutStock });
          // Create inventory record for stock
          await prisma.inventory.create({
            data: {
              variantId: variant.id,
              quantity: stock,
              reserved: 0,
              minStock: 5,
              maxStock: 50,
            }
          });
          console.log("  Variant created:", variant.color, variant.storage, "- Stock:", stock);
        }
      }
    } else {
      console.log("Additional product already exists:", existingProduct.name);
  // Create sample vouchers
  const now = new Date();
  const nextQuarter = new Date(now);
  nextQuarter.setMonth(now.getMonth() + 3);

  const vouchers = [
    {
      code: "WELCOME10",
      type: VoucherType.PERCENTAGE,
      value: 10,
      minOrderValue: 10000000,
      usageLimit: 500,
      perUserLimit: 1,
      startDate: now,
      endDate: nextQuarter,
    },
    {
      code: "FLASH500K",
      type: VoucherType.FIXED,
      value: 500000,
      minOrderValue: 5000000,
      usageLimit: 200,
      perUserLimit: 2,
      startDate: now,
      endDate: nextQuarter,
    },
  ];

  for (const voucherData of vouchers) {
    const existingVoucher = await prisma.voucher.findUnique({
      where: { code: voucherData.code },
    });

    if (!existingVoucher) {
      await prisma.voucher.create({ data: voucherData });
      console.log("Voucher created:", voucherData.code);
    } else {
      console.log("Voucher already exists:", voucherData.code);
    }
  }

  console.log("\n✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });