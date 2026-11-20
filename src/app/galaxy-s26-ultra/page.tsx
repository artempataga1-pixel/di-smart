import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCrossSellProducts, getProductDetailBySlug } from '@/lib/catalog';
import { GalaxyPage } from './galaxy-page';

export const revalidate = 300;

export const metadata:Metadata={title:'Samsung Galaxy S26 Ultra — Di-SMART',description:'Galaxy S26 Ultra. Дизайн, камера 200 Мп, S Pen и Galaxy AI. Рассмотрите смартфон в 3D.',alternates:{canonical:'/galaxy-s26-ultra'}};

export default async function Page(){
  const product = await getProductDetailBySlug('galaxy-s26-ultra');
  if (!product) notFound();
  const crossSell = await getCrossSellProducts(product);
  return <GalaxyPage product={product} crossSell={crossSell}/>;
}
