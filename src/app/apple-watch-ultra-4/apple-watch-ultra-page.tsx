"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight, BatteryCharging, HeartPulse, LocateFixed, Satellite, Waves } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import { FinishPicker } from "./finish-picker";
import styles from "./page.module.css";

const buyHref = "/product/apple-watch-ultra-4";

export function AppleWatchUltraPage() {
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
      <Image className={styles.heroPoster} src="/media/apple-watch-ultra-4/hero-poster.webp" alt="Apple Watch Ultra 4 в корпусе из натурального титана" fill priority sizes="100vw" />
      <AdaptiveHeroVideo
        poster="/media/apple-watch-ultra-4/hero-poster.webp"
        aria-label="Видео Apple Watch Ultra 4"
        sources={[
          { src: "/media/apple-watch-ultra-4/hero.m4v", type: "video/mp4" },
          { src: "/media/apple-watch-ultra-4/hero.mov", type: "video/quicktime" },
        ]}
      />
      <h1 className={styles.srOnly}>Apple Watch Ultra 4</h1>
      <Link className={`${styles.buy} ${styles.heroBuy}`} href={buyHref}>Купить</Link>
    </header>

    <section className={styles.manifesto}>
      <p data-reveal>Apple Watch Ultra 4</p>
      <h2 data-reveal>Дальше —<br />это направление.</h2>
      <p className={styles.manifestoLead} data-reveal>Титан, точная навигация и самый большой запас энергии среди Apple Watch. Для дня, который не заканчивается у двери офиса.</p>
    </section>

    <section className={styles.vitals} aria-label="Ключевые характеристики">
      <div data-reveal><strong>50 часов</strong><span>обычного использования</span></div>
      <div data-reveal><strong>49 мм</strong><span>корпус из титана Grade 5</span></div>
      <div data-reveal><strong>40 метров</strong><span>погружение с WR100</span></div>
    </section>

    <section className={styles.finishSection}>
      <div className={styles.heading} data-reveal>
        <p>Два покрытия</p>
        <h2>Один характер.<br />Два способа его показать.</h2>
        <p className={styles.lead}>Натуральный титан подчёркивает фактуру металла. Чёрное DLC-покрытие собирает корпус в цельный графичный силуэт.</p>
      </div>
      <FinishPicker />
    </section>

    <section className={styles.alpine}>
      <Image src="/media/apple-watch-ultra-4/alpine.webp" alt="Apple Watch Ultra 4 на руке бегуна в горах" fill sizes="100vw" />
      <div className={styles.alpineCopy} data-reveal>
        <LocateFixed size={29} />
        <p>Точный двухчастотный GPS</p>
        <h2>Маршрут знает,<br />где вы были.</h2>
        <span>Высота, темп, дистанция и возвращение по собственному треку — даже там, где город давно остался внизу.</span>
      </div>
    </section>

    <section className={styles.endurance}>
      <div className={styles.enduranceTitle} data-reveal>
        <p>Энергия</p>
        <h2>Батарея,<br />которую трудно обогнать.</h2>
      </div>
      <div className={styles.chargeDial} data-reveal>
        <span>до</span><strong>50</strong><em>часов</em>
      </div>
      <div className={styles.enduranceCopy} data-reveal>
        <BatteryCharging size={28} />
        <p><strong>15 минут</strong> быстрой зарядки дают до <strong>18 часов</strong> обычной работы. Ночь, тренировка и следующий день помещаются в один заряд.</p>
      </div>
    </section>

    <section className={styles.ocean}>
      <Image src="/media/apple-watch-ultra-4/ocean-diver.webp" alt="Фридайвер проверяет глубину погружения на Apple Watch Ultra 4" fill sizes="100vw" />
      <div className={styles.oceanCopy} data-reveal>
        <Waves size={31} />
        <p>Глубиномер и датчик температуры воды</p>
        <h2>Ниже поверхности.<br />Всё ещё на связи.</h2>
        <span>WR100 подходит для скоростных водных видов спорта и рекреационных погружений на глубину до 40 метров.</span>
      </div>
    </section>

    <section className={styles.intelligence}>
      <div className={styles.heading} data-reveal>
        <p>Важное — ближе</p>
        <h2>Слышит тело.<br />Понимает контекст.</h2>
      </div>
      <div className={styles.intelligenceGrid}>
        <article data-reveal><HeartPulse size={30} /><h3>Новая система датчиков здоровья</h3><p>Более точные оптические и электрические измерения помогают видеть пульс, восстановление, сон и долгосрочные изменения.</p></article>
        <article data-reveal><Satellite size={30} /><h3>Связь за пределами сети</h3><p>Встроенная спутниковая связь помогает отправить сообщение или запросить помощь вдали от сотового покрытия.</p></article>
      </div>
    </section>

    <section className={styles.closing}>
      <p>Apple Watch Ultra 4</p>
      <h2>У вас есть<br />следующая точка.</h2>
      <Link className={styles.buy} href={buyHref}>Выбрать Apple Watch <ArrowUpRight size={18} /></Link>
    </section>

    <footer className={styles.footnote}>
      <p>Изображения созданы с помощью ИИ для визуальной презентации устройства и сценариев использования. Интерфейс, оттенки и детали ремешка могут отличаться от серийного устройства.</p>
      <p>Характеристики сверены по данным Apple для Apple Watch Ultra 4: корпус 49 мм из титана Grade 5, покрытия Natural и Black, до 50 часов обычного использования, WR100 и рекреационные погружения до 40 м. Доступность спутниковых и медицинских функций зависит от страны.</p>
    </footer>
  </div>;
}
