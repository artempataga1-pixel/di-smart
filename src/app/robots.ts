import type { MetadataRoute } from "next";

/* Без обращений к БД — достаточно знать путь /admin, поэтому статический
 * файл, не зависит от задач уровня 7 (см. нюанс задачи 59 в плане). */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
