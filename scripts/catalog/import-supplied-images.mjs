#!/usr/bin/env node
/** Import only explicitly matched customer-supplied images, keeping originals untouched. */
import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const sourceDir = resolve("каталог обнова");
const productDir = resolve("public/media/catalog/products");
const categoryDir = resolve("public/media/storefront/categories");

const products = [
  ["AirPods Max 2.png", "airpods-max-2.webp"],
  ["Apple Vision Pro (M5).png", "apple-vision-pro-m5.webp"],
  ["Apple HomePod (2-го поколения).png", "homepod-2.webp"],
  ["Apple TV 4K (3-го поколения), Wi-Fi, 64 ГБ.png", "apple-tv-4k-3-wifi-64.webp"],
  ["Apple TV 4K (3-го поколения), Wi-Fi + Ethernet, 128 ГБ.png", "apple-tv-4k-3-ethernet-128.webp"],
  ["Кабель USB-C — USB-C, плетёный.png", "cable-braided-usbc.webp"],
  ["Кабель USB-C — 3.5 мм Jack.png", "cable-usbc-jack.webp"],
  ["Samsung Galaxy Tab A11.png", "galaxy-tab-a11.webp"],
  ["Чехол-книжка для iPad .png", "ipad-folio-case.webp"],
  ["MacBook Air 13\" M4 .png", "macbook-air-13-m4.webp"],
  ["MacBook Air 13\" M5.png", "macbook-air-13-m5.webp"],
  ["Samsung Кабель USB-C — USB-C.png", "samsung-cable-usbc-usbc.webp"],
  ["Xiaomi Pad 8.png", "xiaomi-pad-8.webp"],
];

await mkdir(productDir, { recursive: true });
for (const [source, destination] of products) {
  const input = resolve(sourceDir, source);
  const output = resolve(productDir, destination);
  await access(input);
  await sharp(input).rotate().webp({ quality: 86, effort: 6 }).toFile(output);
  console.log(`${source} → ${destination}`);
}

const categorySource = resolve(sourceDir, "Другая техника Apple.png");
const categoryOutput = resolve(categoryDir, "apple-devices.webp");
await access(categorySource);
await mkdir(categoryDir, { recursive: true });
await sharp(categorySource).rotate().webp({ quality: 86, effort: 6 }).toFile(categoryOutput);
console.log("Другая техника Apple.png → apple-devices.webp");
