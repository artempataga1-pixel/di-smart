"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowUpRight, BatteryCharging, HeartPulse, LocateFixed, Satellite, Waves } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { scrollToId } from "@/lib/scroll";
import type { CatalogCardData, ProductDetail } from "@/lib/catalog";
import styles from "./page.module.css";

function BuyAnchor({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <a
      className={className}
      href="#buy"
      onClick={(event) => {
        event.preventDefault();
        scrollToId("buy");
      }}
    >
      {children}
    </a>
  );
}

export function AppleWatchUltraPage({ product, related }: { product: ProductDetail; related: CatalogCardData[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(styles.visible);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    root.current?.querySelectorAll("[data-reveal]").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <div ref={root} className={styles.page}>
    <header className={styles.hero}>
      <AdaptiveHeroVideo
        poster="/media/apple-watch-ultra-4/hero-poster.webp"
        aria-label="Видео Apple Watch Ultra 4"
        sources={[
          { src: "/media/apple-watch-ultra-4/hero.m4v", type: "video/mp4" },
          { src: "/media/apple-watch-ultra-4/hero.mov", type: "video/quicktime" },
        ]}
      />
      <h1 className={styles.srOnly}>Apple Watch Ultra 4</h1>
      <BuyAnchor className={`${styles.buy} ${styles.heroBuy}`}>Выбрать конфигурацию</BuyAnchor>
    </header>

    <section id="buy" className="scroll-mt-20 bg-white px-4 pb-10 pt-14 md:px-6 md:pb-14 md:pt-20" data-reveal>
      <div className="mx-auto max-w-6xl">
        <ProductPurchasePanel product={product} />
      </div>
    </section>

    <section className="bg-white px-4 pb-16 md:px-6" data-reveal>
      <div className="mx-auto max-w-6xl">
        <ProductSpecsTable specs={product.specs} description={product.description} />
      </div>
    </section>

    <section className={styles.alpine}>
      <Image src="/media/apple-watch-ultra-4/alpine.webp" alt="Apple Watch Ultra 4 на запястье бегуна в горах" fill sizes="100vw" />
      <div className={styles.alpineCopy} data-reveal>
        <LocateFixed size={29} />
        <p>Двухчастотный GPS для точной навигации</p>
        <h2>Трек помнит<br />каждый поворот.</h2>
        <span>Высота, темп, дистанция — и возвращение назад по собственному следу, если понадобится. Работает и там, где от города остались только координаты на карте.</span>
      </div>
    </section>

    <section className={styles.endurance}>
      <div className={styles.enduranceTitle} data-reveal>
        <p>Энергия</p>
        <h2>Батарея,<br />которая не спешит садиться.</h2>
      </div>
      <div className={styles.chargeDial} data-reveal>
        <span>до</span><strong>50</strong><em>часов</em>
      </div>
      <div className={styles.enduranceCopy} data-reveal>
        <BatteryCharging size={28} />
        <p><strong>15 минут</strong> на зарядке — и в запасе ещё <strong>18 часов</strong> обычной работы. Сон, тренировка и добрая половина следующего дня укладываются в один цикл заряда.</p>
      </div>
    </section>

    <section className={styles.ocean}>
      <Image src="/media/apple-watch-ultra-4/ocean-diver.webp" alt="Фридайвер сверяет глубину погружения по Apple Watch Ultra 4" fill sizes="100vw" />
      <div className={styles.oceanCopy} data-reveal>
        <Waves size={31} />
        <p>Глубиномер и датчик температуры воды</p>
        <h2>Ушли под воду.<br />Часы — на связи.</h2>
        <span>Рейтинг WR100 держит часы на скоростных водных видах спорта и рекреационных погружениях — до 40 метров под поверхностью.</span>
      </div>
    </section>

    <section className={styles.intelligence}>
      <div className={styles.heading} data-reveal>
        <p>Важное — ближе</p>
        <h2>Слышит тело.<br />Реагирует по ситуации.</h2>
      </div>
      <div className={styles.intelligenceGrid}>
        <article data-reveal><HeartPulse size={30} /><h3>Датчики здоровья нового поколения</h3><p>Оптические и электрические измерения стали точнее — пульс, восстановление, сон и то, как эти показатели меняются у вас месяцами, видно яснее.</p></article>
        <article data-reveal><Satellite size={30} /><h3>Сигнал, когда сети нет</h3><p>Встроенный спутниковый модуль отправит сообщение или вызовет помощь даже там, куда не дотягиваются вышки сотовой связи.</p></article>
      </div>
    </section>

    <section className={styles.closing}>
      <p>Apple Watch Ultra 4</p>
      <h2>Следующая точка<br />уже на карте.</h2>
      <BuyAnchor className={styles.buy}>Выбрать конфигурацию <ArrowUpRight size={18} /></BuyAnchor>
    </section>

    <section className="bg-white px-4 pb-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <RelatedProducts products={related} />
      </div>
    </section>

    <footer className={styles.footnote}>
      <p>Изображения на странице сгенерированы нейросетью — чтобы показать устройство и типичные сценарии использования. Интерфейс, оттенки корпуса и детали ремешка у серийных часов могут немного отличаться.</p>
      <p>Характеристики выверены по официальным данным Apple для Apple Watch Ultra 4: корпус 49 мм из титана Grade 5, покрытия Natural и Black, до 50 часов работы в обычном режиме, рейтинг WR100 и рекреационные погружения до 40 метров. Спутниковые и медицинские функции доступны не во всех странах.</p>
    </footer>
  </div>;
}
