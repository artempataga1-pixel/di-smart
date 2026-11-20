import { config } from "dotenv";
import { access, mkdir, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";

config({ quiet: true });
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
const photos: Record<string, string> = {
  "Космический чёрный": "spaceblack",
  "Облачный белый": "cloudwhite",
  "Светло-золотой": "lightgold",
  "Небесно-голубой": "skyblue",
};

async function main() {
  const product = await db.product.findUnique({ where: { slug: "iphone-air" },
    include: { images: true, variants: true, colorValues: { include: { attributeValue: true } } } });
  if (!product || product.variants.length !== 3 || product.colorValues.length !== 4) {
    throw new Error("Expected existing Air with three memory variants and four colors");
  }
  for (const color of product.colorValues) {
    const finish = photos[color.attributeValue.value];
    if (!finish) throw new Error("Unknown Air finish");
    await access(`public/media/catalog/iphone-air-official-2026/${finish}.webp`);
  }
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ slug: product.slug, active: product.isActive, colors: 4, variants: 3 }));
    return;
  }
  await mkdir("docs/catalog", { recursive: true });
  await writeFile("docs/catalog/iphone-air-before-2026-10-10.json", JSON.stringify(product, null, 2), { flag: "wx", mode: 0o600 });
  await db.$transaction(async tx => {
    await tx.product.update({ where: { id: product.id }, data: { isActive: true } });
    for (const color of product.colorValues) {
      const url = `/media/catalog/iphone-air-official-2026/${photos[color.attributeValue.value]}.webp`;
      if (!product.images.some(image => image.colorValueId === color.id && image.url === url)) {
        await tx.productImage.create({ data: { productId: product.id, colorValueId: color.id,
          url, alt: `iPhone Air — ${color.attributeValue.value}`, sortOrder: 10, isMain: false } });
      }
    }
  });
  console.log("Air enabled: existing variants and prices retained; four official color photos attached.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
