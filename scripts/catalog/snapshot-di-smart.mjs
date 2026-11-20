#!/usr/bin/env node
/**
 * Read-only snapshot of the public di-smart.by WooCommerce Store API.
 *
 * Usage: node scripts/catalog/snapshot-di-smart.mjs
 *        node scripts/catalog/snapshot-di-smart.mjs --no-html
 *        node scripts/catalog/snapshot-di-smart.mjs --output /tmp/di-smart.json
 *
 * Never calls a mutation endpoint or the local product database. The source
 * occasionally advertises USD in JSON while displaying prices in rubles;
 * this script records both fields and does not silently convert currency.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ORIGIN = "https://di-smart.by";
const API = `${ORIGIN}/wp-json/wc/store/v1/products`;
const DEFAULT_OUTPUT = `docs/catalog/source-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
if (outputIndex >= 0 && !args[outputIndex + 1]) {
  throw new Error("--output requires a file path");
}
const outputPath = resolve(outputIndex < 0 ? DEFAULT_OUTPUT : args[outputIndex + 1]);
const fetchHtml = !args.includes("--no-html");
const LIMIT = 100;
let lastRequestAt = 0;

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

async function get(url, accept = "application/json") {
  // At most two starts per second, including retries. This is intentionally
  // conservative for a small independent shop's live WooCommerce server.
  const gap = Math.max(0, 500 - (Date.now() - lastRequestAt));
  if (gap) await wait(gap);
  lastRequestAt = Date.now();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: accept, "User-Agent": "DI-Smart catalog audit/1.0 (read-only)" },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
      return response;
    } catch (error) {
      if (attempt === 2) throw error;
      await wait(1000 * 2 ** attempt);
    }
  }
}

function decodeHtml(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#34;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code)));
}

function textFromHtml(value = "") {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function amount(minorValue, minorUnit) {
  if (minorValue == null || minorValue === "") return null;
  const value = Number(minorValue) / 10 ** minorUnit;
  return Number.isFinite(value) ? value : null;
}

function normalizeLabel(value) {
  return decodeHtml(value)
    .normalize("NFKC")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/\bapple\s+(?=iphone|macbook|ipad|airpods|watch|vision)/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicateKey(value) {
  return normalizeLabel(value).toLocaleLowerCase("en-US").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function parseVariations(html) {
  const marker = 'data-product_variations="';
  const start = html.indexOf(marker);
  if (start < 0) return { variations: [], state: "absent" };
  const from = start + marker.length;
  const end = html.indexOf('"', from);
  if (end < 0) return { variations: [], state: "malformed" };
  const encoded = html.slice(from, end);
  if (encoded === "false") return { variations: [], state: "ajax" };
  try {
    const parsed = JSON.parse(decodeHtml(encoded));
    if (!Array.isArray(parsed)) return { variations: [], state: "malformed" };
    return {
      state: "embedded",
      variations: parsed.map((variant) => ({
        id: variant.variation_id,
        attributes: variant.attributes ?? {},
        priceByn: Number.isFinite(variant.display_price) ? variant.display_price : null,
        regularPriceByn: Number.isFinite(variant.display_regular_price) ? variant.display_regular_price : null,
        inStock: variant.is_in_stock ?? null,
        purchasable: variant.is_purchasable ?? null,
        availability: textFromHtml(variant.availability_html),
        imageUrl: variant.image?.src ?? null,
      })),
    };
  } catch {
    return { variations: [], state: "malformed" };
  }
}

const products = [];
let page = 1;
let totalPages = 1;
do {
  const url = new URL(API);
  url.searchParams.set("per_page", String(LIMIT));
  url.searchParams.set("page", String(page));
  const response = await get(url);
  totalPages = Number(response.headers.get("x-wp-totalpages") || 1);
  const batch = await response.json();
  if (!Array.isArray(batch)) throw new Error(`Unexpected API response on page ${page}`);
  products.push(...batch);
  process.stderr.write(`API page ${page}/${totalPages}: ${batch.length} products\n`);
  page++;
} while (page <= totalPages);

const snapshot = [];
for (const [index, product] of products.entries()) {
  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  let variationData = { variations: [], state: "not-applicable" };
  if (fetchHtml && product.has_options) {
    try {
      const response = await get(product.permalink, "text/html");
      variationData = parseVariations(await response.text());
    } catch (error) {
      variationData = { variations: [], state: `fetch-error: ${error.message}` };
    }
  } else if (product.has_options) {
    variationData.state = "not-fetched";
  }
  snapshot.push({
    id: product.id,
    name: product.name,
    normalizedName: normalizeLabel(product.name),
    slug: product.slug,
    url: product.permalink,
    sku: product.sku || null,
    categories: (product.categories ?? []).map(({ name, slug }) => ({ name, slug })),
    imageUrls: (product.images ?? []).map(({ src }) => src),
    attributes: (product.attributes ?? []).map(({ name, taxonomy, has_variations, terms }) => ({
      name,
      taxonomy,
      hasVariations: has_variations,
      values: (terms ?? []).map(({ name: termName }) => termName),
    })),
    description: textFromHtml(product.description),
    priceByn: amount(product.prices?.price, minorUnit),
    regularPriceByn: amount(product.prices?.regular_price, minorUnit),
    salePriceByn: amount(product.prices?.sale_price, minorUnit),
    priceRangeByn: {
      min: amount(product.prices?.price_range?.min_amount, minorUnit),
      max: amount(product.prices?.price_range?.max_amount, minorUnit),
    },
    currencyCodeRaw: product.prices?.currency_code ?? null,
    currencySymbolRaw: product.prices?.currency_symbol ?? null,
    inStock: product.is_in_stock ?? null,
    purchasable: product.is_purchasable ?? null,
    stockAvailability: textFromHtml(product.stock_availability?.text ?? ""),
    variationState: variationData.state,
    variations: variationData.variations,
  });
  if ((index + 1) % 20 === 0 || index + 1 === products.length) {
    process.stderr.write(`HTML/product ${index + 1}/${products.length}\n`);
  }
}

const duplicateGroups = Map.groupBy(snapshot, (item) => duplicateKey(item.name));
const duplicates = [...duplicateGroups.values()].filter((group) => group.length > 1);
const priceAnomalies = snapshot.flatMap((item) => {
  const findings = [];
  if (item.priceByn == null || item.priceByn <= 0) findings.push("missing/nonpositive parent price");
  if (item.priceRangeByn.min != null && item.priceRangeByn.max != null && item.priceRangeByn.min > item.priceRangeByn.max) findings.push("inverted price range");
  for (const variant of item.variations) {
    if (variant.priceByn == null || variant.priceByn <= 0) findings.push(`variant ${variant.id}: missing/nonpositive price`);
    if (variant.regularPriceByn != null && variant.priceByn != null && variant.priceByn > variant.regularPriceByn) findings.push(`variant ${variant.id}: sale price above regular price`);
  }
  return findings.length ? [{ id: item.id, name: item.name, findings }] : [];
});
const missingInfo = snapshot.filter((item) =>
  !item.imageUrls.length || !item.attributes.length || (item.variationState === "absent" && item.variations.length === 0 && products.find((p) => p.id === item.id)?.has_options),
);
const result = {
  source: API,
  capturedAt: new Date().toISOString(),
  count: snapshot.length,
  note: "Prices are divided by currency_minor_unit. Source returns currency_code USD but a ruble symbol; verify BYN against visible HTML before publishing. Stock is a point-in-time snapshot.",
  audit: {
    currencyCodeMismatchCount: snapshot.filter((item) => item.currencyCodeRaw !== "BYN" && /руб/i.test(item.currencySymbolRaw ?? "")).length,
    exactNameDuplicateGroups: duplicates.map((group) => group.map(({ id, name, url }) => ({ id, name, url }))),
    priceAnomalies,
    missingInfo: missingInfo.map(({ id, name, variationState, imageUrls, attributes }) => ({ id, name, variationState, hasImages: imageUrls.length > 0, hasAttributes: attributes.length > 0 })),
    variableWithoutEmbeddedPrices: snapshot.filter((item) => item.variationState !== "embedded" && products.find((p) => p.id === item.id)?.has_options).map(({ id, name, variationState }) => ({ id, name, variationState })),
  },
  products: snapshot,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, count: result.count, exactDuplicateGroups: duplicates.length, missingInfo: missingInfo.length, variableWithoutEmbeddedPrices: result.audit.variableWithoutEmbeddedPrices.length }, null, 2));
