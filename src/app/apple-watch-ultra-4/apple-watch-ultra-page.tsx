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
      <h2 data-reveal>Дальше, чем обычно.<br />Дольше, чем ожидаете.</h2>
      <p className={styles.manifestoLead} data-reveal>Титановый корпус, точная навигация и самый большой запас энергии среди всех Apple Watch. День с Ultra 4 не заканчивается за порогом офиса — если у вас были другие планы.</p>
    </section>

    <section className={styles.vitals} aria-label="Ключевые характеристики">
      <div data-reveal><strong>50 часов</strong><span>работы в обычном режиме</span></div>
      <div data-reveal><strong>49 мм</strong><span>титан Grade 5, цельный корпус</span></div>
      <div data-reveal><strong>40 метров</strong><span>рекреационных погружений с WR100</span></div>
    </section>

    <section className={styles.finishSection}>
      <div className={styles.heading} data-reveal>
        <p>Два покрытия</p>
        <h2>Характер один.<br />Оттенков — два.</h2>
        <p className={styles.lead}>Натуральный титан не прячет текстуру металла — она видна на свету. Чёрное DLC-покрытие, наоборот, собирает корпус в единый плотный силуэт.</p>
      </div>
      <FinishPicker />
    </section>

    <section className={styles.alpine}>
      <Image src="/media/apple-watch-ultra-4/alpine.webp" alt="Apple Watch Ultra 4 на запястье бегуна в горах" fill sizes="100vw" />
      <div className={styles.alpineCopy} data-reveal>
        <LocateFixed size={29} />
        <p>Двухчастотный GPS для точной навигации</p>
        <h2>Трек помнит<br />каждый поворот.</h2>
        <span>Высота, темп, дистанция — и возвращение назад по собственному следу, если понадобится. Работает и там, где от города остались только координаты на карте.</span>
      </div>
    </section>

    <section className={styles.endurance}>
      <div className={styles.enduranceTitle} data-reveal>
        <p>Энергия</p>
        <h2>Батарея,<br />которая не спешит садиться.</h2>
      </div>
      <div className={styles.chargeDial} data-reveal>
        <span>до</span><strong>50</strong><em>часов</em>
      </div>
      <div className={styles.enduranceCopy} data-reveal>
        <BatteryCharging size={28} />
        <p><strong>15 минут</strong> на зарядке — и в запасе ещё <strong>18 часов</strong> обычной работы. Сон, тренировка и добрая половина следующего дня укладываются в один цикл заряда.</p>
      </div>
    </section>

    <section className={styles.ocean}>
      <Image src="/media/apple-watch-ultra-4/ocean-diver.webp" alt="Фридайвер сверяет глубину погружения по Apple Watch Ultra 4" fill sizes="100vw" />
      <div className={styles.oceanCopy} data-reveal>
        <Waves size={31} />
        <p>Глубиномер и датчик температуры воды</p>
        <h2>Ушли под воду.<br />Часы — на связи.</h2>
        <span>Рейтинг WR100 держит часы на скоростных водных видах спорта и рекреационных погружениях — до 40 метров под поверхностью.</span>
      </div>
    </section>

    <section className={styles.intelligence}>
      <div className={styles.heading} data-reveal>
        <p>Важное — ближе</p>
        <h2>Слышит тело.<br />Реагирует по ситуации.</h2>
      </div>
      <div className={styles.intelligenceGrid}>
        <article data-reveal><HeartPulse size={30} /><h3>Датчики здоровья нового поколения</h3><p>Оптические и электрические измерения стали точнее — пульс, восстановление, сон и то, как эти показатели меняются у вас месяцами, видно яснее.</p></article>
        <article data-reveal><Satellite size={30} /><h3>Сигнал, когда сети нет</h3><p>Встроенный спутниковый модуль отправит сообщение или вызовет помощь даже там, куда не дотягиваются вышки сотовой связи.</p></article>
      </div>
    </section>

    <section className={styles.closing}>
      <p>Apple Watch Ultra 4</p>
      <h2>Следующая точка<br />уже на карте.</h2>
      <Link className={styles.buy} href={buyHref}>Выбрать Apple Watch Ultra 4 <ArrowUpRight size={18} /></Link>
    </section>

    <footer className={styles.footnote}>
      <p>Изображения на странице сгенерированы нейросетью — чтобы показать устройство и типичные сценарии использования. Интерфейс, оттенки корпуса и детали ремешка у серийных часов могут немного отличаться.</p>
      <p>Характеристики выверены по официальным данным Apple для Apple Watch Ultra 4: корпус 49 мм из титана Grade 5, покрытия Natural и Black, до 50 часов работы в обычном режиме, рейтинг WR100 и рекреационные погружения до 40 метров. Спутниковые и медицинские функции доступны не во всех странах.</p>
    </footer>
  </div>;
}
