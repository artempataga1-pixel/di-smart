import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" нужен для Docker-деплоя (см. Dockerfile) — на Vercel вывод
  // билда собирает сам Vercel, и это поле конфликтует с его пайплайном.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    // Исходники медиа могут обновляться по тем же URL из админки, поэтому
    // используем умеренный TTL без immutable: быстрый повторный показ без
    // риска навсегда оставить у клиента старую фотографию.
    minimumCacheTTL: 86_400,
  },
};

export default nextConfig;
