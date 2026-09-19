"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import styles from "./hero-film.module.css";

const media = "/media/iphone-18-pro";

export function HeroFilm() {
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className={styles.srOnly}>iPhone 18 Pro</h1>
      <div className={styles.scene}>
        <picture className={styles.poster}>
          <source media="(prefers-reduced-motion: reduce)" srcSet={`${media}/intro-end.jpg`} />
          <img src={`${media}/intro-start.jpg`} width={1280} height={720} fetchPriority="high" alt="Бордовый iPhone перед металлической надписью iPhone 18 PRO" />
        </picture>
        <AdaptiveHeroVideo
          sources={[{ src: `${media}/intro.mp4`, type: "video/mp4" }]}
          className={`${styles.film} ${visible && !failed ? styles.visible : ""}`}
          poster={`${media}/intro-start.jpg`}
          aria-label="Презентация iPhone 18 Pro: от крупного плана камер до полного силуэта телефона"
          onPlaying={() => { setVisible(true); setFailed(false); }}
          onError={() => setFailed(true)}
        />
      </div>
      <div className={styles.controls}>
        <a href="#highlights">Рассмотреть ближе <ArrowDown size={16} aria-hidden="true" /></a>
        <Link href="/product/iphone-18-pro" className={styles.buyCta}>Выбрать iPhone <ArrowRight size={15} aria-hidden="true" /></Link>
        {failed && <p role="status">Видео не загрузилось</p>}
      </div>
    </section>
  );
}
