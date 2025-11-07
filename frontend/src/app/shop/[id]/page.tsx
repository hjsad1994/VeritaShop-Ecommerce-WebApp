import ProductDetail from '@/features/shop/ProductDetail';

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetail productId={params.id} />;
}
