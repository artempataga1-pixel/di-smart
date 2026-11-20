import { config } from "dotenv";
import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { chromium, devices, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import manifest from "../../prisma/samsung-color-images.json";
config({ path: ".env.local", quiet: true }); config({ quiet: true });
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3110";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const output = "docs/catalog/samsung-colors-verification-2026-10-02";
async function main() {
  await mkdir(output, { recursive: true });
  const products = await db.product.findMany({ where: { slug: { in: Object.keys(manifest) } },
    include: { images: true, variants: true, colorValues: { include: { attributeValue: true, offers: true } } } });
  assert.equal(products.length, 27);
  const inventory = JSON.parse(await readFile("docs/catalog/samsung-color-inventory-2026-10-02.json", "utf8"));
  for (const product of products) {
    const original = inventory.find((p: { id: string }) => p.id === product.id);
    const prices = (p: typeof product) => p.variants.map(v => ({ id: v.id, priceUsd: String(v.priceUsd), priceByn: v.priceByn === null ? null : String(v.priceByn), availability: v.availability })).sort((a, b) => a.id.localeCompare(b.id));
    // The inventory did not capture variants; compare them against the mandatory before-sync snapshot below.
    const colors: Record<string, string> = manifest[product.slug as keyof typeof manifest];
    assert.deepEqual(product.colorValues.map(c => c.id).sort(), original.colorValues.map((c: { id: string }) => c.id).sort());
    for (const color of product.colorValues) {
      const images = product.images.filter(i => i.colorValueId === color.id);
      assert.equal(images.length, 1);
      assert.equal(images[0].url, colors[color.attributeValue.value]);
    }
    if (process.env.SAMSUNG_COLOR_BACKUP) {
      const snapshot = JSON.parse(await readFile(process.env.SAMSUNG_COLOR_BACKUP, "utf8"));
      const before = snapshot.products.find((p: { id: string }) => p.id === product.id);
      assert.deepEqual(prices(product), prices(before));
      assert.deepEqual(product.colorValues.map(c => ({ id: c.id, offers: c.offers })).sort((a, b) => a.id.localeCompare(b.id)),
        before.colorValues.map((c: { id: string; offers: unknown[] }) => ({ id: c.id, offers: c.offers })).sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id)));
    }
  }
  const browser = await chromium.launch();
  const errors: string[] = [];
  const results: unknown[] = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => localStorage.setItem("di-smart-analytics-consent-v3", "rejected"));
    const page = await context.newPage(); page.setDefaultTimeout(20_000);
    page.on("pageerror", e => errors.push(e.message));
    for (const [slug, colors] of Object.entries(manifest)) {
      console.log("CHECK", slug);
      const response = await page.goto(`${base}/product/${slug}`, { waitUntil: "networkidle", timeout: 120_000 });
      assert.equal(response?.status(), 200);
      const main = page.getByRole("main");
      const product = products.find(p => p.slug === slug)!;
      for (const [name, url] of Object.entries(colors)) {
        const radio = main.getByRole("radio", { name, exact: true }).and(main.locator('[id^="product-color-"]'));
        // SSR can expose the colour buttons before React has attached their handlers.
        await expect.poll(() => radio.evaluate(element => Object.entries(element).some(([key, value]) =>
          key.startsWith("__reactProps$") && typeof (value as { onClick?: unknown }).onClick === "function"
        ))).toBe(true);
        await radio.click(); await expect(radio).toHaveAttribute("aria-checked", "true");
        if (Object.keys(colors).length > 1) {
          const image = main.getByRole("img", { name: `${product.name}, выбранный цвет`, exact: true });
          await expect(image).toHaveAttribute("src", url);
          await expect.poll(() => image.evaluate(i => (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
          await expect(image).toHaveCSS("opacity", "1");
        }
      }
      results.push({ slug, colors: Object.keys(colors), status: "pass" });
      console.log("PASS", slug, Object.keys(colors).length, "colors");
    }
    await context.close();
    const mobile = await browser.newContext({ ...devices["iPhone 13"] });
    await mobile.addInitScript(() => localStorage.setItem("di-smart-analytics-consent-v3", "rejected"));
    const phone = await mobile.newPage(); phone.on("pageerror", e => errors.push(e.message));
    for (const slug of ["galaxy-s26", "galaxy-tab-a11", "galaxy-buds4-pro"]) {
      await phone.goto(`${base}/product/${slug}`, { waitUntil: "networkidle" });
      const colors: Record<string, string> = manifest[slug as keyof typeof manifest];
      const product = products.find(p => p.slug === slug)!;
      for (const [name, url] of Object.entries(colors)) {
        const radio = phone.getByRole("main").getByRole("radio", { name, exact: true }).and(phone.locator('[id^="product-color-"]'));
        await expect.poll(() => radio.evaluate(element => Object.entries(element).some(([key, value]) =>
          key.startsWith("__reactProps$") && typeof (value as { onClick?: unknown }).onClick === "function"
        ))).toBe(true);
        await radio.click();
        await expect(radio).toHaveAttribute("aria-checked", "true");
        const image = phone.getByRole("main").getByRole("img", { name: `${product.name}, выбранный цвет`, exact: true });
        await expect(image).toHaveAttribute("src", url);
        await expect.poll(() => image.evaluate(i => (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }
      assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      await phone.screenshot({ path: `${output}/${slug}-mobile.png`, fullPage: true, timeout: 10_000 });
      console.log("PASS mobile", slug);
    }
    await mobile.close();
    assert.deepEqual(errors, []);
    await writeFile(`${output}/results.json`, JSON.stringify({ products: 27, colors: 74, results, mobilePages: 3, browserErrors: errors }, null, 2));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
