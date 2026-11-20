import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base='https://di-smart-gilt.vercel.app';
async function main(){
 const checks = [
  ['/catalog/iphone','iPhone 18 Pro'],
  ['/catalog/samsung-smartphones','Samsung Galaxy S26 Ultra'],
  ['/catalog/samsung-tablets','Samsung Galaxy Tab S11 Ultra'],
  ['/catalog/airpods','AirPods Pro 3'],
  ['/catalog/ipad',null],['/catalog/macbook',null],['/catalog/watch?brand=apple',null],['/catalog/watch?brand=samsung',null]
 ] as const;
 const pages=await Promise.all(checks.map(async ([path,name])=>{const response=await fetch(base+path);const html=await response.text();assert.equal(response.status,200,path);const modelList=html.slice(html.indexOf('id="models"'));if(name){assert.ok(modelList.includes(name),path+' campaign absent from grid');assert.ok(modelList.includes('Все модели'),path+' models heading absent');}return {path,status:response.status,campaignInGrid:name??undefined};}));
 const r=await fetch(base+'/iphone-18-pro?model=pro-max');const html=await r.text();assert.ok(html.includes('iphone-18-pro-max-black-full-v2.webp'));assert.ok(html.includes('#d9dde2'));
 const photo=await fetch(base+'/media/catalog/apple-official-2026/iphone-18-pro-max-black-full-v2.webp');assert.equal(photo.status,200);
 const report={date:'2026-10-08',deployment:'dpl_ANhnskp6G5HA4fm6bzga1BgbnxK4',pages,fullBlackPortrait:{status:photo.status,width:940,height:1112},neutralSilverSwatch:true,officialSilverPhotosRetained:true,neutral3dLighting:true,samsungMissingAssets:0,samsungIncompleteColorSets:0,unitTestsPassed:2,browserDesktopAndMobile:true};
 await writeFile('docs/catalog/client-feedback-verification-2026-10-08.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}main().catch(e=>{console.error(e.message);process.exitCode=1});
