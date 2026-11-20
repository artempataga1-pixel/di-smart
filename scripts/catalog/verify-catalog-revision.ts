import assert from "node:assert/strict";
import { config } from "dotenv";
import { writeFile } from "node:fs/promises";
config({quiet:true});
async function main(){
 const {prisma}=await import('../../src/lib/prisma');
 const {resolveCartLines}=await import('../../src/lib/cart-resolve');
 try{
  const products=await prisma.product.findMany({where:{category:{slug:'iphone'},isActive:true},include:{variants:{include:{options:{include:{attributeValue:{include:{attribute:true}}}}}},colorValues:true,images:true}});
  const sim=(variant:typeof products[number]['variants'][number])=>variant.options.find(option=>option.attributeValue.attribute.slug==='sim')?.attributeValue.value;
  for(const product of products){assert.ok(product.variants.some(v=>v.isDefault&&sim(v)!=='SIM'));const response=await fetch(`https://di-smart-gilt.vercel.app/product/${product.slug}`);const html=await response.text();assert.equal(response.status,200);assert.ok(!/type="checkbox"[^>]*>SIM</.test(html));}
  const product=products.find(p=>p.slug==='iphone-18-pro')!;const legacy=product.variants.find(v=>sim(v)==='SIM')!;const allowed=product.variants.find(v=>sim(v)==='eSIM')!;
  const lines=await resolveCartLines([legacy,allowed].map(v=>({productId:product.id,variantId:v.id,colorValueId:product.colorValues[0].id,qty:1})),3);
  assert.equal(lines[0].availability,'OUT_OF_STOCK');assert.notEqual(lines[1].availability,'OUT_OF_STOCK');
  assert.equal((await prisma.brand.findUnique({where:{slug:'xiaomi'}}))?.isActive,false);
  assert.equal((await prisma.category.findUnique({where:{slug:'laptops'}}))?.isActive,false);
  assert.equal((await prisma.category.findUnique({where:{slug:'macbook'}}))?.isActive,true);
  for(const product of products.filter(p=>['iphone-18-pro','iphone-18-pro-max'].includes(p.slug)))assert.equal(product.images.filter(i=>i.url.startsWith('/media/catalog/apple-official-2026/')).length,4);
  for(const path of ['/catalog','/catalog?brand=apple','/catalog?brand=samsung','/catalog?group=accessories','/catalog/watch?brand=apple','/catalog/watch?brand=samsung']){const r=await fetch('https://di-smart-gilt.vercel.app'+path);const html=await r.text();assert.equal(r.status,200,path);assert.ok(!html.includes('Техника Apple, Samsung и Xiaomi'));}
  const report={checkedAt:new Date().toISOString(),iphonePages:products.length,legacySimBlockedInCart:true,allowedEsimAcceptedInCart:true,xiaomiHidden:true,laptopsHidden:true,macbookRetained:true,officialColorPhotos:8,catalogPages:6};await writeFile('docs/catalog/catalog-revision-verification-2026-10-07.json',JSON.stringify(report,null,2));console.log(report);
 }finally{await prisma.$disconnect();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
