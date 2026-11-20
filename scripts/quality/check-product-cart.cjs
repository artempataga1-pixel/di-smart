const { chromium, devices } = require(process.cwd() + '/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const masters = require(process.cwd() + '/src/constants/content/photo-masters.json');

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3031';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Use a local test server');

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    const errors = [];
    let attemptedOrders = 0;
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/order', async route => { attemptedOrders++; await route.abort(); });

    await page.goto(base + '/iphone-18-pro#buy', { waitUntil: 'domcontentloaded' });
    const buy = page.locator('#buy');
    await buy.getByRole('radio', { name: 'Чёрный', exact: true }).click();
    const increase = buy.getByRole('button', { name: 'Увеличить количество', exact: true });
    for (let i = 1; i < 20; i++) await increase.click();
    assert.equal(await increase.isDisabled(), true, 'Quantity must stop at 20');
    await buy.getByRole('button', { name: 'В корзину', exact: true }).click();
    await page.getByRole('heading', { name: 'Корзина', exact: true }).waitFor();
    const photo = page.getByRole('img', { name: 'iPhone 18 Pro', exact: true });
    await photo.waitFor();
    const selectedImage = '/media/catalog/apple-official-2026/iphone-18-pro-black.webp';
    const expected = masters[selectedImage] || selectedImage;
    assert.ok(decodeURIComponent(await photo.getAttribute('src')).includes(expected), 'Cart must show the black finish');
    assert.equal(await page.getByRole('button', { name: 'Увеличить количество', exact: true }).last().isDisabled(), true);
    const unauthorized = await context.request.get(base + '/admin/products', { maxRedirects: 0 });
    assert.equal(unauthorized.status(), 307);
    assert.ok(unauthorized.headers().location.endsWith('/admin/login'));
    assert.equal(attemptedOrders, 0);
    assert.deepEqual(errors, []);
    if (process.env.AUDIT_SCREENSHOT) await page.screenshot({ path: process.env.AUDIT_SCREENSHOT });
    console.log('PASS: quantity limit 20, selected black cart photo, admin redirect, no JS errors and no order requests');
    await context.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
