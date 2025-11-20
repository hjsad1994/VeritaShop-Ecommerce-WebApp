import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');

  // Get the latest order for this month
  const latestOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `ORD-${yearMonth}`
      }
    },
    orderBy: {
      orderNumber: 'desc'
    }
  });

  let sequence = 1;
  if (latestOrder) {
    const parts = latestOrder.orderNumber.split('-');
    sequence = parseInt(parts[2]) + 1;
  }

  return `ORD-${yearMonth}-${sequence.toString().padStart(3, '0')}`;
}

async function main() {
  console.log("🚀 Creating sample orders for testing...");

  // Get test users
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (!adminUser) {
    console.error("❌ Admin user not found. Please run the main seed script first.");
    return;
  }

  // Create test users if they don't exist
  const testUsers = [
    {
      email: "testuser1@example.com",
      name: "Nguyễn Văn A",
      phone: "0912345678",
      address: "123 Nguyễn Trãi, Quận 1, TP.HCM"
    },
    {
      email: "testuser2@example.com",
      name: "Trần Thị B",
      phone: "0923456789",
      address: "456 Lê Lợi, Quận 3, TP.HCM"
    },
    {
      email: "testuser3@example.com",
      name: "Lê Văn C",
      phone: "0934567890",
      address: "789 Cách Mạng Tháng Tám, Quận 10, TP.HCM"
    }
  ];

  const createdUsers = [];
  for (const userData of testUsers) {
    let user = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          ...userData,
          password: "$2a$10$examplehashedpassword", // Dummy password
          role: "USER"
        }
      });
      console.log(`✅ Created test user: ${user.email}`);
    } else {
      console.log(`ℹ️ Test user already exists: ${user.email}`);
    }
    createdUsers.push(user);
  }

  // Get product variants for creating orders
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true
    },
    take: 6 // Get 6 variants for variety
  });

  if (variants.length < 6) {
    console.error("❌ Not enough product variants found. Please ensure products and variants are created.");
    return;
  }

  // Create sample orders with different statuses
  const sampleOrders = [
    {
      customerName: "Nguyễn Văn A",
      customerEmail: "testuser1@example.com",
      customerPhone: "0912345678",
      shippingAddress: "123 Nguyễn Trãi, Quận 1, TP.HCM",
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      paymentMethod: "COD",
      notes: "Giao hàng trong giờ hành chính",
      variantIndexes: [0, 1], // Use first 2 variants
      quantities: [1, 1],
      expectedTotal: 52980000 // iPhone 15 Pro Max + Samsung Galaxy S24 Ultra
    },
    {
      customerName: "Trần Thị B",
      customerEmail: "testuser2@example.com",
      customerPhone: "0923456789",
      shippingAddress: "456 Lê Lợi, Quận 3, TP.HCM",
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "CREDIT_CARD",
      notes: "Gọi điện trước khi giao",
      variantIndexes: [2], // Use 3rd variant
      quantities: [2],
      expectedTotal: 33980000 // 2x Xiaomi 14 Pro
    },
    {
      customerName: "Lê Văn C",
      customerEmail: "testuser3@example.com",
      customerPhone: "0934567890",
      shippingAddress: "789 Cách Mạng Tháng Tám, Quận 10, TP.HCM",
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "E_WALLET",
      notes: "Gói quà tặng sinh nhật",
      variantIndexes: [3, 4], // Use 4th and 5th variants
      quantities: [1, 1],
      expectedTotal: 40980000 // iPhone 15 Pro + Samsung Galaxy Tab S9
    },
    {
      customerName: "Phạm Thị D",
      customerEmail: "testuser1@example.com",
      customerPhone: "0945678901",
      shippingAddress: "321 Võ Văn Kiệt, Quận 5, TP.HCM",
      status: OrderStatus.SHIPPING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "COD",
      notes: "Giao hàng nhanh",
      variantIndexes: [5], // Use 6th variant
      quantities: [1],
      expectedTotal: 29990000 // MacBook Air M2
    },
    {
      customerName: "Hoàng Văn E",
      customerEmail: "testuser2@example.com",
      customerPhone: "0956789012",
      shippingAddress: "654 Hai Bà Trưng, Quận 1, TP.HCM",
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "CREDIT_CARD",
      notes: "Khách hàng đã nhận hàng",
      variantIndexes: [0, 2], // Mix variants
      quantities: [1, 1],
      expectedTotal: 49980000 // iPhone 15 Pro Max + Xiaomi 14 Pro
    }
  ];

  for (let i = 0; i < sampleOrders.length; i++) {
    const orderData = sampleOrders[i];

    try {
      // Calculate actual totals based on variants
      let subtotal = 0;
      const orderItems = [];

      for (let j = 0; j < orderData.variantIndexes.length; j++) {
        const variant = variants[orderData.variantIndexes[j]];
        const quantity = orderData.quantities[j];
        const itemSubtotal = Number(variant.price) * quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          variantId: variant.id,
          productName: variant.product.name,
          variantInfo: `${variant.color}${variant.storage ? ' - ' + variant.storage : ''}`,
          price: variant.price,
          quantity: quantity,
          subtotal: itemSubtotal
        });
      }

      const shippingFee = 30000; // Fixed shipping fee
      const discount = subtotal > 30000000 ? 2000000 : 0; // 2M discount for orders > 30M
      const tax = Math.round(subtotal * 0.1); // 10% tax
      const total = subtotal + shippingFee - discount + tax;

      const orderNumber = await generateOrderNumber();

      // Find the user for this order
      const user = await prisma.user.findUnique({
        where: { email: orderData.customerEmail }
      });

      if (!user) {
        console.error(`❌ User not found: ${orderData.customerEmail}`);
        continue;
      }

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          shippingAddress: orderData.shippingAddress,
          subtotal,
          discount,
          shippingFee,
          tax,
          total,
          status: orderData.status,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          isPaid: orderData.paymentStatus === PaymentStatus.PAID,
          paidAt: orderData.paymentStatus === PaymentStatus.PAID ? new Date() : null,
          deliveredAt: orderData.status === OrderStatus.DELIVERED ? new Date() : null,
          notes: orderData.notes,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          },
          user: true
        }
      });

      console.log(`✅ Created order: ${order.orderNumber} - ${order.customerName} - ${order.status} - ₫${total.toLocaleString('vi-VN')}`);

      // Update stock for each variant
      for (let j = 0; j < orderData.variantIndexes.length; j++) {
        const variant = variants[orderData.variantIndexes[j]];
        const quantity = orderData.quantities[j];

        if (orderData.status === OrderStatus.PENDING ||
        orderData.status === OrderStatus.CONFIRMED ||
        orderData.status === OrderStatus.PROCESSING ||
        orderData.status === OrderStatus.SHIPPING) {
          await prisma.inventory.update({
            where: { variantId: variant.id },
            data: {
              quantity: {
                decrement: quantity
              }
            }
          });
          console.log(`   📦 Updated stock for ${variant.product.name} (${variant.color}): -${quantity}`);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to create order for ${orderData.customerName}:`, error);
    }
  }

  console.log("\n🎉 Sample orders created successfully!");
  console.log("\n📋 Order Summary:");

  const createdOrders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      },
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  createdOrders.forEach(order => {
    console.log(`   • ${order.orderNumber}: ${order.customerName} - ${order.status} - ${order.paymentStatus} - ₫${Number(order.total).toLocaleString('vi-VN')}`);
  });

  console.log("\n🔑 Test Credentials:");
  console.log("   Admin: admin@gmail.com / 123456");
  console.log("   Users: testuser1@example.com / 123456 (and testuser2, testuser3)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });