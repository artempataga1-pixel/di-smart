import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "9mb" } },
  async redirects() {
    return ["vision-pro", "homepod", "apple-tv"].map((slug) => ({
      source: `/catalog/${slug}`,
      destination: "/catalog/apple-devices",
      permanent: true,
    }));
  },
  // "standalone" нужен для Docker-деплоя (см. Dockerfile) — на Vercel вывод
  // билда собирает сам Vercel, и это поле конфликтует с его пайплайном.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    // Keep old cached q=75 URLs valid; new storefront images request q=90.
    qualities: [75, 90],
    // Исходники медиа могут обновляться по тем же URL из админки, поэтому
    // используем умеренный TTL без immutable: быстрый повторный показ без
    // риска навсегда оставить у клиента старую фотографию.
    minimumCacheTTL: 86_400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
