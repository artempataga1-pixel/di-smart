import "dotenv/config";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium, devices, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";

// This test writes orders and edits products. Never run against a live shop.
const url = new URL(process.env.DATABASE_URL ?? "");
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3110";
assert.equal(url.protocol, "mysql:");
assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
assert.ok(url.pathname.includes("test"), "Use a disposable test database");
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
assert.equal(process.env.TELEGRAM_BOT_TOKEN, "", "Disable real notifications");
assert.equal(process.env.TELEGRAM_CHAT_IDS, "");
const output = process.env.MYSQL_TEST_OUTPUT ?? "/tmp/di-smart-mysql-test/browser";
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
const results: unknown[] = [];

async function main() {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
  try {
    const routes = ["/", "/catalog", "/catalog?q=iphone", "/product/iphone-17-pro-max",
      "/iphone-18-pro", "/galaxy-s26-ultra", "/airpods-pro-3", "/ipad-pro-m5", "/cart", "/contacts"];
    for (const mode of process.env.MYSQL_TEST_SKIP_PAGES === "true" ? [] : ["desktop", "mobile"] as const) {
      const context = await browser.newContext(mode === "mobile" ? { ...devices["iPhone 13"] } : { viewport: { width: 1440, height: 1000 } });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      for (const route of routes) {
        const start = Date.now();
        const response = await page.goto(base + route, { waitUntil: "networkidle", timeout: 60_000 });
        assert.equal(response?.status(), 200, `${mode} ${route}`);
        if (route === "/cart") await expect(page.getByText("Корзина пуста", { exact: true })).toBeVisible();
        else await expect(page.locator("main h1, main h2").first()).toBeVisible();
        const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
          brokenImages: [...document.images].filter(i => i.complete && i.currentSrc && i.naturalWidth === 0).map(i => i.currentSrc) }));
        assert.deepEqual(layout.brokenImages, [], `${mode} ${route}: broken images`);
        assert.ok(layout.scroll <= layout.width + 2, `${mode} ${route}: horizontal overflow ${layout.scroll}/${layout.width}`);
        results.push({ mode, route, elapsedMs: Date.now() - start, ...layout });
        console.log(`PASS ${mode} ${route}`);
      }
      await page.screenshot({ path: `${output}/${mode}.png`, fullPage: false });
      assert.deepEqual(errors, [], `${mode}: browser exceptions`);
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base + "/product/iphone-17-pro-max");
    const price = page.getByRole("main").getByTestId("product-price");
    const before = await price.innerText();
    await page.getByRole("button", { name: "256 ГБ", exact: true }).click();
    await expect(price).not.toHaveText(before);
    await page.getByRole("main").getByRole("button", { name: "В корзину", exact: true }).click();
    await page.goto(base + "/cart");
    const name = `MySQL browser test ${Date.now()}`;
    await page.getByPlaceholder("Как к вам обращаться").fill(name);
    await page.getByPlaceholder("+375 (XX) XXX-XX-XX").fill("291234567");
    for (const box of await page.getByRole("checkbox").all()) await box.check();
    const responsePromise = page.waitForResponse(r => r.url().endsWith("/api/order") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Отправить заявку", exact: true }).click();
    const response = await responsePromise;
    const payload = response.request().postDataJSON();
    const body = await response.json();
    assert.equal(body.ok, true, JSON.stringify(body));
    await expect(page.getByRole("heading", { name: "Тестовая заявка сохранена" })).toBeVisible();
    const order = await db.order.findUniqueOrThrow({ where: { id: body.orderId }, include: { items: true } });
    assert.equal(order.name, name);
    assert.equal(order.items.length, 1);
    assert.ok(order.items[0].variantLabelSnapshot?.includes("256 ГБ"));
    assert.equal(order.totalByn.toNumber(), payload.expectedTotalByn);
    const repeated = await context.request.post(base + "/api/order", { data: payload });
    assert.equal((await repeated.json()).orderId, order.id);
    assert.equal(await db.order.count({ where: { name } }), 1);
    results.push({ check: "variant, checkout, exact total, database persistence, idempotency", orderId: order.id });
    console.log("PASS real checkout and idempotent replay");

    await page.goto(base + "/admin/login");
    await page.getByLabel("Логин").fill(process.env.ADMIN_LOGIN!);
    await page.getByLabel("Пароль", { exact: true }).fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await page.waitForURL(base + "/admin");
    for (const route of ["/admin", "/admin/products", "/admin/categories", "/admin/brands", "/admin/orders", `/admin/orders/${order.id}`, "/admin/settings"]) {
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200);
      await expect(page.locator("h1").first()).toBeVisible();
      console.log(`PASS ${route}`);
    }
    const product = await db.product.findUniqueOrThrow({ where: { slug: "iphone-17-pro-max" } });
    await page.goto(`${base}/admin/products/${product.id}`);
    const testDescription = `MySQL browser verified ${Date.now()}`;
    const form = page.locator("#basic form");
    await form.locator('[name="description"]').fill(testDescription);
    await Promise.all([
      page.waitForResponse(r => r.url().includes(`/admin/products/${product.id}`) && r.request().method() === "POST"),
      form.getByRole("button", { name: "Сохранить", exact: true }).click(),
    ]);
    await expect(form.locator('[name="description"]')).toHaveValue(testDescription);
    assert.equal((await db.product.findUniqueOrThrow({ where: { id: product.id } })).description, testDescription);
    await page.goto(`${base}/product/${product.slug}`);
    await expect(page.getByText(testDescription, { exact: true })).toBeVisible();
    await db.product.update({ where: { id: product.id }, data: { description: product.description } });
    results.push({ check: "admin login, pages, product save and storefront visibility" });
    console.log("PASS admin save persisted and visible in storefront");

    await page.goto(`${base}/admin/products/${product.id}#photos`);
    const imageIds = (await db.productImage.findMany({ where: { productId: product.id } })).map(image => image.id);
    const source = await readFile("public/media/catalog/products/iphone-18-pro.webp");
    await page.locator('#photos input[type="file"]').setInputFiles({ name: "mysql-test.webp", mimeType: "image/webp", buffer: source });
    await Promise.all([
      page.waitForResponse(r => r.url().includes(`/admin/products/${product.id}`) && r.request().method() === "POST"),
      page.locator("#photos").getByRole("button", { name: "Загрузить", exact: true }).click(),
    ]);
    const image = await db.productImage.findFirstOrThrow({ where: { productId: product.id, id: { notIn: imageIds } } });
    const imageResponse = await context.request.get(base + image.url);
    assert.equal(imageResponse.status(), 200);
    assert.deepEqual(await imageResponse.body(), source, "Uploaded original bytes must be preserved");
    const deleteForm = page.locator("#photos form").filter({ has: page.locator(`input[name="id"][value="${image.id}"]`) });
    await Promise.all([
      page.waitForResponse(r => r.url().includes(`/admin/products/${product.id}`) && r.request().method() === "POST"),
      deleteForm.getByRole("button", { name: "Удалить", exact: true }).click(),
    ]);
    assert.equal(await db.productImage.findUnique({ where: { id: image.id } }), null);
    assert.equal((await context.request.get(base + image.url)).status(), 404);
    results.push({ check: "admin image upload, original bytes, public delivery and deletion" });
    console.log("PASS real image upload and deletion");

    await page.goto(base + "/galaxy-s26-ultra");
    const viewer = page.getByRole("region", { name: "Вращаемая модель Galaxy S26 Ultra" });
    await viewer.scrollIntoViewIfNeeded();
    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Загружаем Galaxy…", { exact: true })).toHaveCount(0, { timeout: 30_000 });
    await expect(page.getByText("Не удалось загрузить 3D.", { exact: false })).toHaveCount(0);
    await page.getByRole("button", { name: "Вид спереди", exact: true }).click();
    await page.getByRole("button", { name: "Вид сзади", exact: true }).click();
    await page.screenshot({ path: `${output}/galaxy-3d.png` });
    const videos = await page.locator("video").evaluateAll(elements => elements.map(element => {
      const v = element as HTMLVideoElement;
      return { src: v.currentSrc, readyState: v.readyState, error: v.error?.code ?? null };
    }));
    assert.ok(videos.some(v => v.readyState >= 2), "At least one Galaxy video must be decoded");
    assert.ok(videos.every(v => v.error === null), "Video decoding error");
    results.push({ check: "Galaxy canvas, loaded model, controls and video decoding", videos });
    assert.deepEqual(errors, []);
    console.log("PASS 3D model controls and decoded video");
    await context.close();
  } finally {
    await browser.close();
    await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => db.$disconnect());
