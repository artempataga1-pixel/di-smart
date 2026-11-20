import { productPath } from "@/lib/product-route";
import type { MetadataRoute } from "next";
import { flagshipCampaigns } from "@/constants/content/flagships";
import { prisma } from "@/lib/prisma";

/* Как и остальные страницы (layout.tsx, каталог) — читает Prisma напрямую,
 * поэтому без force-dynamic Next попытался бы статически сгенерировать
 * sitemap во время `next build` (в CI без БД) и упал бы. */
export const dynamic = "force-dynamic";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  ...flagshipCampaigns.map(item => ({ path: item.href, changeFrequency: "monthly" as const, priority: 0.8 })),
  { path: "/galaxy-s25-ultra", changeFrequency: "monthly", priority: 0.8 },
  { path: "/catalog", changeFrequency: "daily", priority: 0.9 },
  { path: "/trade-in", changeFrequency: "monthly", priority: 0.5 },
  { path: "/delivery", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contacts", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/offer", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, brand: { isActive: true } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, category: { isActive: true }, brand: { isActive: true } },
      select: { slug: true, canonicalPath: true, updatedAt: true },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${baseUrl}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/catalog/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const listedPaths = new Set([
    ...STATIC_ROUTES.map((route) => route.path),
    ...categories.map((category) => `/catalog/${category.slug}`),
  ]);
  const productEntries: MetadataRoute.Sitemap = products.flatMap((p) => {
    const path = productPath(p.slug, p.canonicalPath);
    // В sitemap должны быть только канонические URL этого сайта. Промостраницы
    // уже присутствуют в STATIC_ROUTES и не требуют второй записи.
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("?") || path.includes("#") || listedPaths.has(path)) return [];
    listedPaths.add(path);
    return [{
      url: `${baseUrl}${path}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }];
  });

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
