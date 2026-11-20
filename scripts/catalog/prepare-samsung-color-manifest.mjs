/** Build the reviewed colour-to-image map from the captured live assortment. */
import { readFileSync, writeFileSync } from "node:fs";
const products = JSON.parse(readFileSync("docs/catalog/samsung-color-inventory-2026-10-02.json", "utf8"));
const names = {
  "Чёрный": "black", "Белый": "white", "Зелёный": "green", "Графитовый": "graphite",
  "Светло-серый": "light-gray", "Оливковый": "olive", "Розовый": "pink", "Серый": "gray",
  "Серебристый": "silver", "Розовое золото": "pink-gold", "Кобальтовый фиолетовый": "cobalt-violet",
  "Фисташковый": "pistachio", "Голубая ягода": "blueberry", "Синяя тень": "blue-shadow",
  "Серебристая тень": "silver-shadow", "Кораллово-красный": "coral-red", "Мятный": "mint",
  "Кремовый": "cream", "Лавандовый": "lavender", "Титановый чёрный": "titanium-black",
  "Титановый серый": "titanium-gray", "Титановый серебристо-голубой": "titanium-silverblue",
  "Титановый бело-серебристый": "titanium-whitesilver",
};
// Visually reviewed existing photographs already show these colours exactly.
const originals = {
  "galaxy-a26-5g": "Чёрный", "galaxy-a56": "Светло-серый",
  "galaxy-book6": "Серый", "galaxy-book6-pro": "Серый", "galaxy-book6-ultra": "Серый",
  "galaxy-buds3": "Серебристый", "galaxy-buds3-pro": "Серебристый", "galaxy-buds3-fe": "Чёрный",
  "galaxy-buds4": "Чёрный", "galaxy-buds4-pro": "Чёрный", "galaxy-s25": "Серебристый",
  "galaxy-s25-plus": "Синий", "galaxy-s25-ultra": "Титановый бело-серебристый",
  "galaxy-s26": "Чёрный", "galaxy-s26-plus": "Чёрный", "galaxy-tab-a11": "Серый",
  "galaxy-tab-a11-plus": "Серый", "galaxy-tab-s10-fe": "Серый", "galaxy-tab-s10-fe-plus": "Серый",
  "galaxy-tab-s11": "Графитовый", "galaxy-tab-s11-ultra": "Графитовый",
  "galaxy-z-flip7": "Синяя тень", "galaxy-z-flip8": "Графитовый",
  "galaxy-z-fold7": "Серебристая тень", "galaxy-z-fold8": "Графитовый",
};
const manifest = {};
for (const product of products.filter(p => p.colorValues.length)) {
  manifest[product.slug] = {};
  for (const color of product.colorValues) {
    const name = color.attributeValue.value;
    const existing = product.images.find(image => image.colorValueId === color.id);
    let filename = names[name];
    if (name === "Синий") filename = product.slug.startsWith("galaxy-s26") ? "sky-blue" : product.slug.startsWith("galaxy-s25") ? "navy" : "blue";
    if (!filename) throw new Error(`Unknown colour: ${product.slug}/${name}`);
    manifest[product.slug][name] = existing?.url ?? (originals[product.slug] === name
      ? `/media/catalog/products/${product.slug}.webp`
      : `/media/samsung-color-variants/${product.slug}/${filename}.webp`);
  }
}
writeFileSync("prisma/samsung-color-images.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`${Object.keys(manifest).length} products / ${Object.values(manifest).reduce((n, colors) => n + Object.keys(colors).length, 0)} colour images`);
