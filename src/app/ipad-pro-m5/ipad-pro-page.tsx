"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Pencil, Sparkles, Zap } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import { IpadViewer } from "./ipad-viewer";
import styles from "./page.module.css";

const productHref = "/product/ipad-pro-13";

export function IpadProPage({ hasHeroVideo }: { hasHeroVideo: boolean }) {
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

  return <div ref={root} className={styles.page}>
    <header className={styles.hero}>
      <div className={styles.heroMedia}>
        <Image className={styles.heroPoster} src="/media/ipad-pro-m5/hero-poster.webp" alt="iPad Pro 13 дюймов в цвете Space Black" fill priority sizes="100vw" />
        {hasHeroVideo && <AdaptiveHeroVideo
          poster="/media/ipad-pro-m5/hero-poster.webp"
          aria-label="Видео iPad Pro 13 дюймов"
          sources={[{ src: "/media/ipad-pro-m5/hero.mp4", type: "video/mp4" }]}
        />}
      </div>
      <div className={styles.heroAction}>
        <h1 className={styles.srOnly}>iPad Pro 13″ с чипом M5</h1>
        <Link className={`${styles.buy} ${styles.heroBuy}`} href={productHref}>Купить</Link>
      </div>
    </header>

    <section className={styles.stats} aria-label="Главные характеристики">
      <div><strong>5,1 мм</strong><span>толщина корпуса</span></div>
      <div><strong>M5</strong><span>чип нового поколения</span></div>
      <div><strong>13″</strong><span>Ultra Retina XDR</span></div>
    </section>

    <section id="design" className={styles.section}>
      <div className={styles.heading} data-reveal>
        <p>Дизайн</p>
        <h2>Почти исчезает<br />в профиль.</h2>
        <p className={styles.lead}>Цельный алюминиевый корпус толщиной 5,1 мм весит 579 г в версии Wi‑Fi. Большой экран остаётся лёгким спутником для работы вне стола.</p>
      </div>
      <figure className={`${styles.imageFrame} ${styles.thinness}`} data-reveal>
        <Image src="/media/ipad-pro-m5/thinness.webp" alt="Тонкий серебристый корпус iPad Pro с разъёмом Thunderbolt" fill sizes="(max-width: 760px) 100vw, 1200px" />
        <figcaption><strong>5,1</strong><span>миллиметра</span></figcaption>
      </figure>
    </section>

    <section className={`${styles.section} ${styles.viewerSection}`}>
      <div className={styles.heading} data-reveal>
        <p>Два точных оттенка</p>
        <h2>Рассмотрите<br />со всех сторон.</h2>
        <p className={styles.lead}>Silver мягко отражает свет. Space Black выглядит глубже и строже. Переключайте оттенки и сравнивайте фактуру корпуса в одном точном ракурсе.</p>
      </div>
      <IpadViewer />
    </section>

    <section id="display" className={`${styles.section} ${styles.darkSection}`}>
      <div className={styles.heading} data-reveal>
        <p>Ultra Retina XDR</p>
        <h2>Чёрный остаётся<br />по-настоящему чёрным.</h2>
        <p className={styles.lead}>Два OLED-слоя работают вместе: высокая яркость, точный контраст и ProMotion от 10 до 120 Гц для движения без рывков.</p>
      </div>
      <figure className={`${styles.imageFrame} ${styles.displayImage}`} data-reveal>
        <Image src="/media/ipad-pro-m5/display.webp" alt="Яркое абстрактное изображение на дисплее Ultra Retina XDR" fill sizes="(max-width: 760px) 100vw, 1200px" />
      </figure>
      <dl className={styles.displayStats} data-reveal>
        <div><dt>1000 нит</dt><dd>яркость на всей площади для SDR и HDR</dd></div>
        <div><dt>1600 нит</dt><dd>пиковая яркость HDR</dd></div>
        <div><dt>2 000 000:1</dt><dd>контрастность tandem OLED</dd></div>
      </dl>
    </section>

    <section id="performance" className={`${styles.section} ${styles.performance}`}>
      <div className={styles.performanceCopy} data-reveal>
        <p>Производительность</p>
        <h2>M5.<br />Идея не ждёт.</h2>
        <p>Многослойный монтаж, сложная графика и локальные AI-задачи получают запас мощности, который раскрывается в профессиональных приложениях.</p>
        <ul>
          <li><Zap size={18} /> 10-ядерный GPU с Neural Accelerators</li>
          <li><Sparkles size={18} /> аппаратное ускорение трассировки лучей</li>
        </ul>
      </div>
      <figure className={styles.performanceImage} data-reveal>
        <Image src="/media/ipad-pro-m5/performance.webp" alt="iPad Pro с профессиональной монтажной шкалой на Magic Keyboard" fill sizes="(max-width: 860px) 100vw, 760px" />
      </figure>
    </section>

    <section className={`${styles.section} ${styles.pencilSection}`}>
      <figure className={styles.pencilImage} data-reveal>
        <Image src="/media/ipad-pro-m5/pencil.webp" alt="Архитектор рисует на iPad Pro с помощью Apple Pencil Pro" fill sizes="(max-width: 860px) 100vw, 760px" />
      </figure>
      <div className={styles.pencilCopy} data-reveal>
        <Pencil size={28} />
        <p>Apple Pencil Pro</p>
        <h2>Мысль становится линией.</h2>
        <p>Рисуйте, делайте пометки и управляйте инструментами естественным движением руки. Apple Pencil Pro приобретается отдельно.</p>
      </div>
    </section>

    <section className={styles.closing}>
      <p>iPad Pro 13″ · M5</p>
      <h2>Ваше большое полотно.</h2>
      <Link className={styles.buy} href={productHref}>Выбрать iPad Pro <ArrowUpRight size={18} /></Link>
      <Link className={styles.categoryLink} href="/catalog/ipad">Смотреть все модели iPad</Link>
    </section>

    <footer className={styles.footnote}>
      <p>Изображения созданы с помощью ИИ для визуальной презентации устройства и сценариев использования. Оттенок корпуса на экране может отличаться из-за освещения и настроек дисплея.</p>
      <p>Официальные покрытия iPad Pro 13″ (M5): Silver и Space Black. Nano-texture доступна для конфигураций 1 ТБ и 2 ТБ. Apple Pencil Pro и Magic Keyboard приобретаются отдельно.</p>
    </footer>
  </div>;
}
