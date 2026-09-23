"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowUpRight, BatteryCharging, MonitorUp, PenTool, ShieldCheck, Wifi } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { BuyAnchor } from "@/components/storefront/BuyAnchor";
import type { CatalogCardData, ProductDetail } from "@/lib/catalog";
import styles from "./page.module.css";

export function GalaxyTabUltraPage({ product, related }: { product: ProductDetail; related: CatalogCardData[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(styles.visible);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    root.current?.querySelectorAll("[data-reveal]").forEach((item) => {
      if (item.parentElement?.closest("[data-reveal]")) return;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={styles.page}>
      <header className={styles.hero}>
        <AdaptiveHeroVideo
          poster="/media/galaxy-tab-s11-ultra/hero-poster.jpg"
          aria-label="Видео Samsung Galaxy Tab S11 Ultra"
          sources={[{ src: "/media/galaxy-tab-s11-ultra/hero.mp4", type: "video/mp4" }]}
          onEnded={(event) => {
            event.currentTarget.currentTime = 0;
            event.currentTarget.pause();
          }}
        />
        <h1 className={styles.srOnly}>Samsung Galaxy Tab S11 Ultra</h1>
        <BuyAnchor className={`${styles.buy} ${styles.heroBuy}`}>Выбрать конфигурацию</BuyAnchor>
      </header>

      <section id="buy" className="scroll-mt-20 bg-white px-4 pb-10 pt-14 md:px-6 md:pb-14 md:pt-20" data-reveal>
        <div className="mx-auto max-w-6xl">
          <ProductPurchasePanel product={product} />
        </div>
      </section>

      <section id="product-details" className="scroll-mt-20 bg-white px-4 pb-16 md:px-6" data-reveal>
        <div className="mx-auto max-w-6xl">
          <ProductSpecsTable specs={product.specs} description={product.description} />
        </div>
      </section>

      <main>
        <section className={styles.displaySection}>
          <div className={styles.displayCopy} data-reveal>
            <span>2960 × 1848</span>
            <h2>Изображению здесь<br />тесно не будет.</h2>
            <p>Dynamic AMOLED 2X держит глубокий чёрный и точные оттенки, а движение остаётся плавным без размытий. Антибликовое покрытие не даёт солнцу украсть детали с экрана, даже если работаете на улице.</p>
          </div>
          <div className={styles.orbits} aria-hidden="true"><i /><i /><i /></div>
        </section>

        <section className={styles.createSection}>
          <figure className={styles.fullImage}>
            <Image src="/media/galaxy-tab-s11-ultra/create-real.jpg" alt="Иллюстратор рисует на Galaxy Tab S11 Ultra с помощью S Pen" fill sizes="(max-width: 900px) 100vw, 1320px" />
          </figure>
          <div className={styles.overlayCopy} data-reveal>
            <PenTool size={28} />
            <p className={styles.kicker}>Новый S Pen — уже в коробке</p>
            <h2>Провёл пером —<br />и вот уже линия.</h2>
            <p>Форму пера доработали: штрих выходит точнее, а рука не устаёт даже после долгой сессии. Быстрые инструменты, заметки и AI-функции — прямо у кончика, тянуться никуда не нужно.</p>
          </div>
        </section>

        <section className={styles.dexSection}>
          <div className={styles.dexHead} data-reveal>
            <MonitorUp size={29} />
            <p className={styles.kicker}>Samsung DeX</p>
            <h2>Планшет — когда в дороге.<br />Стол — когда пора работать.</h2>
            <p>Несколько окон открыты сразу, файлы перетаскиваются между приложениями, клавиатура подключается за секунду. Хватает места и на монтаж, и на созвон, и на заметки рядом с ними — параллельно, а не по очереди.</p>
          </div>
          <figure className={styles.dexImage} data-reveal>
            <Image src="/media/galaxy-tab-s11-ultra/dex-real.jpg" alt="Galaxy Tab S11 Ultra с клавиатурой в режиме Samsung DeX" fill sizes="(max-width: 900px) 100vw, 1240px" />
          </figure>
        </section>

        <section className={styles.capabilities}>
          <article data-reveal><BatteryCharging size={28} /><strong>11 600 мА·ч</strong><p>Хватает на весь день: фильм в дороге, монтаж вечером и ещё что-нибудь после — без поиска розетки.</p></article>
          <article data-reveal><ShieldCheck size={28} /><strong>IP68</strong><p>Планшет и S Pen переживут пыль и случайный дождь.</p></article>
          <article data-reveal><Wifi size={28} /><strong>Wi‑Fi 7</strong><p>Тяжёлые проекты передаются быстрее, а связь держится стабильнее — если сеть это поддерживает.</p></article>
        </section>

        <section className={styles.closing}>
          <p>Samsung Galaxy Tab S11 Ultra</p>
          <h2>Экран больше.<br />И места для вас — тоже.</h2>
          <BuyAnchor className={styles.buy}>Выбрать конфигурацию <ArrowUpRight size={18} /></BuyAnchor>
        </section>
      </main>

      <section className="bg-white px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-6xl">
          <RelatedProducts products={related} />
        </div>
      </section>

      <footer className={styles.footnote}>
        <p>Изображения на странице сделаны с помощью ИИ — чтобы показать устройство и сценарии его использования. Интерфейс, аксессуары и отдельные детали в реальности могут отличаться.</p>
        <p>Характеристики сверены с официальными данными Samsung. Доступность цветов, объёма памяти, Wi‑Fi 7 и части функций Galaxy AI зависит от региона, сети и версии программного обеспечения.</p>
      </footer>
    </div>
  );
}
