import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" нужен для Docker-деплоя (см. Dockerfile) — на Vercel вывод
  // билда собирает сам Vercel, и это поле конфликтует с его пайплайном.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
