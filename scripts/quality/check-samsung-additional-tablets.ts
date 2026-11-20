import assert from "node:assert/strict";
import { config } from "dotenv";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium, devices, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";
import { CLIENT_SAMSUNG_ASSORTMENT, samsungConfigurationLabel } from "../../prisma/client-samsung-assortment";
import manifest from "../../prisma/samsung-color-images.json";
config({ path: ".env.local", quiet: true }); config({ quiet: true });
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3110";
const additions = CLIENT_SAMSUNG_ASSORTMENT.filter(p => ["galaxy-tab-s10-fe-plus", "galaxy-tab-s10-lite", "galaxy-tab-s10-plus", "galaxy-tab-s11", "galaxy-tab-s11-ultra"].includes(p.slug));
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
async function main() {
  const products = await db.product.findMany({ where: { slug: { in: CLIENT_SAMSUNG_ASSORTMENT.map(p => p.slug) } },
    include: { variants: { include: { options: { include: { attributeValue: true } } } }, colorValues: { include: { attributeValue: true } }, images: true } });
  for (const def of additions) {
    const p = products.find(p => p.slug === def.slug)!;
    assert.ok(p?.isActive, def.slug);
    assert.deepEqual(p.variants.flatMap(v => v.options.map(o => o.attributeValue.value)).sort(), def.configurations.map(samsungConfigurationLabel).sort());
    assert.deepEqual(p.colorValues.map(c => c.attributeValue.value).sort(), [...def.colors!].sort());
    for (const color of p.colorValues) {
      const images = p.images.filter(i => i.colorValueId === color.id);
      assert.equal(images.length, 1);
      assert.equal(images[0].url, (manifest[def.slug as keyof typeof manifest] as Record<string, string>)[color.attributeValue.value]);
    }
  }
  if (process.env.SAMSUNG_ASSORTMENT_BACKUP) {
    const before = JSON.parse(await readFile(process.env.SAMSUNG_ASSORTMENT_BACKUP, "utf8"));
    for (const p of products) {
      const old = before.products.find((row: { id: string }) => row.id === p.id);
      if (!old) continue;
      for (const v of p.variants) {
        const previous = old.variants.find((row: { id: string }) => row.id === v.id);
        if (previous) {
          assert.equal(String(v.priceUsd), previous.priceUsd);
          assert.equal(v.priceByn?.toString() ?? null, previous.priceByn);
        }
      }
      if (["galaxy-tab-s11", "galaxy-tab-s11-ultra"].includes(p.slug)) {
        assert.deepEqual(p.colorValues.map(c => c.id).sort(), old.colorValues.map((c: { id: string }) => c.id).sort());
        assert.deepEqual(p.images.map(i => i.id).sort(), old.images.map((i: { id: string }) => i.id).sort());
      }
    }
  }
  console.log("PASS database: 5 tablets, 14 configurations, 12 colours; retained prices and S11 photo/colour IDs");
  const files = [...new Set(Object.values(manifest).flatMap(Object.values))];
  for (const url of files) {
    const r = await fetch(base + url, { signal: AbortSignal.timeout(30_000) });
    assert.equal(r.status, 200, url);
    assert.ok(r.headers.get("content-type")?.startsWith("image/"));
    assert.ok(Buffer.from(await r.arrayBuffer()).equals(await readFile("public" + url)), url);
  }
  console.log("PASS", files.length, "published image assets");
  const browser = await chromium.launch();
  const errors: string[] = [];
  const results: unknown[] = [];
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext(mobile ? devices["iPhone 13"] : { viewport: { width: 1440, height: 1000 } });
      await context.addInitScript(() => localStorage.setItem("di-smart-analytics-consent-v3", "rejected"));
      const page = await context.newPage();
      page.on("pageerror", e => errors.push(e.message));
      for (const def of additions) {
        const r = await page.goto(base + "/product/" + def.slug, { waitUntil: "networkidle", timeout: 90_000 });
        assert.equal(r?.status(), 200);
        const main = page.getByRole("main");
        await expect(main.getByRole("heading", { name: def.name, exact: true }).last()).toBeVisible();
        for (const configuration of def.configurations) {
          const button = main.getByRole("button", { name: samsungConfigurationLabel(configuration), exact: true });
          await expect.poll(() => button.evaluate(el => Object.entries(el).some(([k, v]) => k.startsWith("__reactProps$") && typeof v?.onClick === "function")), { timeout: 15_000 }).toBe(true);
          await button.click();
          await expect(button).toHaveAttribute("aria-pressed", "true");
        }
        for (const color of def.colors!) {
          const radio = main.getByRole("radio", { name: color, exact: true }).and(main.locator('[id^="product-color-"]'));
          await radio.click();
          await expect(radio).toHaveAttribute("aria-checked", "true");
          const image = main.getByRole("img", { name: /, выбранный цвет$/ });
          const url = (manifest[def.slug as keyof typeof manifest] as Record<string, string>)[color];
          await expect(image).toHaveAttribute("src", url);
          await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
          await expect(image).toHaveCSS("opacity", "1");
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        results.push({ slug: def.slug, mobile, configurations: def.configurations.length, colors: def.colors!.length });
        console.log("PASS", mobile ? "mobile" : "desktop", def.slug);
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    // Resolve only: this endpoint does not submit an order or notify Telegram.
    const cartItems = additions.flatMap(def => {
      const p = products.find(p => p.slug === def.slug)!;
      return p.variants.filter(v => v.options.length).map(v => ({ productId: p.id, variantId: v.id, colorValueId: p.colorValues[0].id, qty: 1 }));
    });
    const r = await fetch(base + "/api/cart/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cartItems }) });
    assert.equal(r.status, 200);
    const cart = await r.json();
    assert.equal(cart.items.length, 14);
    for (const item of cart.items) {
      const p = products.find(p => p.id === item.productId)!;
      const v = p.variants.find(v => v.id === item.variantId)!;
      const color = p.colorValues.find(c => c.id === item.colorValueId)!;
      assert.equal(item.variantLabel, v.options[0].attributeValue.value);
      assert.equal(item.colorName, color.attributeValue.value);
      assert.equal(item.imageUrl, p.images.find(i => i.colorValueId === color.id)!.url);
    }
    await mkdir("docs/catalog", { recursive: true });
    await writeFile("docs/catalog/samsung-additional-tablets-verification-2026-10-02.json", JSON.stringify({ base, assets: files.length, results, cartConfigurations: cart.items.length, errors }, null, 2));
    console.log("COMPLETE");
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => db.$disconnect());
