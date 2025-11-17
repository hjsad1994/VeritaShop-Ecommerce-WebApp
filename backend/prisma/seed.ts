import { PrismaClient } from "@prisma/client";
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