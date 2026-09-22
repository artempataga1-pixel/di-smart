"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Aperture, ArrowUpRight, BatteryCharging, Cpu, Focus, ScanLine } from "lucide-react";
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

export function XiaomiUltraPage({ product, related }: { product: ProductDetail; related: CatalogCardData[] }) {
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
          poster="/media/xiaomi-17-ultra/hero-poster.webp"
          aria-label="Xiaomi 17 Ultra крупным планом"
          sources={[
            { src: "/media/xiaomi-17-ultra/hero.m4v", type: "video/mp4" },
            { src: "/media/xiaomi-17-ultra/hero.mov", type: "video/quicktime" },
          ]}
          onEnded={(event) => {
            event.currentTarget.currentTime = 0;
            event.currentTarget.pause();
          }}
        />
        <h1 className={styles.srOnly}>Xiaomi 17 Ultra</h1>
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
        <section className={styles.cameraSection}>
          <div className={styles.sectionCopy} data-reveal>
            <Aperture size={28} />
            <p className={styles.eyebrow}>Leica Summilux</p>
            <h2>Свет — уже<br />материал для кадра.</h2>
            <p>50 Мп и сенсор формата 1 дюйм — это тени с объёмом и яркий свет без потери фактуры. А диафрагма ƒ/1,67 вытягивает кадр даже там, где солнце уже давно село.</p>
          </div>
          <figure className={styles.mediaFrame} data-reveal>
            <Image src="/media/xiaomi-17-ultra/camera.webp" alt="Камера Leica смартфона Xiaomi 17 Ultra крупным планом" fill sizes="(max-width: 900px) 100vw, 58vw" />
          </figure>
        </section>

        <section className={styles.focalSection}>
          <div className={styles.focalTitle} data-reveal>
            <Focus size={28} />
            <p className={styles.eyebrow}>Четыре взгляда на одну сцену</p>
            <h2>Подойдите ближе.<br />Не делая шага.</h2>
          </div>
          <div className={styles.focalRail} data-reveal aria-label="Фокусные расстояния камер">
            <span><b>14</b> мм<small>ультраширокий</small></span>
            <span><b>23</b> мм<small>основной</small></span>
            <span><b>75</b> мм<small>портрет</small></span>
            <span><b>100</b> мм<small>телефото</small></span>
          </div>
          <p className={styles.focalText} data-reveal>200-мегапиксельный телемодуль Leica и правда двигает линзы — фокусное расстояние меняется физически, от 75 до 100 мм. Поэтому кадр остаётся оптическим, а перспектива — такой же, как видит глаз.</p>
        </section>

        <section className={styles.displaySection}>
          <div className={styles.displayVisual} data-reveal>
            <Image src="/media/xiaomi-17-ultra/display.webp" alt="Экран Xiaomi 17 Ultra и белый смартфон на рабочем столе" fill sizes="(max-width: 900px) 100vw, 58vw" />
          </div>
          <div className={styles.displayCopy} data-reveal>
            <ScanLine size={28} />
            <p className={styles.eyebrow}>6,9″ HyperRGB</p>
            <h2>Экран, которому<br />можно доверять.</h2>
            <p>Панель 2608 × 1200 с частотой от 1 до 120 Гц точно передаёт оттенки и не теряется на солнце — пиковая яркость доходит до 3500 нит.</p>
          </div>
        </section>

        <section className={styles.powerSection}>
          <div className={styles.powerTitle} data-reveal>
            <p className={styles.eyebrow}>Мощность Ultra</p>
            <h2>Снимает весь день.<br />Обрабатывает сразу.</h2>
          </div>
          <div className={styles.powerGrid}>
            <article data-reveal><Cpu size={27} /><strong>Snapdragon 8 Elite Gen 5</strong><p>3-нм платформа тянет съёмку, монтаж и игры без просадок.</p></article>
            <article data-reveal><BatteryCharging size={27} /><strong>6000 мА·ч</strong><p>90 Вт по кабелю, 50 Вт без проводов — заряд возвращается быстрее, чем успеваешь заскучать.</p></article>
          </div>
        </section>

        <section className={styles.closing}>
          <p>Xiaomi 17 Ultra</p>
          <h2>Ваша история.<br />В полном свете.</h2>
          <BuyAnchor className={styles.buy}>Выбрать конфигурацию <ArrowUpRight size={18} /></BuyAnchor>
        </section>
      </main>

      <section className="bg-white px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-6xl">
          <RelatedProducts products={related} />
        </div>
      </section>

      <footer className={styles.footnote}>
        <p>Изображения на странице сгенерированы нейросетью и служат для визуальной презентации устройства — некоторые детали и интерфейс могут немного отличаться от реальных.</p>
        <p>Характеристики приведены по официальным глобальным данным Xiaomi для Xiaomi 17 Ultra — комплектация, объём памяти и доступные цвета могут отличаться в зависимости от региона.</p>
      </footer>
    </div>
  );
}
