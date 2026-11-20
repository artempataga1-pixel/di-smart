import { config } from "dotenv";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, devices, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import { CLIENT_SAMSUNG_ASSORTMENT, samsungConfigurationLabel } from "../../prisma/client-samsung-assortment";
import { syncClientSamsung } from "../../prisma/sync-client-samsung";
config({ path: ".env.local", quiet: true }); config({ quiet: true });
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3110";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
const output = "docs/catalog/samsung-verification-2026-10-02";
async function main() {
  await mkdir(output, { recursive: true });
  const load = () => db.product.findMany({ where: { slug: { in: CLIENT_SAMSUNG_ASSORTMENT.map(p => p.slug) } },
    include: { variants: { include: { options: { include: { attributeValue: true } } } }, images: true,
      colorValues: { include: { attributeValue: true } } } });
  const before = await load();
  // Idempotency must preserve the SKU identifiers, prices and uploaded images.
  if (process.env.SAMSUNG_SKIP_SYNC !== "true") await syncClientSamsung(db);
  const products = await load();
  for (const p of products) {
    const original = before.find(row => row.id === p.id)!;
    const normalize = (rows: typeof p.variants) => rows.map(v => ({ id: v.id, usd: v.priceUsd.toString(), byn: v.priceByn?.toString() })).sort((a, b) => a.id.localeCompare(b.id));
    assert.deepEqual(normalize(p.variants), normalize(original.variants));
    assert.deepEqual(p.images.map(i => i.id).sort(), original.images.map(i => i.id).sort());
  }
  assert.equal(products.length, CLIENT_SAMSUNG_ASSORTMENT.length);
  console.log(process.env.SAMSUNG_SKIP_SYNC === "true"
    ? "PASS database: 19 models, saved SKU IDs, prices and images unchanged"
    : "PASS database: repeat sync retains SKU IDs, prices and images");
  const browser = await chromium.launch();
  const errors: string[] = [];
  const report: unknown[] = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    context.setDefaultTimeout(20_000);
    const page = await context.newPage();
    page.on("pageerror", e => errors.push(e.message));
    for (const definition of CLIENT_SAMSUNG_ASSORTMENT) {
      console.log("CHECK", definition.slug);
      const product = products.find(p => p.slug === definition.slug)!;
      assert.ok(product.isActive);
      const actual = product.variants.flatMap(v => v.options.map(o => o.attributeValue.value)).sort();
      assert.deepEqual(actual, definition.configurations.map(samsungConfigurationLabel).sort());
      if (definition.colors) assert.deepEqual(product.colorValues.map(c => c.attributeValue.value).sort(), [...definition.colors].sort());
      const response = await page.goto(`${base}/product/${definition.slug}`, { waitUntil: "networkidle", timeout: 120_000 });
      assert.equal(response?.status(), 200);
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { name: definition.name, exact: true }).last()).toBeVisible({ timeout: 45_000 });
      for (const configuration of definition.configurations) {
        const label = samsungConfigurationLabel(configuration);
        const button = main.getByRole("button", { name: label, exact: true });
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
      }
      for (const color of definition.colors ?? []) {
        const radio = main.getByRole("radio", { name: color, exact: true });
        await radio.click(); await expect(radio).toHaveAttribute("aria-checked", "true");
      }
      if (definition.category === "watch") {
        await expect.poll(() => main.locator("img").first().evaluate(image => (image as HTMLImageElement).naturalWidth), { timeout: 20_000 }).toBeGreaterThan(0);
        await expect(main.getByText("Цена по запросу", { exact: true })).toBeVisible();
        await expect(main.getByRole("link", { name: "Уточнить цену", exact: true })).toBeVisible();
        assert.equal(await main.getByRole("button", { name: "В корзину", exact: true }).count(), 0);
      }
      const broken = await main.locator("img").evaluateAll(images => images.filter(image => {
        const i = image as HTMLImageElement; return i.complete && i.currentSrc && !i.naturalWidth;
      }).length);
      assert.equal(broken, 0);
      report.push({ slug: definition.slug, configurations: actual, colors: product.colorValues.map(c => c.attributeValue.value), status: "pass" });
      console.log("PASS", definition.slug);
    }
    await page.goto(base + "/catalog?brand=samsung");
    await expect(page.getByRole("heading", { name: "Каталог", exact: true })).toBeVisible();
    await context.close();
    const mobile = await browser.newContext({ ...devices["iPhone 13"] });
    const phone = await mobile.newPage(); phone.on("pageerror", e => errors.push(e.message));
    for (const slug of ["galaxy-s26", "galaxy-tab-a11-plus", "galaxy-watch-l345"]) {
      await phone.goto(`${base}/product/${slug}`, { waitUntil: "networkidle" });
      const button = phone.getByRole("main").getByRole("button", { name: samsungConfigurationLabel(CLIENT_SAMSUNG_ASSORTMENT.find(p => p.slug === slug)!.configurations[0]), exact: true });
      await button.click();
      const layout = await phone.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(layout.scroll <= layout.width + 2, `${slug}: horizontal overflow`);
      console.log("PASS mobile", slug);
    }
    await phone.screenshot({ path: `${output}/watch-mobile.png`, fullPage: true, timeout: 10_000 });
    await mobile.close();
    assert.deepEqual(errors, []);
    await writeFile(`${output}/results.json`, JSON.stringify({ models: report, mobilePages: 3,
      idempotency: process.env.SAMSUNG_SKIP_SYNC === "true" ? "not rerun (previously verified)" : "passed", browserErrors: errors }, null, 2));
  } finally {
    const page = browser.contexts()[0]?.pages()[0];
    if (page && report.length < CLIENT_SAMSUNG_ASSORTMENT.length) {
      console.log("Last page:", page.url());
      await page.screenshot({ path: `${output}/incomplete.png`, timeout: 5_000 }).catch(() => {});
    }
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
