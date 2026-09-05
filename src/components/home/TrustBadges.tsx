"use client";

import { motion } from "framer-motion";
import { BlurIn } from "@/components/ui/BlurIn";
import { TRUST_BADGES } from "@/constants/content/services";

interface InsightCardMeta {
  videoUrl: string;
  overlayColor: string;
  minHeight: string;
}

const CARD_META: InsightCardMeta[] = [
  {
    videoUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_143605_bc7bd6c0-9c68-49ff-a9d3-073a10759fa4.mp4",
    overlayColor: "rgba(155,127,194,0.28)",
    minHeight: "min-h-[450px]",
  },
  {
    videoUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_145119_f4ec4d9f-3ecd-4116-baa3-26e8cf2df976.mp4",
    overlayColor: "rgba(241,236,248,0.7)",
    minHeight: "min-h-[350px]",
  },
  {
    videoUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_140728_ae719193-f10b-4105-82fc-c989610b3aa6.mp4",
    overlayColor: "rgba(200,170,220,0.3)",
    minHeight: "min-h-[450px]",
  },
  {
    videoUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_143605_bc7bd6c0-9c68-49ff-a9d3-073a10759fa4.mp4",
    overlayColor: "rgba(218,210,230,0.35)",
    minHeight: "min-h-[350px]",
  },
];

const rowVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function TrustBadges() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex max-w-[517px] flex-col gap-5">
        <BlurIn>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-text)] md:text-4xl">
            Уверенность в каждой покупке
          </h2>
        </BlurIn>
        <p className="max-w-[420px] text-base text-[var(--color-muted)] md:text-lg">
          Официальная гарантия, сервисный центр и экспертная поддержка — всё в одном месте, рядом
          с домом.
        </p>
      </div>

      <motion.div
        className="flex flex-col items-stretch gap-5 lg:flex-row lg:items-end"
        variants={rowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {TRUST_BADGES.map((badge, index) => {
          const meta = CARD_META[index];
          return (
            <motion.div
              key={badge.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
              className={`group relative flex flex-1 cursor-default flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)] ${meta.minHeight}`}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full scale-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              >
                <source src={meta.videoUrl} type="video/mp4" />
              </video>
              <div
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
                style={{ backgroundColor: meta.overlayColor }}
              />
              <div className="relative z-10 flex flex-col gap-3">
                <p className="text-2xl font-semibold leading-tight text-[var(--color-text)] md:text-[28px]">
                  {badge.title}
                </p>
                <p className="text-base text-[var(--color-text)] opacity-80 md:text-lg">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
