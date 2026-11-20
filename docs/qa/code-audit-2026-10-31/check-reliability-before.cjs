const { chromium, devices } = require(process.cwd() + '/node_modules/@playwright/test');
const assert = require('node:assert/strict');
// Run against a local dev server. All cart/order responses are mocked.
const base = process.env.RELIABILITY_BASE_URL || 'http://127.0.0.1:3110';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Use a local test server');
(async () => {
 const browser = await chromium.launch();
 const context = await browser.newContext({...devices['iPhone 13']});
 const page = await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 // API substitutes only: no writes to shop database and no notifications.
 const item={productId:'test-product',variantId:null,colorValueId:null,quantity:1};
 await page.addInitScript(item => localStorage.setItem('di-smart-cart-v1',JSON.stringify([item])), item);
 let failResolve=true, orderCalls=[];
 await page.route('**/api/cart/resolve', async route => {
  if(failResolve) return route.fulfill({status:503,json:{error:'service_unavailable'}});
  const body=route.request().postDataJSON();
  await route.fulfill({json:{items:body.items.map(i=>({...item,quantity:i.qty,slug:'test-product',name:'Тестовый товар',priceByn:100,availability:'IN_STOCK',variantLabel:null,colorName:null,imageUrl:null}))}});
 });
 await page.route('**/api/order',async route=>{
  orderCalls.push(route.request().postDataJSON());
  if(orderCalls.length===1) return route.fulfill({status:400,json:{ok:false,error:'cart_items_unavailable'}});
  if(orderCalls.length===2) return route.abort('failed');
  return route.fulfill({json:{ok:true,orderId:'TEST-ONLY'}});
 });
 await page.goto(base+'/cart',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Повторить',exact:true}).waitFor();
 failResolve=false;
 await page.getByRole('button',{name:'Повторить',exact:true}).click();
 await page.getByText('Тестовый товар',{exact:true}).waitFor();
 await page.getByPlaceholder('Как к вам обращаться').fill('Проверка');
 await page.getByPlaceholder('+375 (XX) XXX-XX-XX').fill('291234567');
 await page.getByRole('button',{name:'Отправить заявку'}).click();
 await page.getByText('Некоторые товары в корзине больше недоступны. Обновите корзину и попробуйте снова.').waitFor();
 await page.getByRole('button',{name:'Отправить заявку'}).click();
 await page.getByText('Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.').waitFor();
 await page.getByRole('button',{name:'Отправить заявку'}).click();
 await page.getByRole('heading',{name:'Заявка отправлена'}).waitFor();
 assert.equal(orderCalls.length,3);
 assert.ok(orderCalls[0].idempotencyKey);
 assert.equal(orderCalls[1].idempotencyKey,orderCalls[2].idempotencyKey);
 assert.equal(orderCalls[2].expectedTotalByn,100);
 console.log('PASS: mobile cart recovery, actionable HTTP 400, stable key after network failure, expected total, success UI');
 await context.close();
 const blocked=await browser.newContext();const p=await blocked.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('blocked storage')}}));
 await p.goto(base+'/cart',{waitUntil:'domcontentloaded'});
 await p.getByText('Корзина пуста',{exact:true}).waitFor();
 console.log('PASS: unavailable localStorage does not crash cart');
 assert.deepEqual(errors,[]);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
