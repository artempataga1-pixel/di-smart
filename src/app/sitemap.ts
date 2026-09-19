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
  { path: "/catalog", changeFrequency: "daily", priority: 0.9 },
  { path: "/trade-in", changeFrequency: "monthly", priority: 0.5 },
  { path: "/delivery", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contacts", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/offer", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, brand: { isActive: true } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
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

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
