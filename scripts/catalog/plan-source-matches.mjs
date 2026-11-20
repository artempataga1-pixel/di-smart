#!/usr/bin/env node
/**
 * Read-only planner for the client's di-smart.by snapshot vs the current DB.
 *
 * Usage: node scripts/catalog/plan-source-matches.mjs
 *        node scripts/catalog/plan-source-matches.mjs --output /tmp/matches.json
 *        node scripts/catalog/plan-source-matches.mjs --env .env.local
 *
 * No apply mode exists. Matching a model name is not enough to update a price:
 * color, memory, size, and all pricing attributes must resolve unambiguously.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const args = process.argv.slice(2);
if (args.includes("--apply")) throw new Error("This is a read-only planner; --apply is intentionally unavailable.");
function option(flag, fallback) {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`${flag} requires a value`);
  return args[index + 1];
}

const snapshotPath = resolve(option("--snapshot", `docs/catalog/source-snapshot-${new Date().toISOString().slice(0, 10)}.json`));
const outputPath = resolve(option("--output", "scripts/catalog/match-plan-current.json"));
const envPath = resolve(option("--env", ".env.local"));
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
if (!Array.isArray(snapshot.products)) throw new Error(`Invalid source snapshot: ${snapshotPath}`);
const env = parse(await readFile(envPath));
if (!env.DATABASE_URL) throw new Error(`DATABASE_URL missing from ${envPath}`);

const clean = (value) => String(value ?? "")
  .normalize("NFKC")
  .toLocaleLowerCase("ru")
  .replace(/[\u00a0\u202f]/g, " ")
  .replace(/[“”″'"()]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const COLOR_ALIASES = new Map(Object.entries({
  black: "чёрный", white: "белый", silver: "серебристый", blue: "синий",
  pink: "розовый", green: "зелёный", purple: "фиолетовый",
  "deep blue": "тёмно-синий", "cosmic orange": "космический оранжевый",
  "mist blue": "дымчато-голубой", sage: "шалфейный", lavender: "лавандовый",
  "cloud white": "облачный белый", "light gold": "светло-золотой",
  "sky blue": "небесно-голубой", midnight: "полночный",
  starlight: "звёздный", "soft pink": "нежно-розовый",
  "black titanium": "чёрный титан", "natural titanium": "натуральный титан",
  "rose gold": "розовое золото", "jet black": "чёрный",
  "space black": "космический чёрный", "desert titanium": "пустынный титан",
  yellow: "жёлтый", teal: "бирюзовый", ultramarine: "ультрамарин",
  "space gray": "графитовый", "space grey": "графитовый",
}));

function colorKey(value) {
  const key = clean(value).replaceAll("-", " ").replaceAll("ё", "е");
  const alias = COLOR_ALIASES.get(key) ?? key;
  return alias.replaceAll("ё", "е");
}

function modelKey(value) {
  return clean(value)
    .replace(/^зарядное устройство\s+/, "")
    .replace(/^apple\s+/, "")
    .replace(/\bmacbook\s+air\s+(13|15)\s+(m\d)/, "macbook air $1 $2")
    .replace(/\biphone\s+17e\b/, "iphone 17e")
    .replace(/\bapple watch\b/, "watch")
    .replace(/\bwatch se3\b/, "watch se 3")
    .replace(/\bairpods max 2\b/, "airpods max 2")
    .replace(/\s+/g, " ").trim();
}

function sourceIdentity(item) {
  const name = item.normalizedName ?? item.name;
  const match = String(name).match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  let model = name;
  let color = null;
  if (match) {
    const tail = match[2].trim();
    if (/airpods 4/i.test(match[1]) && /шумоподавлен/i.test(tail)) {
      model = /без/i.test(tail) ? "AirPods 4" : "AirPods 4 ANC";
    } else if ((item.attributes ?? []).some((a) => /color|czvet|цвет/i.test(a.taxonomy ?? "")) || COLOR_ALIASES.has(clean(tail.split("/")[0]))) {
      model = match[1];
      color = tail.split("/")[0].trim();
    }
  }
  return { model: modelKey(model), color: color ? colorKey(color) : null, rawColor: color };
}

function normaliseMemory(value) {
  const match = clean(value).match(/(\d+)\s*(gb|гб|tb|тб)/);
  if (!match) return null;
  return `${match[1]}${/tb|тб/.test(match[2]) ? "tb" : "gb"}`;
}

function normaliseSize(value) {
  const match = clean(value).match(/(\d+(?:[.,]\d+)?)\s*(mm|мм)/);
  return match ? `${match[1].replace(",", ".")}mm` : null;
}

function sourceOptions(variant) {
  const attrs = variant?.attributes ?? {};
  const result = {};
  const unknown = [];
  let variantColor = null;
  for (const [rawKey, rawValue] of Object.entries(attrs)) {
    if (!rawValue) continue;
    if (/color|czvet|цвет/i.test(rawKey)) { variantColor = colorKey(rawValue); continue; }
    if (/memory|pamyat/i.test(rawKey) && !/operativnoj/i.test(rawKey)) result.memory = normaliseMemory(rawValue);
    else if (/size|razmer/i.test(rawKey)) result.size = normaliseSize(rawValue);
    else if (/operativnoj|ram/i.test(rawKey)) result.ram = normaliseMemory(rawValue);
    else if (/sim/i.test(rawKey)) result.sim = clean(rawValue);
    else unknown.push(`${rawKey}=${rawValue}`);
  }
  return { options: result, unknown, variantColor };
}

function targetOptions(variant) {
  const result = {};
  for (const opt of variant.options) {
    if (opt.attribute === "memory") result.memory = normaliseMemory(opt.value);
    else if (opt.attribute === "size") result.size = normaliseSize(opt.value);
    else if (opt.attribute === "sim") result.sim = clean(opt.value);
    else if (opt.attribute === "length") result.length = clean(opt.value);
    else result[opt.attribute] = clean(opt.value);
  }
  return result;
}

const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();
let target;
try {
  await client.query("BEGIN READ ONLY");
  const schema = (await client.query(`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name IN ('Product', 'ProductVariant', 'ProductColorOffer')
  `)).rows;
  const hasColumn = (table, column) => schema.some((row) => row.table_name === table && row.column_name === column);
  const products = (await client.query(`
    SELECT p.id, p.slug, p.name, p."isActive" AS active, p.availability,
      b.slug AS brand, c.slug AS category
    FROM "Product" p JOIN "Brand" b ON b.id=p."brandId"
    JOIN "Category" c ON c.id=p."categoryId"
    ORDER BY p.slug
  `)).rows;
  const colors = (await client.query(`
    SELECT pc.id, pc."productId" AS product_id, av.value AS name
    FROM "ProductColorValue" pc
    JOIN "VariantAttributeValue" av ON av.id=pc."attributeValueId"
  `)).rows;
  const variants = (await client.query(`
    SELECT v.id, v."productId" AS product_id, v.availability, v.sku,
      va.slug AS attribute, av.value
    FROM "ProductVariant" v
    LEFT JOIN "ProductVariantOption" vo ON vo."variantId"=v.id
    LEFT JOIN "VariantAttributeValue" av ON av.id=vo."attributeValueId"
    LEFT JOIN "VariantAttribute" va ON va.id=av."attributeId"
  `)).rows;
  await client.query("ROLLBACK");
  target = { products, colors, variants, hasColorOffer: hasColumn("ProductColorOffer", "priceByn"), hasBynColumns: hasColumn("Product", "basePriceByn") && hasColumn("ProductVariant", "priceByn") };
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}

const colorsByProduct = Map.groupBy(target.colors, (color) => color.product_id);
const variantsByProduct = new Map();
for (const row of target.variants) {
  let group = variantsByProduct.get(row.product_id);
  if (!group) variantsByProduct.set(row.product_id, group = new Map());
  let variant = group.get(row.id);
  if (!variant) group.set(row.id, variant = { id: row.id, sku: row.sku, availability: row.availability, options: [] });
  if (row.attribute) variant.options.push({ attribute: row.attribute, value: row.value });
}
const byModel = Map.groupBy(target.products, (p) => modelKey(p.name));
const matches = [];
for (const source of snapshot.products) {
  const identity = sourceIdentity(source);
  const modelCandidates = byModel.get(identity.model) ?? [];
  const sourceRows = source.variations.length ? source.variations : [{ id: null, attributes: {}, priceByn: source.priceByn, inStock: source.inStock }];
  for (const row of sourceRows) {
    const sourceOption = sourceOptions(row);
    const base = {
      sourceId: source.id,
      sourceVariantId: row.id,
      sourceName: source.name,
      sourceUrl: source.url,
      sourcePriceByn: row.priceByn,
      sourceInStock: row.inStock,
      sourceModel: identity.model,
      sourceColor: identity.rawColor,
      sourceOptions: sourceOption.options,
    };
    function result(status, reason, destinations = []) {
      matches.push({ ...base, status, reason, destinations });
    }
    if (!Number.isFinite(row.priceByn) || row.priceByn <= 0) { result("skip", "source price missing or zero"); continue; }
    if (sourceOption.variantColor && identity.color && sourceOption.variantColor !== identity.color) {
      result("ambiguous", "source variant color conflicts with card title"); continue;
    }
    if (modelCandidates.length === 0) { result("unmatched", "no exact target model"); continue; }
    if (modelCandidates.length !== 1) { result("ambiguous", "multiple target models", modelCandidates.map((p) => ({ slug: p.slug }))); continue; }
    const product = modelCandidates[0];
    if (!product.active) { result("skip", "target product inactive", [{ slug: product.slug }]); continue; }
    const possibleColors = colorsByProduct.get(product.id) ?? [];
    let color = null;
    if (identity.color) {
      const equalColors = possibleColors.filter((candidate) => colorKey(candidate.name) === identity.color);
      if (equalColors.length !== 1) { result("unmatched", `target color ${identity.rawColor ?? identity.color} not present`, [{ slug: product.slug, availableColors: possibleColors.map((c) => c.name) }]); continue; }
      color = equalColors[0];
    } else if (possibleColors.length > 0) {
      result("ambiguous", "source color unspecified", [{ slug: product.slug, availableColors: possibleColors.map((c) => c.name) }]); continue;
    }
    const localVariants = [...(variantsByProduct.get(product.id)?.values() ?? [])];
    const sourceAttrs = sourceOption.options;
    const candidateVariants = localVariants.filter((variant) => {
      const dest = targetOptions(variant);
      return Object.entries(dest).every(([attribute, value]) => sourceAttrs[attribute] === value)
        && Object.entries(sourceAttrs).every(([attribute, value]) => attribute === "ram" || dest[attribute] === value);
    });
    const destinationBase = { slug: product.slug, productId: product.id, colorId: color?.id ?? null, color: color?.name ?? null };
    if (sourceOption.unknown.length || sourceAttrs.ram) {
      result("ambiguous", `source has unmodeled pricing attributes: ${[...sourceOption.unknown, ...(sourceAttrs.ram ? [`RAM ${sourceAttrs.ram}`] : [])].join(", ")}`, [destinationBase]);
      continue;
    }
    if (localVariants.length === 0 && Object.keys(sourceAttrs).length === 0) {
      result("exact", "model and color match; no variant dimensions", [destinationBase]);
    } else if (candidateVariants.length === 1) {
      result("exact", "model, color and all pricing dimensions match", [{ ...destinationBase, variantId: candidateVariants[0].id, options: candidateVariants[0].options }]);
    } else if (candidateVariants.length === 0) {
      result("unmatched", "no exact target variant", [destinationBase]);
    } else {
      result("ambiguous", "multiple target variants; source omits pricing dimension", candidateVariants.map((v) => ({ ...destinationBase, variantId: v.id, options: v.options })));
    }
  }
}

// Two source rows must never claim the same destination silently, even if
// the same model+color happened to be listed twice on the old site.
const exacts = matches.filter((m) => m.status === "exact");
for (const group of Map.groupBy(exacts, (m) => `${m.destinations[0].productId}:${m.destinations[0].colorId ?? ""}:${m.destinations[0].variantId ?? ""}`).values()) {
  if (group.length <= 1) continue;
  for (const match of group) { match.status = "ambiguous"; match.reason = "multiple source rows claim the same destination"; }
}

const summary = Object.fromEntries(["exact", "ambiguous", "unmatched", "skip"].map((status) => [status, matches.filter((m) => m.status === status).length]));
const plan = {
  generatedAt: new Date().toISOString(),
  sourceCapturedAt: snapshot.capturedAt,
  target: "current Neon database (read-only transaction)",
  targetSchemaReadyForByn: target.hasBynColumns && target.hasColorOffer,
  note: "Strict dry-run. Exact rows are candidates, not approved updates; source stock and price may change. No data was written.",
  summary,
  matches,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, targetSchemaReadyForByn: plan.targetSchemaReadyForByn, sourceRows: matches.length, ...summary }, null, 2));
