#!/usr/bin/env node
/** Apply the client's Apple device assortment without resetting images or merchant prices.
 * Dry run: node scripts/catalog/sync-client-apple-assortment.mjs
 * Apply:   node scripts/catalog/sync-client-apple-assortment.mjs --apply
 */
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import pg from 'pg';

const desired = new Set([
  'iphone-17e','iphone-17','iphone-17-pro','iphone-17-pro-max','iphone-18-pro','iphone-18-pro-max',
  'airpods-4','airpods-4-anc','airpods-5','airpods-5-wireless','airpods-pro-2','airpods-pro-3','airpods-max','airpods-max-2',
  'watch-se-3','watch-series-11','watch-series-12',
  'ipad-11','ipad-air-11','ipad-air-13',
  'macbook-air-13-m5','macbook-air-15-m5','macbook-neo',
]);
const memory = new Map([
  ['iphone-17e',['256 ГБ']],
  ['iphone-17',['256 ГБ','512 ГБ']],
  ['iphone-17-pro',['256 ГБ','512 ГБ','1 ТБ']],
  ['iphone-17-pro-max',['256 ГБ','512 ГБ','1 ТБ']],
  ['iphone-18-pro',['256 ГБ','512 ГБ','1 ТБ']],
  ['iphone-18-pro-max',['256 ГБ','512 ГБ','1 ТБ']],
  ['ipad-11',['128 ГБ','256 ГБ']],
  ['ipad-air-11',['128 ГБ','256 ГБ']],
  ['ipad-air-13',['128 ГБ','256 ГБ']],
  ['macbook-neo',['256 ГБ','512 ГБ']],
]);
const watchColors = new Map([
  ['watch-se-3', [
    ['Полночный','Полночный / Midnight Sport Band','#12141c'],
    ['Звёздный','Звёздный / Starlight Sport Band','#e7ded0'],
  ]],
  ['watch-series-11', [
    ['Космический серый','Космический серый / Black Sport Band','#5a5b60'],
    ['Глянцевый чёрный','Глянцевый чёрный / Black Sport Band','#151619'],
    ['Розово-золотой','Розово-золотой / Light Blush Sport Band','#b98b78'],
    ['Серебристый','Серебристый / Pur Fog Sport Band','#d7d9dc'],
  ]],
  ['watch-series-12', [
    ['Чёрный','Чёрный / Black Sport Band','#1c1c1e'],
    ['Тёмная бронза','Тёмная бронза / Olive Sport Band','#695649'],
    ['Светло-золотой','Светло-золотой / Sand Sport Band','#ded6bd'],
    ['Космический серый','Космический серый / Black Sport Band','#5a5b60'],
    [null,'Космический серый / Blue Sport Band','#5a5b60'],
  ]],
]);
const appleSections = new Set(['iphone','ipad','macbook','watch','airpods','apple-devices']);
const apply = process.argv.includes('--apply');
const env = parse(await readFile(resolve('.env.local')));
if (!env.DATABASE_URL) throw new Error('DATABASE_URL missing in .env.local');
const db = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10000 });
await db.connect();
const one = async (sql,args=[]) => (await db.query(sql,args)).rows[0];
const rows = async (sql,args=[]) => (await db.query(sql,args)).rows;
const id = () => randomUUID();
try {
  await db.query(apply ? 'BEGIN' : 'BEGIN READ ONLY');
  await db.query("SET LOCAL lock_timeout = '5s'");
  const products = await rows(`SELECT p.*,c.slug AS category FROM "Product" p JOIN "Brand" b ON b.id=p."brandId" JOIN "Category" c ON c.id=p."categoryId" WHERE b.slug='apple' ORDER BY p.slug`);
  const bySlug = new Map(products.map(p=>[p.slug,p]));
  const missing = [...desired].filter(slug=>slug!=='airpods-pro-2' && !bySlug.has(slug));
  if (missing.length) throw new Error(`Expected existing Apple products missing: ${missing.join(', ')}`);
  const target = products.filter(p=>appleSections.has(p.category));
  const inactive = target.filter(p=>!desired.has(p.slug));
  const snapshot = {};
  for (const p of target) {
    snapshot[p.slug] = {
      product:p,
      variants:await rows(`SELECT v.*,a.slug AS attribute,av.value FROM "ProductVariant" v LEFT JOIN "ProductVariantOption" o ON o."variantId"=v.id LEFT JOIN "VariantAttributeValue" av ON av.id=o."attributeValueId" LEFT JOIN "VariantAttribute" a ON a.id=av."attributeId" WHERE v."productId"=$1 ORDER BY v."sortOrder"`,[p.id]),
      colors:await rows(`SELECT cv.*,av.value,co.id AS "offerId",co."variantId" AS "offerVariantId",co."priceByn" AS "offerPriceByn",co.availability AS "offerAvailability" FROM "ProductColorValue" cv JOIN "VariantAttributeValue" av ON av.id=cv."attributeValueId" LEFT JOIN "ProductColorOffer" co ON co."colorValueId"=cv.id WHERE cv."productId"=$1`,[p.id]),
      images:await rows(`SELECT * FROM "ProductImage" WHERE "productId"=$1`,[p.id]),
      specs:await rows(`SELECT * FROM "ProductSpec" WHERE "productId"=$1`,[p.id]),
    };
  }
  const summary = {activeExpected:desired.size,hide:inactive.filter(p=>p.isActive).map(p=>p.slug),create:bySlug.has('airpods-pro-2')?[]:['airpods-pro-2'],trimVariants:[],watchColors:[...watchColors.keys()],macbookConfigurations:['macbook-air-13-m5','macbook-air-15-m5']};
  for (const [slug, allowed] of memory) {
    const vs=snapshot[slug].variants;
    const actual=[...new Set(vs.filter(v=>v.attribute==='memory').map(v=>v.value))];
    if (allowed.some(label=>!actual.includes(label))) throw new Error(`${slug}: expected storage missing ${allowed.filter(x=>!actual.includes(x))}`);
    const extra=actual.filter(label=>!allowed.includes(label));
    if (extra.length) summary.trimVariants.push({slug,remove:extra});
  }
  console.log(JSON.stringify(summary,null,2));
  if (!apply) { await db.query('ROLLBACK'); console.log('Read-only preview. Use --apply to sync.'); process.exit(0); }
  const backupPath=resolve(`docs/catalog/client-apple-before-sync-${new Date().toISOString().replaceAll(':','-')}.json`);
  await writeFile(backupPath, JSON.stringify({capturedAt:new Date().toISOString(),products:snapshot},null,2)+'\n',{flag:'wx'});
  for (const p of inactive) await db.query(`UPDATE "Product" SET "isActive"=false,"updatedAt"=now() WHERE id=$1`,[p.id]);
  await db.query(`UPDATE "Category" SET "isActive"=false,"updatedAt"=now() WHERE slug='apple-devices'`);
  for (const slug of desired) if (bySlug.has(slug)) await db.query(`UPDATE "Product" SET "isActive"=true,"updatedAt"=now() WHERE id=$1`,[bySlug.get(slug).id]);
  for (const [slug,allowed] of memory) {
    const p=bySlug.get(slug);
    const variants=await rows(`SELECT v.id,v.availability,av.value FROM "ProductVariant" v JOIN "ProductVariantOption" o ON o."variantId"=v.id JOIN "VariantAttributeValue" av ON av.id=o."attributeValueId" JOIN "VariantAttribute" a ON a.id=av."attributeId" AND a.slug='memory' WHERE v."productId"=$1`,[p.id]);
    for (const v of variants) if (!allowed.includes(v.value)) {
      const orders=await one(`SELECT count(*)::int AS count FROM "OrderItem" WHERE "variantId"=$1`,[v.id]);
      if (orders.count) throw new Error(`Refusing to delete ordered variant ${slug}/${v.value}`);
      await db.query(`DELETE FROM "ProductVariant" WHERE id=$1`,[v.id]);
    } else if (v.availability==='OUT_OF_STOCK') {
      await db.query(`UPDATE "ProductVariant" SET availability='IN_STOCK',"updatedAt"=now() WHERE id=$1`,[v.id]);
    }
  }
  const colorAttr=await one(`SELECT id FROM "VariantAttribute" WHERE slug='color'`);
  if (!colorAttr) throw new Error('Missing color attribute');
  for (const [slug, combos] of watchColors) {
    const p=bySlug.get(slug);
    const existing=await rows(`SELECT cv.id,av.value FROM "ProductColorValue" cv JOIN "VariantAttributeValue" av ON av.id=cv."attributeValueId" WHERE cv."productId"=$1`,[p.id]);
    for (const [oldName,newName,hex] of combos) {
      let av=await one(`SELECT id FROM "VariantAttributeValue" WHERE "attributeId"=$1 AND value=$2`,[colorAttr.id,newName]);
      if (!av) av=await one(`INSERT INTO "VariantAttributeValue" (id,"attributeId",value,"colorHex","sortOrder") VALUES ($1,$2,$3,$4,$5) RETURNING id`,[id(),colorAttr.id,newName,hex,combos.findIndex(x=>x[1]===newName)]);
      const cv=existing.find(x=>x.value===oldName||x.value===newName);
      if (cv) await db.query(`UPDATE "ProductColorValue" SET "attributeValueId"=$1 WHERE id=$2`,[av.id,cv.id]);
      else await db.query(`INSERT INTO "ProductColorValue" (id,"productId","attributeValueId") VALUES ($1,$2,$3)`,[id(),p.id,av.id]);
    }
    const expectedNames=combos.map(x=>x[1]);
    const actual=await rows(`SELECT cv.id,av.value FROM "ProductColorValue" cv JOIN "VariantAttributeValue" av ON av.id=cv."attributeValueId" WHERE cv."productId"=$1`,[p.id]);
    for (const cv of actual.filter(x=>!expectedNames.includes(x.value))) {
      const linked=await one(`SELECT (SELECT count(*)::int FROM "ProductColorOffer" WHERE "colorValueId"=$1) AS offers,(SELECT count(*)::int FROM "ProductImage" WHERE "colorValueId"=$1) AS images`,[cv.id]);
      if (linked.offers||linked.images) throw new Error(`Unexpected watch color with linked data: ${slug}/${cv.value}`);
      await db.query(`DELETE FROM "ProductColorValue" WHERE id=$1`,[cv.id]);
    }
  }
  const confAttr=await one(`INSERT INTO "VariantAttribute" (id,name,slug,"sortOrder","isColor") VALUES ($1,'ОЗУ / SSD','configuration',1,false) ON CONFLICT (slug) DO UPDATE SET name='ОЗУ / SSD' RETURNING id`,[id()]);
  const confLabels=['16 ГБ / 512 ГБ','16 ГБ / 1 ТБ','24 ГБ / 1 ТБ'];
  const confValues=new Map();
  for (const [sort,label] of confLabels.entries()) {
    const av=await one(`INSERT INTO "VariantAttributeValue" (id,"attributeId",value,"sortOrder") VALUES ($1,$2,$3,$4) ON CONFLICT ("attributeId",value) DO UPDATE SET "sortOrder"=$4 RETURNING id`,[id(),confAttr.id,label,sort]);
    confValues.set(label,av.id);
  }
  for (const slug of ['macbook-air-13-m5','macbook-air-15-m5']) {
    const p=bySlug.get(slug);
    const variants=await rows(`SELECT v.id,v."priceUsd",v."priceByn",av.value AS memory FROM "ProductVariant" v JOIN "ProductVariantOption" o ON o."variantId"=v.id JOIN "VariantAttributeValue" av ON av.id=o."attributeValueId" JOIN "VariantAttribute" a ON a.id=av."attributeId" AND a.slug IN ('memory','configuration') WHERE v."productId"=$1 ORDER BY v."sortOrder"`,[p.id]);
    const byConfig=new Map(variants.map(v=>[v.memory,v]));
    for (const [oldLabel,newLabel] of [['512 ГБ',confLabels[0]],['1 ТБ',confLabels[1]]]) {
      const v=byConfig.get(oldLabel);
      if (!v) continue;
      await db.query(`DELETE FROM "ProductVariantOption" WHERE "variantId"=$1`,[v.id]);
      await db.query(`INSERT INTO "ProductVariantOption" ("variantId","attributeValueId") VALUES ($1,$2)`,[v.id,confValues.get(newLabel)]);
    }
    await db.query(`INSERT INTO "ProductVariantAttribute" ("productId","attributeId") VALUES ($1,$2) ON CONFLICT DO NOTHING`,[p.id,confAttr.id]);
    await db.query(`DELETE FROM "ProductVariantAttribute" WHERE "productId"=$1 AND "attributeId" IN (SELECT id FROM "VariantAttribute" WHERE slug='memory')`,[p.id]);
    if (!byConfig.has(confLabels[2])) {
      const existing1tb=byConfig.get('1 ТБ')??byConfig.get(confLabels[1]);
      if (!existing1tb) throw new Error(`Missing 1TB MacBook variant: ${slug}`);
      const vId=id();
      await db.query(`INSERT INTO "ProductVariant" (id,"productId","priceUsd",availability,"isDefault","sortOrder","updatedAt") VALUES ($1,$2,$3,'IN_STOCK',false,2,now())`,[vId,p.id,Number(existing1tb.priceUsd)+200]);
      await db.query(`INSERT INTO "ProductVariantOption" ("variantId","attributeValueId") VALUES ($1,$2)`,[vId,confValues.get(confLabels[2])]);
    }
    await db.query(`UPDATE "Product" SET "priceKind"='MARKET_ESTIMATE',"updatedAt"=now() WHERE id=$1`,[p.id]);
    const ramName=slug==='macbook-air-15-m5'?'Оперативная память':'Объединённая память';
    await db.query(`UPDATE "ProductSpec" SET value='16 или 24 ГБ объединённой памяти' WHERE "productId"=$1 AND name=$2`,[p.id,ramName]);
    await db.query(`UPDATE "ProductSpec" SET value='SSD 512 ГБ или 1 ТБ' WHERE "productId"=$1 AND name='Накопитель'`,[p.id]);
    await db.query(`UPDATE "Product" SET description=replace(description,'16 ГБ объединённой памяти','16 или 24 ГБ объединённой памяти') WHERE id=$1`,[p.id]);
  }
  for (const slug of ['ipad-11','ipad-air-11','ipad-air-13']) {
    const p=bySlug.get(slug);
    const exists=await one(`SELECT id FROM "ProductSpec" WHERE "productId"=$1 AND name='Связь'`,[p.id]);
    if (exists) await db.query(`UPDATE "ProductSpec" SET value='Только Wi-Fi' WHERE id=$1`,[exists.id]);
    else await db.query(`INSERT INTO "ProductSpec" (id,"productId",name,value,"sortOrder") VALUES ($1,$2,'Связь','Только Wi-Fi',20)`,[id(),p.id]);
  }
  const ap5=bySlug.get('airpods-5');
  await db.query(`UPDATE "Product" SET description='AirPods 5 — открытые наушники с обновлённым звуком и зарядным кейсом USB-C. Версия с активным шумоподавлением и беспроводной зарядкой представлена отдельно.',"updatedAt"=now() WHERE id=$1`,[ap5.id]);
  await db.query(`UPDATE "ProductSpec" SET value='Без активного шумоподавления' WHERE "productId"=$1 AND name='Шумоподавление'`,[ap5.id]);
  await db.query(`UPDATE "Product" SET name='AirPods Max (2024)',"updatedAt"=now() WHERE slug='airpods-max'`);
  await db.query(`UPDATE "Product" SET name='AirPods Max (2026)',description='Полноразмерные AirPods Max 2026 с активным шумоподавлением, адаптивным аудио, пространственным звуком и зарядкой USB-C.',availability='IN_STOCK',"updatedAt"=now() WHERE slug='airpods-max-2'`);
  if (!bySlug.has('airpods-pro-2')) {
    const category=await one(`SELECT id,"brandId" FROM "Category" WHERE slug='airpods'`);
    if (!category) throw new Error('AirPods category missing');
    const pId=id();
    await db.query(`INSERT INTO "Product" (id,slug,"categoryId","brandId",name,"shortDescription",description,"basePriceUsd","priceKind",availability,"sortOrder","updatedAt") VALUES ($1,'airpods-pro-2',$2,$3,'AirPods Pro 2 (USB-C)','Внутриканальные AirPods с активным шумоподавлением','AirPods Pro 2 с зарядным кейсом USB-C, активным шумоподавлением и режимом прозрачности.',219,'MARKET_ESTIMATE','IN_STOCK',5,now())`,[pId,category.id,category.brandId]);
    await db.query(`INSERT INTO "ProductImage" (id,"productId",url,alt,"sortOrder","isMain") VALUES ($1,$2,'/media/catalog/products/airpods-pro-2.webp','AirPods Pro 2 (USB-C)',0,true)`,[id(),pId]);
    for (const [sort,[name,value]] of [['Тип','Внутриканальные наушники'],['Чип','Apple H2'],['Шумоподавление','Активное (ANC)'],['Кейс','USB-C, беспроводная зарядка Qi']].entries()) {
      await db.query(`INSERT INTO "ProductSpec" (id,"productId",name,value,"sortOrder") VALUES ($1,$2,$3,$4,$5)`,[id(),pId,name,value,sort]);
    }
  }
  await db.query('COMMIT');
  console.log(`Applied client Apple assortment. Backup: ${backupPath}`);
} catch(error) {
  await db.query('ROLLBACK').catch(()=>{});
  throw error;
} finally { await db.end(); }
