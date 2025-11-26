import { PrismaClient, ProductVariantSentiment } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface SentimentData {
  variantId: string;
  battery?: number;
  camera?: number;
  performance?: number;
  display?: number;
  design?: number;
  packaging?: number;
  price?: number;
  shopService?: number;
  shipping?: number;
  general?: number;
  others?: number;
}

export class ProductVariantSentimentRepository extends BaseRepository<ProductVariantSentiment> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async upsertSentiment(data: SentimentData) {
    return this.prisma.productVariantSentiment.upsert({
      where: { variantId: data.variantId },
      create: {
        variantId: data.variantId,
        battery: data.battery ?? 0,
        camera: data.camera ?? 0,
        performance: data.performance ?? 0,
        display: data.display ?? 0,
        design: data.design ?? 0,
        packaging: data.packaging ?? 0,
        price: data.price ?? 0,
        shopService: data.shopService ?? 0,
        shipping: data.shipping ?? 0,
        general: data.general ?? 0,
        others: data.others ?? 0,
      },
      update: {
        ...(data.battery !== undefined && { battery: data.battery }),
        ...(data.camera !== undefined && { camera: data.camera }),
        ...(data.performance !== undefined && { performance: data.performance }),
        ...(data.display !== undefined && { display: data.display }),
        ...(data.design !== undefined && { design: data.design }),
        ...(data.packaging !== undefined && { packaging: data.packaging }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.shopService !== undefined && { shopService: data.shopService }),
        ...(data.shipping !== undefined && { shipping: data.shipping }),
        ...(data.general !== undefined && { general: data.general }),
        ...(data.others !== undefined && { others: data.others }),
      },
    });
  }

  async findByVariantId(variantId: string) {
    return this.prisma.productVariantSentiment.findUnique({
      where: { variantId },
    });
  }
}
