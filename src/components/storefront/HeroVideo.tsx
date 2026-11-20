"use client";
import Image from "@/components/ui/StoreImage";
import Link from "next/link";
import { useState } from "react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import styles from "./storefront.module.css";

export function HeroVideo({ video, poster }: { video: string; poster: string }) {
  const [failed, setFailed] = useState(false);
  return <section className={styles.hero} aria-label="Технологии Di-SMART">
    <div className={styles.heroFrame}>
    <Image src={poster} alt="" fill sizes="100vw" preload className={styles.heroMedia} />
    {!failed && <AdaptiveHeroVideo
      poster={poster}
      sources={[{ src: video, type: "video/mp4" }]}
      aria-hidden="true"
      className={styles.heroMedia}
      onError={() => setFailed(true)}
    />}
    </div>
    <div className={styles.heroCopy}>
      <h1 className="sr-only">Di-SMART — интернет-магазин электроники</h1>
      <p className={styles.heroMessage}>
        <span>Apple, Samsung и Xiaomi.</span>
        <span className={styles.heroSubline}>Актуальные цены и наличие.</span>
      </p>
      <Link href="/catalog" prefetch className={styles.heroCta}>Смотреть каталог</Link>
    </div>
  </section>;
}
