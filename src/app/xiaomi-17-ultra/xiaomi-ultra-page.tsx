"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Aperture, ArrowUpRight, BatteryCharging, Cpu, Focus, ScanLine } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import styles from "./page.module.css";

const buyHref = "/product/xiaomi-17-ultra";
const finishes = [
  { id: "black", name: "Black", image: "/media/xiaomi-17-ultra/color-black.jpg" },
  { id: "white", name: "White", image: "/media/xiaomi-17-ultra/color-white.jpg" },
  { id: "green", name: "Starlit Green", image: "/media/xiaomi-17-ultra/color-green.jpg" },
] as const;

export function XiaomiUltraPage() {
  const root = useRef<HTMLDivElement>(null);
  const [finish, setFinish] = useState<(typeof finishes)[number]>(finishes[1]);

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
        <Link className={`${styles.buy} ${styles.heroBuy}`} href={buyHref}>Купить</Link>
      </header>

      <main>
        <section className={styles.intro}>
          <p className={styles.eyebrow} data-reveal>Xiaomi 17 Ultra · Leica</p>
          <h2 data-reveal>Свет. Фокус.<br />Дальше — история.</h2>
          <p className={styles.introLead} data-reveal>Камера, которая успевает поймать сцену за миг до того, как она исчезнет. Оптика Leica, крупный сенсор и оптический зум — настоящий, не программный — умещаются в корпусе, который удобно держать в руке.</p>
        </section>

        <section className={styles.metrics} aria-label="Ключевые характеристики камеры">
          <article data-reveal><strong>1″</strong><span>сенсор основной камеры Leica</span></article>
          <article data-reveal><strong>200 Мп</strong><span>телекамера с крупным сенсором</span></article>
          <article data-reveal><strong>75–100 мм</strong><span>непрерывный оптический зум</span></article>
        </section>

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

        <section className={styles.storyCard}>
          <figure className={styles.storyImage}>
            <Image src="/media/xiaomi-17-ultra/night-real.jpg" alt="Вечерний город, снятый на белый Xiaomi 17 Ultra" fill sizes="(max-width: 900px) 100vw, 1280px" />
          </figure>
          <div className={styles.storyCopy} data-reveal>
            <p className={styles.eyebrow}>Ночь без постановки</p>
            <h2>Свет как есть.<br />Момент как был.</h2>
            <p>LOFIC HDR держит в одном кадре огни города, отражения и лицо человека — без пересвеченного неба и плоских теней.</p>
          </div>
        </section>

        <section className={styles.colorsSection}>
          <div className={styles.colorsHead} data-reveal>
            <p className={styles.eyebrow}>Три характера</p>
            <h2>Цвет задаёт тон.</h2>
            <p>Чёрный, белый, Starlit Green. Матовая поверхность гасит блики, а металлическое кольцо вокруг камер держит взгляд на объективах.</p>
          </div>
          <figure className={styles.colorsImage} data-reveal>
            {finishes.map((item) => (
              <Image
                key={item.id}
                src={item.image}
                alt={`Xiaomi 17 Ultra в цвете ${item.name}`}
                fill
                sizes="(max-width: 900px) 100vw, 850px"
                aria-hidden={finish.id !== item.id}
                className={`${styles.colorVariant} ${finish.id === item.id ? styles.colorVariantActive : ""}`}
              />
            ))}
            <figcaption className={styles.colorControls}>
              <p className={styles.selectedFinish}>Цвет: <strong>{finish.name}</strong></p>
              <div className={styles.swatches} role="radiogroup" aria-label="Выберите цвет корпуса">
                {finishes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={finish.id === item.id}
                    aria-label={`Цвет ${item.name}`}
                    onClick={() => setFinish(item)}
                  >
                    <i className={styles[item.id]} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </figcaption>
          </figure>
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
          <Link className={styles.buy} href={buyHref}>Выбрать Xiaomi 17 Ultra <ArrowUpRight size={18} /></Link>
        </section>
      </main>

      <footer className={styles.footnote}>
        <p>Изображения на странице сгенерированы нейросетью и служат для визуальной презентации устройства — некоторые детали и интерфейс могут немного отличаться от реальных.</p>
        <p>Характеристики приведены по официальным глобальным данным Xiaomi для Xiaomi 17 Ultra — комплектация, объём памяти и доступные цвета могут отличаться в зависимости от региона.</p>
      </footer>
    </div>
  );
}
