/** Assortment supplied by the client on 2026-10-02. No inferred colour or price options. */
export interface SamsungConfiguration { ram?: number; storage?: number; connection?: string; code?: string; size?: number }
export interface SamsungDefinition { slug: string; name: string; category: string; configurations: SamsungConfiguration[];
  colors?: string[]; year?: number; clientName?: string; image?: string }
const phone = (slug: string, name: string, ram: number, storage: number[]): SamsungDefinition => ({
  slug, name: `Samsung Galaxy ${name}`, category: "samsung-smartphones", configurations: storage.map(storage => ({ ram, storage })),
});
const watch = (series: string, size: number, code: string, lte = false, year?: number, clientName?: string): SamsungDefinition => ({
  slug: `galaxy-watch-${code.toLowerCase()}`, name: `Samsung Galaxy Watch ${series} ${size} мм${lte ? " LTE" : ""} (${code})${year ? ` — ${year}` : ""}`,
  category: "watch", configurations: [{ size, connection: lte ? "LTE" : "Bluetooth", code }], year, clientName,
  image: `/media/catalog/samsung-watch-studio/${code === "L715" ? "watch-ultra-2" : code === "L705" ? "watch-ultra-2025" : series === "8 Classic" ? "watch8-classic" : `watch${series}-${size}`}-2026-v2.webp`,
});
export const CLIENT_SAMSUNG_ASSORTMENT: SamsungDefinition[] = [
  phone("galaxy-s26-fe", "S26 FE", 8, [128, 256]),
  phone("galaxy-s26", "S26", 12, [128, 256, 512]),
  phone("galaxy-s26-plus", "S26+", 12, [256, 512]),
  phone("galaxy-s26-ultra", "S26 Ultra", 12, [256, 512]),
  watch("Ultra 2", 47, "L715", true, 2026, "Samsung Watch 2 Ultra 47 LTE L715 (2026)"),
  watch("Ultra", 47, "L705", true, 2025, "Samsung Watch 7 Ultra 47 LTE L705 (2025)"),
  watch("8", 40, "L320"), watch("8", 40, "L325", true),
  watch("8", 44, "L330"), watch("8", 44, "L335", true),
  watch("8 Classic", 46, "L500"), watch("8 Classic", 46, "L505", true),
  watch("9", 40, "L340"), watch("9", 40, "L345", true),
  watch("9", 44, "L350"), watch("9", 44, "L355", true),
  { slug: "galaxy-tab-a11", name: "Samsung Galaxy Tab A11", category: "samsung-tablets", colors: ["Серый", "Серебристый"], configurations: [
    { ram: 4, storage: 64, connection: "LTE", code: "X135" },
    { ram: 8, storage: 128, connection: "Wi-Fi", code: "X130" },
  ] },
  { slug: "galaxy-tab-a11-plus", name: "Samsung Galaxy Tab A11 Plus", category: "samsung-tablets", colors: ["Серый", "Серебристый"], configurations: [
    { ram: 6, storage: 128, connection: "LTE", code: "X236" },
    { ram: 6, storage: 128, connection: "Wi-Fi", code: "X230" },
    { ram: 8, storage: 256, connection: "Wi-Fi", code: "X230" },
  ] },
  { slug: "galaxy-tab-s10-fe", name: "Samsung Galaxy Tab S10 FE", category: "samsung-tablets", colors: ["Синий", "Серебристый", "Серый"], configurations: [
    { ram: 8, storage: 128, connection: "LTE", code: "X526" },
    { ram: 8, storage: 128, connection: "Wi-Fi", code: "X520" },
    { ram: 12, storage: 256, connection: "Wi-Fi", code: "X520" },
  ] },
  { slug: "galaxy-tab-s10-fe-plus", name: "Samsung Galaxy Tab S10 FE Plus", category: "samsung-tablets", colors: ["Синий", "Серый", "Серебристый"], configurations: [
    { ram: 8, storage: 128, connection: "LTE", code: "X626" },
    { ram: 12, storage: 256, connection: "Wi-Fi", code: "X620" },
  ] },
  { slug: "galaxy-tab-s10-lite", name: "Samsung Galaxy Tab S10 Lite", category: "samsung-tablets", colors: ["Серебристый", "Серый", "Коралловый красный"],
    image: "/media/samsung-color-variants/galaxy-tab-s10-lite/gray.webp", configurations: [
    { ram: 6, storage: 128, connection: "Wi-Fi", code: "X400" },
    { ram: 8, storage: 256, connection: "LTE", code: "X406" },
  ] },
  { slug: "galaxy-tab-s10-plus", name: "Samsung Galaxy Tab S10 Plus", category: "samsung-tablets", colors: ["Серебристый", "Серый"],
    image: "/media/samsung-color-variants/galaxy-tab-s10-plus/gray.webp", configurations: [
    { ram: 12, storage: 256, connection: "LTE", code: "X826" },
    { ram: 12, storage: 256, connection: "Wi-Fi", code: "X820" },
  ] },
  { slug: "galaxy-tab-s11", name: "Samsung Galaxy Tab S11", category: "samsung-tablets", colors: ["Серебристый", "Серый"], configurations: [
    { ram: 12, storage: 128, connection: "LTE", code: "X736" },
    { ram: 12, storage: 256, connection: "LTE", code: "X736" },
    { ram: 12, storage: 128, connection: "Wi-Fi", code: "X730" },
    { ram: 12, storage: 256, connection: "Wi-Fi", code: "X730" },
  ] },
  { slug: "galaxy-tab-s11-ultra", name: "Samsung Galaxy Tab S11 Ultra", category: "samsung-tablets", colors: ["Серебристый", "Серый"], configurations: [
    { ram: 12, storage: 256, connection: "LTE", code: "X936" },
    { ram: 12, storage: 512, connection: "LTE", code: "X936" },
    { ram: 12, storage: 256, connection: "Wi-Fi", code: "X930" },
    { ram: 12, storage: 512, connection: "Wi-Fi", code: "X930" },
  ] },
];
export function samsungConfigurationLabel(c: SamsungConfiguration): string {
  return [c.ram && `${c.ram} ГБ / ${c.storage} ГБ`, c.size && `${c.size} мм`, c.connection, c.code && `SM-${c.code}`].filter(Boolean).join(" · ");
}
