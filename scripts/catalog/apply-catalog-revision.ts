import { config } from "dotenv";
import { mkdir, writeFile, access } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import { isStorefrontVariantAllowed } from "../../src/lib/storefront-variants";
config({quiet:true});
const db = new PrismaClient({adapter:createDatabaseAdapter()});
async function main(){try{
 const brands=await db.brand.findMany({where:{slug:"xiaomi"}});
 const categories=await db.category.findMany({where:{OR:[{slug:"laptops"},{brand:{slug:"xiaomi"}}]}});
 const iphones=await db.product.findMany({where:{category:{slug:"iphone"}},include:{variants:{include:{options:{include:{attributeValue:{include:{attribute:true}}}}}},images:true,colorValues:{include:{attributeValue:true}}}});
 const defaults=iphones.map(product=>({product,allowed:product.variants.filter(variant=>isStorefrontVariantAllowed(product.slug,variant.options)).sort((a,b)=>a.sortOrder-b.sortOrder)}));
 for(const {product,allowed}of defaults)if(product.variants.length && !allowed.length)throw new Error(`No existing supported SIM configurations: ${product.slug}`);
 const photos=iphones.filter(product=>["iphone-18-pro","iphone-18-pro-max"].includes(product.slug));
 const colours:Record<string,string>={"Бордовый":"burgundy","Ледниковый":"glacier","Серебристый":"silver","Чёрный":"black"};
 for(const product of photos)for(const color of product.colorValues){if(!colours[color.attributeValue.value])throw new Error('Unknown colour');await access(`public/media/catalog/apple-official-2026/${product.slug}-${colours[color.attributeValue.value]}.webp`);}
 console.log(JSON.stringify({hideBrands:brands.map(b=>b.slug),hideCategories:categories.map(c=>c.slug),iphones:defaults.map(({product,allowed})=>({slug:product.slug,allowed:allowed.length,legacyHidden:product.variants.length-allowed.length})),officialImages:photos.reduce((n,p)=>n+p.colorValues.length,0)}));
 if(!process.argv.includes('--apply'))return;
 await mkdir('docs/catalog',{recursive:true});await writeFile('docs/catalog/catalog-revision-before-2026-10-07.json',JSON.stringify({brands,categories,iphones},null,2),{mode:0o600,flag:'wx'});
 await db.$transaction(async tx=>{
  await tx.brand.updateMany({where:{slug:'xiaomi'},data:{isActive:false}});
  await tx.category.updateMany({where:{id:{in:categories.map(c=>c.id)}},data:{isActive:false}});
  for(const {product,allowed}of defaults){if(!allowed.length)continue;const chosen=allowed.find(v=>v.isDefault)??allowed[0];await tx.productVariant.updateMany({where:{productId:product.id},data:{isDefault:false}});await tx.productVariant.update({where:{id:chosen.id},data:{isDefault:true}});}
  for(const product of photos)for(const color of product.colorValues){await tx.productImage.updateMany({where:{productId:product.id,colorValueId:color.id},data:{url:`/media/catalog/apple-official-2026/${product.slug}-${colours[color.attributeValue.value]}.webp`,alt:`${product.name}, ${color.attributeValue.value} — официальное фото Apple`}});}
 },{timeout:60000,maxWait:15000});
 console.log('Applied: reversible visibility changes, allowed default SKUs, eight official images. Prices and order history unchanged.');
}finally{await db.$disconnect();}}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
