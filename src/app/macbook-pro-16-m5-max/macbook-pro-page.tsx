"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowUpRight, BatteryCharging, Cpu, Database, Film } from "lucide-react";
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

export function MacbookProPage({ product, related, hasHeroVideo }: { product: ProductDetail; related: CatalogCardData[]; hasHeroVideo: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(styles.visible);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    root.current?.querySelectorAll("[data-reveal]").forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <div ref={root} className={styles.page}>
    <header className={styles.hero}>
      {!hasHeroVideo && <Image className={styles.heroPoster} src="/media/macbook-pro-m5-max/hero-poster.webp" alt="MacBook Pro 16 дюймов M5 Max в цвете Space Black" fill priority sizes="100vw" />}
      {hasHeroVideo && <AdaptiveHeroVideo
        poster="/media/macbook-pro-m5-max/hero-poster.webp"
        aria-label="Видео MacBook Pro 16 дюймов M5 Max"
        sources={[{ src: "/media/macbook-pro-m5-max/hero.mp4", type: "video/mp4" }]}
      />}
      <h1 className={styles.srOnly}>MacBook Pro 16″ с M5 Max</h1>
      <BuyAnchor className={`${styles.button} ${styles.heroButton}`}>Выбрать конфигурацию</BuyAnchor>
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

    <section className={styles.section}>
      <div className={styles.heading} data-reveal>
        <p>Корпус и подключения</p>
        <h2>Рабочая станция.<br />Закрывается одной рукой.</h2>
        <p className={styles.lead}>Space Black скрывает отпечатки и мягко собирает свет. По бокам — Thunderbolt 5, HDMI, SDXC, MagSafe 3 и разъём для наушников. Переходники могут остаться дома.</p>
      </div>
      <figure className={`${styles.mediaFrame} ${styles.designImage}`} data-reveal>
        <Image src="/media/macbook-pro-m5-max/design.webp" alt="Тонкий профиль MacBook Pro 16 с профессиональными разъёмами" fill sizes="(max-width: 800px) 100vw, 1240px" />
      </figure>
    </section>

    <section className={`${styles.section} ${styles.performance}`}>
      <div className={styles.performanceCopy} data-reveal>
        <p>M5 Max</p>
        <h2>Не прокси.<br />Оригинал.</h2>
        <p>До 18 ядер CPU и 40 ядер GPU позволяют работать с тяжёлым материалом прямо на ноутбуке. Два движка ProRes ускоряют монтаж, а Neural Accelerators берут на себя локальные AI-задачи.</p>
        <ul>
          <li><Cpu size={19} /> до 40 ядер GPU</li>
          <li><Film size={19} /> два движка ProRes</li>
          <li><Database size={19} /> SSD до 14,5 ГБ/с</li>
        </ul>
      </div>
      <figure className={styles.performanceImage} data-reveal>
        <Image src="/media/macbook-pro-m5-max/performance.webp" alt="Монтаж и цветокоррекция на MacBook Pro 16" fill sizes="(max-width: 900px) 100vw, 760px" />
      </figure>
    </section>

    <section className={`${styles.section} ${styles.displaySection}`}>
      <div className={styles.heading} data-reveal>
        <p>Liquid Retina XDR</p>
        <h2>16,2 дюйма.<br />Каждый — рабочий.</h2>
        <p className={styles.lead}>Контраст 1 000 000:1, до 1600 нит в HDR и ProMotion до 120 Гц. Видите детали в тенях, ярком свете и каждом движении кадра.</p>
      </div>
      <figure className={`${styles.mediaFrame} ${styles.displayImage}`} data-reveal>
        <Image src="/media/macbook-pro-m5-max/display.webp" alt="Liquid Retina XDR дисплей MacBook Pro 16" fill sizes="(max-width: 800px) 100vw, 1240px" />
      </figure>
      <div className={styles.displayMetrics} data-reveal>
        <div><strong>1600 нит</strong><span>пиковая яркость HDR</span></div>
        <div><strong>120 Гц</strong><span>адаптивный ProMotion</span></div>
        <div><strong>3456 × 2234</strong><span>нативное разрешение</span></div>
      </div>
    </section>

    <section className={styles.battery}>
      <BatteryCharging size={34} />
      <p>До 22 часов воспроизведения видео</p>
      <h2>Розетка может<br />подождать.</h2>
      <span>100 Вт·ч внутри. Быстрая зарядка от адаптера 140 Вт — когда между двумя большими задачами всего один кофе.</span>
    </section>

    <section className={styles.closing}>
      <p>MacBook Pro 16″ · M5 Max</p>
      <h2>Большая работа.<br />Теперь мобильная.</h2>
      <BuyAnchor className={styles.button}>Выбрать конфигурацию <ArrowUpRight size={18} /></BuyAnchor>
    </section>

    <section className="bg-white px-4 pb-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <RelatedProducts products={related} />
      </div>
    </section>

    <footer className={styles.footnote}>
      <p>Изображения созданы с помощью ИИ для визуальной презентации устройства. Геометрия, оттенок и интерфейс на экране могут незначительно отличаться.</p>
      <p>Характеристики сверены по данным Apple для MacBook Pro 16″ с M5 Max: дисплей 16,2″, Space Black и Silver, до 128 ГБ памяти, до 8 ТБ SSD и до 22 часов воспроизведения видео.</p>
    </footer>
  </div>;
}
