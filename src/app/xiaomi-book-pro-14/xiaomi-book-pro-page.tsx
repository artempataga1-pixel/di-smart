"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BatteryCharging, Cpu, Gauge, Move3D, Palette, ScanLine } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import styles from "./page.module.css";

const buyHref = "/product/xiaomi-book-pro-14";
const finishes = [
  { id: "gray", name: "Elegant Gray", image: "/media/xiaomi-book-pro-14/color-gray.jpg" },
  { id: "white", name: "White", image: "/media/xiaomi-book-pro-14/color-white.jpg" },
  { id: "blue", name: "Soft Fog Blue", image: "/media/xiaomi-book-pro-14/color-blue.jpg" },
  { id: "pink", name: "Soft Light Pink", image: "/media/xiaomi-book-pro-14/color-pink.jpg" },
] as const;

export function XiaomiBookProPage() {
  const root = useRef<HTMLDivElement>(null);
  const [finish, setFinish] = useState<(typeof finishes)[number]>(finishes[2]);

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
        <Link className={`${styles.buy} ${styles.heroBuy}`} href={buyHref}>Купить</Link>
      </header>

      <main>
        <section className={styles.intro}>
          <p className={styles.kicker} data-reveal>Xiaomi Book Pro 14</p>
          <h2 data-reveal>Легче, чем кажется.<br />Сильнее, чем ждёшь.</h2>
          <p className={styles.lead} data-reveal>Профессиональный экран, серьёзная производительность и корпус чуть тяжелее килограмма. Для работы, которую хочется брать с собой.</p>
        </section>

        <section className={styles.metrics} aria-label="Ключевые характеристики">
          <article data-reveal><strong>1,08 кг</strong><span>вес ноутбука</span></article>
          <article data-reveal><strong>14,95 мм</strong><span>толщина корпуса</span></article>
          <article data-reveal><strong>до 50 Вт</strong><span>стабильной мощности</span></article>
        </section>

        <section className={styles.colorsSection}>
          <div className={styles.colorsHead} data-reveal>
            <Palette size={28} />
            <p className={styles.kicker}>Четыре отделки</p>
            <h2>Рабочий инструмент.<br />С вашим характером.</h2>
            <p>Бархатистый магниевый сплав мягко рассеивает свет и почти не утяжеляет корпус. Выберите оттенок — ракурс останется тем же.</p>
          </div>
          <figure className={styles.colorStage} data-reveal>
            {finishes.map((item) => (
              <Image
                key={item.id}
                src={item.image}
                alt={`Xiaomi Book Pro 14, цвет ${item.name}`}
                fill
                sizes="(max-width: 900px) 100vw, 1050px"
                aria-hidden={finish.id !== item.id}
                className={`${styles.colorVariant} ${finish.id === item.id ? styles.colorVariantActive : ""}`}
              />
            ))}
            <figcaption className={styles.finishPicker}>
              <p>Цвет: <strong>{finish.name}</strong></p>
              <div role="radiogroup" aria-label="Выберите цвет Xiaomi Book Pro 14">
                {finishes.map((item) => (
                  <button key={item.id} type="button" role="radio" aria-checked={finish.id === item.id} aria-label={`Цвет ${item.name}`} onClick={() => setFinish(item)}>
                    <i className={styles[item.id]} /><span>{item.name}</span>
                  </button>
                ))}
              </div>
            </figcaption>
          </figure>
        </section>

        <section className={styles.displaySection}>
          <div className={styles.displayCopy} data-reveal>
            <ScanLine size={29} />
            <p className={styles.kicker}>14,6″ · 3.1K OLED · 120 Гц</p>
            <h2>Цвет, который<br />не нужно угадывать.</h2>
            <p>Формат 3:2 оставляет больше пространства по высоте, а OLED-панель точно показывает градации, глубокий чёрный и движение без рывков. Сенсорный экран поддерживает прямую работу с материалом.</p>
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
            <h2>Сложное становится<br />рабочим процессом.</h2>
            <p>До 32 ГБ быстрой памяти и SSD на 1 ТБ дают запас для монтажа, 3D и больших проектов. Испарительная камера площадью 10 000 мм² помогает долго удерживать производительность.</p>
          </div>
        </section>

        <section className={styles.travelSection}>
          <div className={styles.travelCopy} data-reveal>
            <Move3D size={29} />
            <p className={styles.kicker}>1,08 килограмма свободы</p>
            <h2>Открывается там,<br />где начинается работа.</h2>
            <p>Магниевый корпус, карбоновое основание и компактная зарядка помогают взять профессиональную машину туда, где появляется следующая идея.</p>
          </div>
          <figure className={styles.travelImage} data-reveal>
            <Image src="/media/xiaomi-book-pro-14/travel-real.jpg" alt="Работа на Xiaomi Book Pro 14 в аэропорту" fill sizes="(max-width: 900px) 100vw, 58vw" />
          </figure>
        </section>

        <section className={styles.capabilities}>
          <article data-reveal><Gauge size={28} /><strong>50 Вт</strong><p>Производительность удерживается под продолжительной нагрузкой.</p></article>
          <article data-reveal><BatteryCharging size={28} /><strong>72 Вт·ч</strong><p>Большая батарея для рабочего дня, дороги и вечернего просмотра.</p></article>
          <article data-reveal><ScanLine size={28} /><strong>129 см²</strong><p>Просторный чувствительный тачпад для точных жестов и управления.</p></article>
        </section>

        <section className={styles.closing}>
          <p>Xiaomi Book Pro 14</p>
          <h2>Весит меньше.<br />Может больше.</h2>
          <Link className={styles.buy} href={buyHref}>Выбрать Xiaomi Book Pro 14 <ArrowUpRight size={18} /></Link>
        </section>
      </main>

      <footer className={styles.footnote}>
        <p>Изображения созданы с помощью ИИ для визуальной презентации устройства и сценариев использования. Интерфейс, фактура и отдельные детали могут отличаться.</p>
        <p>Характеристики относятся к Xiaomi Book Pro 14 поколения 2026 года. Процессор, память, накопитель, цвет и доступность сенсорного OLED-экрана зависят от конфигурации и региона.</p>
      </footer>
    </div>
  );
}
