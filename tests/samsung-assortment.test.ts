import assert from "node:assert/strict";
import { test } from "node:test";
import { CLIENT_SAMSUNG_ASSORTMENT, samsungConfigurationLabel } from "../prisma/client-samsung-assortment";

test("client Samsung assortment contains exactly 24 models and 43 supplied configurations", () => {
  assert.equal(CLIENT_SAMSUNG_ASSORTMENT.length, 24);
  assert.equal(new Set(CLIENT_SAMSUNG_ASSORTMENT.map(p => p.slug)).size, 24);
  assert.equal(CLIENT_SAMSUNG_ASSORTMENT.reduce((n, p) => n + p.configurations.length, 0), 43);
  const bySlug = new Map(CLIENT_SAMSUNG_ASSORTMENT.map(p => [p.slug, p]));
  assert.deepEqual(bySlug.get("galaxy-s26")!.configurations.map(samsungConfigurationLabel), ["12 ГБ / 128 ГБ", "12 ГБ / 256 ГБ", "12 ГБ / 512 ГБ"]);
  assert.deepEqual(bySlug.get("galaxy-s26-ultra")!.configurations.map(samsungConfigurationLabel), ["12 ГБ / 256 ГБ", "12 ГБ / 512 ГБ"]);
  assert.deepEqual(bySlug.get("galaxy-tab-a11")!.configurations.map(samsungConfigurationLabel), ["4 ГБ / 64 ГБ · LTE · SM-X135", "8 ГБ / 128 ГБ · Wi-Fi · SM-X130"]);
  assert.deepEqual(bySlug.get("galaxy-tab-s10-fe")!.colors, ["Синий", "Серебристый", "Серый"]);
  for (const slug of ["galaxy-tab-a11", "galaxy-tab-a11-plus"]) assert.deepEqual(bySlug.get(slug)!.colors, ["Серый", "Серебристый"]);
  assert.deepEqual(CLIENT_SAMSUNG_ASSORTMENT.filter(p => p.category === "watch").map(p => p.configurations[0].code),
    ["L715", "L705", "L320", "L325", "L330", "L335", "L500", "L505", "L340", "L345", "L350", "L355"]);
  for (const p of CLIENT_SAMSUNG_ASSORTMENT) assert.equal(new Set(p.configurations.map(samsungConfigurationLabel)).size, p.configurations.length);
});

test("additional tablets retain the exact fourteen configurations and colours supplied by the client", () => {
  const expected: Record<string, [string[], string[]]> = {
    "galaxy-tab-s10-fe-plus": [["8 ГБ / 128 ГБ · LTE · SM-X626", "12 ГБ / 256 ГБ · Wi-Fi · SM-X620"], ["Синий", "Серый", "Серебристый"]],
    "galaxy-tab-s10-lite": [["6 ГБ / 128 ГБ · Wi-Fi · SM-X400", "8 ГБ / 256 ГБ · LTE · SM-X406"], ["Серебристый", "Серый", "Коралловый красный"]],
    "galaxy-tab-s10-plus": [["12 ГБ / 256 ГБ · LTE · SM-X826", "12 ГБ / 256 ГБ · Wi-Fi · SM-X820"], ["Серебристый", "Серый"]],
    "galaxy-tab-s11": [["12 ГБ / 128 ГБ · LTE · SM-X736", "12 ГБ / 256 ГБ · LTE · SM-X736", "12 ГБ / 128 ГБ · Wi-Fi · SM-X730", "12 ГБ / 256 ГБ · Wi-Fi · SM-X730"], ["Серебристый", "Серый"]],
    "galaxy-tab-s11-ultra": [["12 ГБ / 256 ГБ · LTE · SM-X936", "12 ГБ / 512 ГБ · LTE · SM-X936", "12 ГБ / 256 ГБ · Wi-Fi · SM-X930", "12 ГБ / 512 ГБ · Wi-Fi · SM-X930"], ["Серебристый", "Серый"]],
  };
  for (const [slug, [configurations, colors]] of Object.entries(expected)) {
    const definition = CLIENT_SAMSUNG_ASSORTMENT.find(p => p.slug === slug)!;
    assert.deepEqual(definition.configurations.map(samsungConfigurationLabel), configurations);
    assert.deepEqual(definition.colors, colors);
  }
});
