"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BatteryCharging, MonitorUp, PenTool, ShieldCheck, Wifi } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import styles from "./page.module.css";

const buyHref = "/product/galaxy-tab-s11-ultra";
const finishes = [
  { id: "gray", name: "Серый", image: "/media/galaxy-tab-s11-ultra/design-gray.jpg" },
  { id: "silver", name: "Серебристый", image: "/media/galaxy-tab-s11-ultra/design-silver.jpg" },
] as const;

export function GalaxyTabUltraPage() {
  const root = useRef<HTMLDivElement>(null);
  const [finish, setFinish] = useState<(typeof finishes)[number]>(finishes[0]);

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
          poster="/media/galaxy-tab-s11-ultra/hero-poster.jpg"
          aria-label="Видео Samsung Galaxy Tab S11 Ultra"
          sources={[{ src: "/media/galaxy-tab-s11-ultra/hero.mp4", type: "video/mp4" }]}
          onEnded={(event) => {
            event.currentTarget.currentTime = 0;
            event.currentTarget.pause();
          }}
        />
        <h1 className={styles.srOnly}>Samsung Galaxy Tab S11 Ultra</h1>
        <Link className={`${styles.buy} ${styles.heroBuy}`} href={buyHref}>Купить</Link>
      </header>

      <main>
        <section className={styles.intro}>
          <p className={styles.kicker} data-reveal>Galaxy Tab S11 Ultra</p>
          <h2 data-reveal>Пространство<br />для большого.</h2>
          <p className={styles.lead} data-reveal>Один экран для идеи, эскиза, монтажа и готовой работы. Самый большой Galaxy Tab объединяет тонкий корпус, точный S Pen и настольный режим DeX.</p>
        </section>

        <section className={styles.metrics} aria-label="Основные характеристики">
          <article data-reveal><strong>14,6″</strong><span>Dynamic AMOLED 2X</span></article>
          <article data-reveal><strong>5,1 мм</strong><span>толщина корпуса</span></article>
          <article data-reveal><strong>692 г</strong><span>вес планшета</span></article>
        </section>

        <section className={styles.designSection}>
          <div className={styles.copy} data-reveal>
            <p className={styles.kicker}>Тонкий. И серьёзный.</p>
            <h2>Почти исчезает<br />в профиле.</h2>
            <p>Корпус из Armor Aluminum стал тоньше и легче, сохранив прочность. Камеры собраны в чистую линию, а новый S Pen ощущается в руке как привычный инструмент.</p>
          </div>
          <figure className={styles.designImage} data-reveal>
            {finishes.map((item) => (
              <Image
                key={item.id}
                src={item.image}
                alt={`Samsung Galaxy Tab S11 Ultra, цвет ${item.name}`}
                fill
                sizes="(max-width: 900px) 100vw, 58vw"
                aria-hidden={finish.id !== item.id}
                className={`${styles.colorVariant} ${finish.id === item.id ? styles.colorVariantActive : ""}`}
              />
            ))}
            <figcaption className={styles.finishPicker}>
              <p>Цвет: <strong>{finish.name}</strong></p>
              <div role="radiogroup" aria-label="Выберите цвет Galaxy Tab S11 Ultra">
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
          <div className={styles.displayCopy} data-reveal>
            <span>2960 × 1848</span>
            <h2>Изображение<br />заполняет всё.</h2>
            <p>Dynamic AMOLED 2X показывает глубокий чёрный, точные оттенки и плавное движение. Антибликовое покрытие помогает сохранить детали даже при ярком дневном свете.</p>
          </div>
          <div className={styles.orbits} aria-hidden="true"><i /><i /><i /></div>
        </section>

        <section className={styles.createSection}>
          <figure className={styles.fullImage}>
            <Image src="/media/galaxy-tab-s11-ultra/create-real.jpg" alt="Иллюстратор рисует на Galaxy Tab S11 Ultra с помощью S Pen" fill sizes="(max-width: 900px) 100vw, 1320px" />
          </figure>
          <div className={styles.overlayCopy} data-reveal>
            <PenTool size={28} />
            <p className={styles.kicker}>Новый S Pen в комплекте</p>
            <h2>Мысль сразу<br />становится линией.</h2>
            <p>Улучшенная форма помогает точнее вести штрих и дольше работать без усталости. Быстрые инструменты, заметки и AI-функции находятся рядом с кончиком пера.</p>
          </div>
        </section>

        <section className={styles.dexSection}>
          <div className={styles.dexHead} data-reveal>
            <MonitorUp size={29} />
            <p className={styles.kicker}>Samsung DeX</p>
            <h2>Планшет, когда удобно.<br />Рабочее место, когда нужно.</h2>
            <p>Открывайте несколько окон, переносите материалы между приложениями и подключайте клавиатуру. Пространства достаточно для монтажа, созвона и заметок одновременно.</p>
          </div>
          <figure className={styles.dexImage} data-reveal>
            <Image src="/media/galaxy-tab-s11-ultra/dex-real.jpg" alt="Galaxy Tab S11 Ultra с клавиатурой в режиме Samsung DeX" fill sizes="(max-width: 900px) 100vw, 1240px" />
          </figure>
        </section>

        <section className={styles.capabilities}>
          <article data-reveal><BatteryCharging size={28} /><strong>11 600 мА·ч</strong><p>Запас энергии для долгой работы, фильмов и творчества вдали от розетки.</p></article>
          <article data-reveal><ShieldCheck size={28} /><strong>IP68</strong><p>Планшет и S Pen защищены от пыли и воды для более спокойной работы вне дома.</p></article>
          <article data-reveal><Wifi size={28} /><strong>Wi‑Fi 7</strong><p>Быстрая передача больших проектов и стабильная связь в совместимых сетях.</p></article>
        </section>

        <section className={styles.closing}>
          <p>Samsung Galaxy Tab S11 Ultra</p>
          <h2>Больше экрана.<br />Больше вашего.</h2>
          <Link className={styles.buy} href={buyHref}>Выбрать Galaxy Tab S11 Ultra <ArrowUpRight size={18} /></Link>
        </section>
      </main>

      <footer className={styles.footnote}>
        <p>Изображения созданы с помощью ИИ для визуальной презентации устройства и сценариев использования. Интерфейс, аксессуары и отдельные детали могут отличаться.</p>
        <p>Характеристики сверены по глобальным данным Samsung. Доступность цветов, памяти, Wi‑Fi 7 и отдельных Galaxy AI-функций зависит от региона, сети и версии программного обеспечения.</p>
      </footer>
    </div>
  );
}
