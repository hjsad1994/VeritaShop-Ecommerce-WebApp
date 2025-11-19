import ProductVariantsPage from '@/features/admin/ProductVariantsPage';

interface ProductVariantsPageProps {
  params?: Promise<{
    productId: string;
  }>;
}

export default async function AdminProductVariantsPage({ params }: ProductVariantsPageProps) {
  const resolvedParams = (params ? await params : { productId: '' }) as { productId?: string };
  if (!resolvedParams.productId) {
    throw new Error('Product ID is required for the variants admin page');
  }
  return <ProductVariantsPage productId={resolvedParams.productId} />;
}

