import ProductDetail from '@/features/shop/ProductDetail';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetail productSlug={slug} />;
}
