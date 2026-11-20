import test from "node:test";
import assert from "node:assert/strict";
import { getCartProductImage, getCatalogProductImage } from "../src/constants/content/catalog-media";

test("cart keeps the selected iPhone finish instead of the burgundy default", () => {
  const black = "/media/catalog/apple-official-2026/iphone-18-pro-black.webp";
  assert.equal(getCartProductImage("iphone-18-pro", black, null), black);
});

test("cart keeps the selected MacBook Neo finish instead of the silver default", () => {
  const indigo = "/media/catalog/products/macbook-neo-indigo-2026-v2.webp";
  assert.equal(getCartProductImage("macbook-neo", indigo, null), indigo);
});

test("a product without a colour photo still uses its reviewed main image", () => {
  assert.equal(getCartProductImage("macbook-neo", null, "/uploads/main.jpg"), getCatalogProductImage("macbook-neo"));
  assert.equal(getCartProductImage("custom-product", null, "/uploads/main.jpg"), "/uploads/main.jpg");
});
