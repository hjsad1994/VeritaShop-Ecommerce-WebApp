import { ProductService, CreateVariantPayload, UpdateVariantPayload } from '../src/services/ProductService';
import { ApiError } from '../src/utils/ApiError';
import { ERROR_MESSAGES } from '../src/constants';

const buildService = () => {
  const productRepository = {
    findByIdForAdmin: jest.fn(),
    findById: jest.fn(),
  };

  const variantRepository = {
    listByProduct: jest.fn(),
    findById: jest.fn(),
    findBySku: jest.fn(),
    createVariant: jest.fn(),
    updateVariant: jest.fn(),
    deleteImages: jest.fn(),
    getImageKeys: jest.fn(),
    createImages: jest.fn(),
    updateImages: jest.fn(),
    upsertInventory: jest.fn(),
    deleteInventory: jest.fn(),
    softDeleteVariant: jest.fn(),
    resetPrimaryImage: jest.fn(),
  };

  const inventoryRepository = {
    findByVariantId: jest.fn(),
  };

  const s3Service = {
    deleteFiles: jest.fn(),
  };

  const service = new ProductService(
    productRepository as any,
    variantRepository as any,
    inventoryRepository as any,
    { s3Service: s3Service as any }
  );

  return {
    service,
    productRepository,
    variantRepository,
    inventoryRepository,
    s3Service,
  };
};

describe('ProductService - variant management', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createProductVariant persists data when payload is valid', async () => {
    const { service, productRepository, variantRepository } = buildService();

    productRepository.findByIdForAdmin.mockResolvedValue({ id: 'p1' });
    variantRepository.findBySku.mockResolvedValue(null);
    const createdVariant = { id: 'v1', productId: 'p1', images: [], inventory: null };
    variantRepository.createVariant.mockResolvedValue(createdVariant);

    const payload: CreateVariantPayload = {
      color: 'Black',
      colorCode: '#000000',
      price: 10000000,
      sku: 'IPHONE-256-BLK',
      storage: '256GB',
      ram: '8GB',
      images: [{ s3Key: 'products/sample/image.jpg', isPrimary: true }],
      inventory: { quantity: 5, minStock: 2 },
    };

    const result = await service.createProductVariant('p1', payload);

    expect(variantRepository.createVariant).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'p1',
        sku: 'IPHONE-256-BLK',
        images: payload.images,
        inventory: payload.inventory,
      })
    );
    expect(result).toEqual(createdVariant);
  });

  test('createProductVariant throws when price is invalid', async () => {
    const { service, productRepository } = buildService();
    productRepository.findByIdForAdmin.mockResolvedValue({ id: 'p1' });

    const payload: CreateVariantPayload = {
      color: 'Silver',
      price: 0,
      sku: 'SKU-INVALID',
    };

    await expect(service.createProductVariant('p1', payload)).rejects.toThrow(ApiError);
  });

  test('updateProductVariant enforces SKU uniqueness', async () => {
    const { service, productRepository, variantRepository } = buildService();
    productRepository.findByIdForAdmin.mockResolvedValue({ id: 'p1' });
    variantRepository.findById.mockResolvedValue({
      id: 'v1',
      productId: 'p1',
      color: 'Black',
      colorCode: '#000000',
      storage: '256GB',
      ram: '8GB',
      price: { toNumber: () => 10000000 },
      comparePrice: { toNumber: () => 10000000 },
      sku: 'OLD-SKU',
      isActive: true,
      images: [],
      inventory: { quantity: 0, reserved: 0 },
    });

    variantRepository.findBySku.mockResolvedValue({ id: 'other-variant' });

    const payload: UpdateVariantPayload = {
      sku: 'DUPLICATE-SKU',
    };

    await expect(service.updateProductVariant('p1', 'v1', payload)).rejects.toThrow(
      ERROR_MESSAGES.VARIANT_SKU_EXISTS
    );
  });
});

