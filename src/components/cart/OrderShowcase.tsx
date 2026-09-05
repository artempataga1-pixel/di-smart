"use client";

import { motion } from "framer-motion";

const CARDS = [
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_143605_bc7bd6c0-9c68-49ff-a9d3-073a10759fa4.mp4",
    stat: "12 500+",
    text: "Клиентов уже оформили заказ в ЛУНЕ",
    overlay: "rgba(206, 223, 235, 0.35)",
    float: "cart-float-a",
  },
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_145119_f4ec4d9f-3ecd-4116-baa3-26e8cf2df976.mp4",
    stat: "98%",
    text: "Заказов доставляем точно в срок",
    overlay: "rgba(247, 236, 233, 0.7)",
    float: "cart-float-b",
  },
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_140728_ae719193-f10b-4105-82fc-c989610b3aa6.mp4",
    stat: "24/7",
    text: "Поддержка на связи по любым вопросам заказа",
    overlay: "rgba(218, 218, 218, 0.3)",
    float: "cart-float-c",
  },
];

/** Три "летающие" карточки со статистикой поверх видео-фона страницы
 * заказа (см. OrderVideoBackground) — своё зацикленное видео у каждой
 * плюс мягкое покачивание, чтобы выглядели живыми. */
export function OrderShowcase() {
  return (
    <div className="mb-12 grid gap-5 sm:grid-cols-3">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.stat}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.15 }}
          className={`relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)] ${card.float}`}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={card.video}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0" style={{ background: card.overlay }} />
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">
              {card.stat}
            </span>
            <p className="text-sm text-[var(--color-ink)]/80 md:text-base">{card.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
