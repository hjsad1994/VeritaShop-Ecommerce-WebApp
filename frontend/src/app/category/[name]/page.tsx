import CategoryPage from '@/features/shop/CategoryPage';

export default function CategoryRoute({ params }: { params: { name: string } }) {
  return <CategoryPage category={params.name} />;
}
