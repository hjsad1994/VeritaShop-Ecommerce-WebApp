import ProductVariantsPage from '@/features/admin/ProductVariantsPage';

interface ProductVariantsPageProps {
  params: {
    productId: string;
  };
}

export default function AdminProductVariantsPage({ params }: ProductVariantsPageProps) {
  return <ProductVariantsPage productId={params.productId} />;
}

