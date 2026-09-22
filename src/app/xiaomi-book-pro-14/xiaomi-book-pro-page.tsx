"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Cpu, Move3D, ScanLine } from "lucide-react";
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

export function XiaomiBookProPage({ product, related }: { product: ProductDetail; related: CatalogCardData[] }) {
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
    root.current?.querySelectorAll("[data-reveal]").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={styles.page}>
      <header className={styles.hero}>
        <AdaptiveHeroVideo
          poster="/media/xiaomi-book-pro-14/hero-poster.jpg"
          aria-label="Видео Xiaomi Book Pro 14"
          sources={[{ src: "/media/xiaomi-book-pro-14/hero.mp4", type: "video/mp4" }]}
          onEnded={(event) => {
            event.currentTarget.currentTime = 0;
            event.currentTarget.pause();
          }}
        />
        <h1 className={styles.srOnly}>Xiaomi Book Pro 14</h1>
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

      <main>
        <section className={styles.displaySection}>
          <div className={styles.displayCopy} data-reveal>
            <ScanLine size={29} />
            <p className={styles.kicker}>14,6″ · 3.1K OLED · 120 Гц</p>
            <h2>Цвет, который<br />не нужно угадывать.</h2>
            <p>Формат 3:2 даёт больше пространства по вертикали, а OLED честно показывает градации, глубокий чёрный и движение без рывков. Экран сенсорный — с материалом можно работать напрямую, руками.</p>
          </div>
          <div className={styles.spectrum} aria-hidden="true"><i /><i /><i /></div>
        </section>

        <section className={styles.performanceSection}>
          <figure className={styles.fullImage}>
            <Image src="/media/xiaomi-book-pro-14/performance-real.jpg" alt="Дизайнер работает на Xiaomi Book Pro 14" fill sizes="(max-width: 900px) 100vw, 1320px" />
          </figure>
          <div className={styles.overlayCopy} data-reveal>
            <Cpu size={29} />
            <p className={styles.kicker}>До Intel Core Ultra X7 358H</p>
            <h2>Держит нагрузку.<br />Не держит вас.</h2>
            <p>До 32 ГБ быстрой памяти и SSD на 1 ТБ — запас для монтажа, 3D и больших проектов. Испарительная камера на 10 000 мм² не даёт производительности проседать даже при долгой нагрузке.</p>
          </div>
        </section>

        <section className={styles.travelSection}>
          <div className={styles.travelCopy} data-reveal>
            <Move3D size={29} />
            <p className={styles.kicker}>1,08 килограмма свободы</p>
            <h2>Открывается там,<br />где начинается работа.</h2>
            <p>Магниевый корпус, карбоновое основание и компактный блок питания — эта машина едет туда же, куда и вы, когда приходит следующая идея.</p>
          </div>
          <figure className={styles.travelImage} data-reveal>
            <Image src="/media/xiaomi-book-pro-14/travel-real.jpg" alt="Работа на Xiaomi Book Pro 14 в аэропорту" fill sizes="(max-width: 900px) 100vw, 58vw" />
          </figure>
        </section>

        <section className={styles.closing}>
          <p>Xiaomi Book Pro 14</p>
          <h2>Весит меньше.<br />Может больше.</h2>
          <BuyAnchor className={styles.buy}>Выбрать конфигурацию <ArrowUpRight size={18} /></BuyAnchor>
        </section>
      </main>

      <section className="bg-white px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-6xl">
          <RelatedProducts products={related} />
        </div>
      </section>

      <footer className={styles.footnote}>
        <p>Изображения на странице сгенерированы нейросетью — для визуальной презентации устройства и сценариев использования. Интерфейс, текстуры и отдельные детали могут немного отличаться от реальных.</p>
        <p>Характеристики приведены для Xiaomi Book Pro 14 поколения 2026 года — процессор, объём памяти, накопитель, цвет и наличие сенсорного OLED-экрана зависят от конкретной конфигурации и региона продаж.</p>
      </footer>
    </div>
  );
}
