import { config } from "dotenv";
import { access, mkdir, writeFile } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createDatabaseAdapter } from "../../src/lib/database-adapter";

config({ quiet: true });
const db = new PrismaClient({ adapter: createDatabaseAdapter() });
const root = "/media/catalog/apple-watch-silicone-2026";
const plans = [
  { slug: "watch-series-11", colorId: "cmuhwm9s900433mofym8uhy7z", key: "series11-space-gray" },
  { slug: "watch-series-11", colorId: "cmuhwm9e500403mofma6mangt", key: "series11-jet-black" },
  { slug: "watch-series-11", colorId: "cmuhwm9iu00413mofp49hy2es", key: "series11-rose-gold" },
  { slug: "watch-series-11", colorId: "cmuhwm9nj00423mof7t2qm13q", key: "series11-silver" },
  { slug: "watch-se-3", colorId: "cmugzxrt40048zjof5ulvpizb", key: "se3-midnight" },
  { slug: "watch-se-3", colorId: "cmugzxrxp0049zjof2arny7ok", key: "se3-starlight" },
];

async function main() {
  const products = await db.product.findMany({
    where: { slug: { in: ["watch-series-11", "watch-se-3"] } },
    include: { images: true, variants: { include: { options: true, colorOffers: true } },
      colorValues: { include: { attributeValue: true, offers: true } } },
  });
  if (products.length !== 2) throw new Error("Expected Series 11 and SE3");
  const replacements: { id: string; oldUrl: string; url: string; key: string }[] = [];
  for (const plan of plans) {
    const product = products.find(item => item.slug === plan.slug)!;
    const images = product.images.filter(image => image.colorValueId === plan.colorId);
    if (images.length !== 1) throw new Error(`Expected one color photo: ${plan.key}`);
    const image = images[0];
    const url = `${root}/${plan.key}-fixed-2026-10-16.webp`;
    if (image.url !== `${root}/${plan.key}-v3.webp` && image.url !== url) {
      throw new Error(`Color image changed since previous publication: ${plan.key}`);
    }
    await access(`public${url}`);
    replacements.push({ id: image.id, oldUrl: image.url, url, key: plan.key });
  }
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ status: "ready", replacements }, null, 2));
    return;
  }
  await mkdir("docs/catalog", { recursive: true });
  await writeFile("docs/catalog/watch-fixed-before-2026-10-16.json", JSON.stringify(products, null, 2), { flag: "wx", mode: 0o600 });
  await db.$transaction(async tx => {
    for (const image of replacements) {
      await tx.productImage.update({ where: { id: image.id, url: image.oldUrl }, data: { url: image.url } });
    }
  });
  console.log("Six color images replaced with fixed-composition versions; commercial data unchanged.");
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
