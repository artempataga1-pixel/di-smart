/** Campaign products must be discoverable in the normal first-page grid too. */
const CAMPAIGN_ORDER = [
  "iphone-18-pro", "iphone-18-pro-max", "iphone-air",
  "galaxy-s26-ultra", "galaxy-s26", "galaxy-s26-plus", "galaxy-s26-fe",
  "galaxy-tab-s11-ultra", "galaxy-tab-s11", "airpods-pro-3",
];
const rank = new Map(CAMPAIGN_ORDER.map((slug, index) => [slug, index]));
export function prioritizeCatalogCampaigns<T extends { slug: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => (rank.get(a.slug) ?? Infinity) - (rank.get(b.slug) ?? Infinity));
}
