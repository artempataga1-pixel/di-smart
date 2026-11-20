import { config } from "dotenv";
import { access, mkdir, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";

config({ quiet: true });
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
const replacements = [
  { slug: "watch-se-3", colorId: "cmugzxrt40048zjof5ulvpizb", file: "se3-midnight", label: "Midnight / Midnight Sport Band" },
  { slug: "watch-se-3", colorId: "cmugzxrxp0049zjof2arny7ok", file: "se3-starlight", label: "Starlight / Starlight Sport Band" },
  { slug: "watch-series-11", colorId: "cmuhwm9s900433mofym8uhy7z", file: "series11-space-gray", label: "Space Gray / Black Sport Band" },
  { slug: "watch-series-11", colorId: "cmuhwm9nj00423mof7t2qm13q", file: "series11-silver", label: "Silver / Purple Fog Sport Band" },
  { slug: "watch-series-11", colorId: "cmuhwm9iu00413mofp49hy2es", file: "series11-rose-gold", label: "Rose Gold / Light Blush Sport Band" },
  { slug: "watch-series-11", colorId: "cmuhwm9e500403mofma6mangt", file: "series11-jet-black", label: "Jet Black / Black Sport Band" },
];

async function main() {
  const products = await db.product.findMany({
    where: { slug: { in: ["watch-se-3", "watch-series-11"] } },
    include: { images: true, variants: { include: { options: true, colorOffers: true } },
      colorValues: { include: { attributeValue: true, offers: true } } },
  });
  if (products.length !== 2) throw new Error("Expected SE3 and Series 11");
  for (const replacement of replacements) {
    const product = products.find(item => item.slug === replacement.slug)!;
    if (!product.colorValues.some(color => color.id === replacement.colorId)) throw new Error(`Unknown color ${replacement.file}`);
    if (product.images.filter(image => image.colorValueId === replacement.colorId).length !== 1) {
      throw new Error(`Expected one existing image for ${replacement.file}`);
    }
    await access(`public/media/catalog/apple-watch-silicone-2026/${replacement.file}-v3.webp`);
  }
  const silver = products.find(item => item.slug === "watch-series-11")!.colorValues.find(color => color.id === "cmuhwm9nj00423mof7t2qm13q")!;
  const sharedCount = await db.productColorValue.count({ where: { attributeValueId: silver.attributeValueId } });
  if (sharedCount !== 1) throw new Error("Silver band label is shared; review before renaming");
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ products: products.map(product => product.slug), images: replacements.length, replacements }));
    return;
  }
  await mkdir("docs/catalog", { recursive: true });
  await writeFile("docs/catalog/watch-silicone-before-2026-10-10.json", JSON.stringify(products, null, 2), { flag: "wx", mode: 0o600 });
  await db.$transaction(async tx => {
    for (const replacement of replacements) {
      await tx.productImage.updateMany({ where: { colorValueId: replacement.colorId }, data: {
        url: `/media/catalog/apple-watch-silicone-2026/${replacement.file}-v3.webp`,
        alt: `Apple Watch — ${replacement.label}, силиконовый ремешок`,
      } });
    }
    await tx.variantAttributeValue.update({ where: { id: silver.attributeValueId },
      data: { value: "Серебристый / Purple Fog Sport Band" } });
  });
  console.log("Six watch images updated; variants, prices and availability retained.");
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
