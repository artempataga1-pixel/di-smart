import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductDetailBySlug, getRelatedProducts } from '@/lib/catalog';
import { GalaxyPage } from './galaxy-page';

export const dynamic = 'force-dynamic';

export const metadata:Metadata={title:'Samsung Galaxy S26 Ultra — Di-SMART',description:'Galaxy S26 Ultra. Дизайн, камера 200 Мп, S Pen и Galaxy AI. Рассмотрите смартфон в 3D.',alternates:{canonical:'/galaxy-s26-ultra'}};

export default async function Page(){
  const product = await getProductDetailBySlug('galaxy-s26-ultra');
  if (!product) notFound();
  const related = await getRelatedProducts(product.categorySlug, product.id);
  return <GalaxyPage product={product} related={related}/>;
}
