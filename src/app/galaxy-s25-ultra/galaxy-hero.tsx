"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { chapters } from "./galaxy-content";
import { media } from "./galaxy-media";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { PillCta } from "@/components/ui/PillCta";
import { Price } from "@/components/ui/Price";
import type { ProductDetail } from "@/lib/catalog";
import styles from "./galaxy-hero.module.css";

const PRODUCT_HREF = "/product/galaxy-s25-ultra";

export function GalaxyHero({ product }: { product: ProductDetail | null }) {
  const [activeChapter, setActiveChapter] = useState(chapters[0].id);
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveChapter(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    for (const el of sectionRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function registerSection(id: string) {
    return (el: HTMLElement | null) => {
      if (el) sectionRefs.current.set(id, el);
      else sectionRefs.current.delete(id);
    };
  }

  const buyHref = product ? PRODUCT_HREF : "/catalog";

  return (
    <div className={styles.page}>
      <nav className={styles.stickyNav} aria-label="Разделы страницы">
        <div className={styles.stickyNavInner}>
          {chapters.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              aria-current={activeChapter === c.id ? "location" : undefined}
              className={styles.stickyNavLink}
            >
              {c.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="hero" ref={registerSection("hero")} className={styles.hero}>
        <MediaFrame asset={media.heroPoster} className="absolute inset-0" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Samsung Galaxy S25 Ultra</p>
          <h1 className={styles.heroTitle}>Титан. S Pen. 200 Мп.</h1>
          <p className={styles.heroSubtitle}>
            Флагман года: титановый корпус класса IP68, встроенный S Pen и камера
            200 Мп с AI Zoom до 100x.
          </p>
          <div className={styles.heroActions}>
            <PillCta href={buyHref}>{product ? "Купить" : "Смотреть каталог"}</PillCta>
            {product && <Price price={product.basePriceByn} size="lg" className="text-white" />}
          </div>
        </div>
      </section>

      <footer className={styles.footnote}>
        <p>
          Фотографии и видео на этой странице — иллюстративные материалы, часть
          дорабатывается; не являются официальными материалами Samsung.
          Актуальные характеристики и цена — на{" "}
          <Link href={buyHref}>странице товара</Link>.
        </p>
      </footer>

      <div className={styles.finalCta}>
        <PillCta href={buyHref}>{product ? "Купить Galaxy S25 Ultra" : "Смотреть каталог"}</PillCta>
      </div>
    </div>
  );
}
