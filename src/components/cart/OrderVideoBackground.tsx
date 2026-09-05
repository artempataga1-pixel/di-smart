"use client";

import { usePingPongVideo } from "@/components/cart/usePingPongVideo";

const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_154629_a31a2372-bd54-4f7e-ac9b-21246141a664.mp4";

/** Видео-фон на всю страницу заказа (не на первый экран, а на всю высоту
 * контента). Абсолютное позиционирование вместо fixed: страница крутится
 * через Lenis, который на некоторых страницах транформирует контейнер
 * скролла — с fixed это давало баги. Абсолютный слой просто растягивается
 * на 100% высоты родителя (`relative` обёртки в CartPage) и скроллится
 * вместе со страницей. */
export function OrderVideoBackground() {
  const videoRef = usePingPongVideo();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        src={BG_VIDEO}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ink)]/15 via-[var(--color-bg)]/75 to-[var(--color-bg)]" />
    </div>
  );
}
