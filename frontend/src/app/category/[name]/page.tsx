import CategoryPage from '@/features/shop/CategoryPage';

export default async function CategoryRoute({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <CategoryPage category={name} />;
}
