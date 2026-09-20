"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Activity, ArrowUpRight, BatteryCharging, Languages, ShieldCheck, Volume2 } from "lucide-react";
import { AdaptiveHeroVideo } from "@/components/media/AdaptiveHeroVideo";
import styles from "./page.module.css";

const buyHref = "/product/airpods-pro-3";

export function AirpodsProPage() {
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
        poster="/media/airpods-pro-3/hero-poster.webp"
        aria-label="Видео AirPods Pro 3"
        sources={[
          { src: "/media/airpods-pro-3/hero.m4v", type: "video/mp4" },
          { src: "/media/airpods-pro-3/hero.mov", type: "video/quicktime" },
        ]}
      />
      <h1 className={styles.srOnly}>AirPods Pro 3</h1>
      <Link className={`${styles.buy} ${styles.heroBuy}`} href={buyHref}>Купить</Link>
    </header>

    <section className={styles.intro}>
      <p data-reveal>AirPods Pro 3</p>
      <h2 data-reveal>Уберите лишнее.<br />Оставьте музыку.</h2>
      <p className={styles.introLead} data-reveal>Новая акустическая архитектура делает тишину глубже, сцену — шире, а голос — ближе. И впервые AirPods измеряют пульс во время тренировки.</p>
    </section>

    <section className={styles.metrics} aria-label="Ключевые характеристики">
      <div data-reveal><strong>до 2×</strong><span>эффективнее шумоподавление</span></div>
      <div data-reveal><strong>8 часов</strong><span>музыки с включённым ANC</span></div>
      <div data-reveal><strong>IP57</strong><span>защита от пыли, пота и воды</span></div>
    </section>

    <section className={styles.design}>
      <div className={styles.designCopy} data-reveal>
        <p>Новая посадка</p>
        <h2>Меньше внутри.<br />Надёжнее в ухе.</h2>
        <p>Корпус стал компактнее, а амбушюры с пенной прослойкой лучше изолируют внешний шум. Пять размеров — от XXS до L — помогают найти точную посадку.</p>
        <div className={styles.tipScale} aria-label="Размеры амбушюр"><span>XXS</span><span>XS</span><span>S</span><span>M</span><span>L</span></div>
      </div>
      <figure className={styles.designImage} data-reveal><Image src="/media/airpods-pro-3/design.webp" alt="AirPods Pro 3 крупным планом с зарядным футляром" fill sizes="(max-width: 850px) 100vw, 760px" /></figure>
    </section>

    <section className={styles.silence}>
      <div className={styles.silenceCopy} data-reveal>
        <Volume2 size={30} />
        <p>Активное шумоподавление</p>
        <h2>Город продолжает.<br />Вы — выбираете.</h2>
        <span>Микрофоны с низким уровнем шума, вычислительное аудио и новые амбушюры убирают до двух раз больше шума, чем AirPods Pro 2.</span>
      </div>
      <figure className={styles.lifestyleImage}><Image src="/media/airpods-pro-3/silence-natural.webp" alt="Молодой человек слушает AirPods Pro 3 на вечерней улице" fill sizes="(max-width: 850px) 100vw, 58vw" /></figure>
    </section>

    <section className={styles.sound}>
      <div className={styles.soundTitle} data-reveal><p>Персонализированный звук</p><h2>Сцена движется<br />вместе с вами.</h2></div>
      <div className={styles.orbit} aria-hidden="true"><span /><span /><span /><i>H2</i></div>
      <p className={styles.soundCopy} data-reveal>Адаптивный эквалайзер настраивает музыку под посадку наушников. Персонализированное пространственное аудио с динамическим отслеживанием головы размещает звук вокруг вас.</p>
    </section>

    <section className={styles.fitness}>
      <div className={styles.fitnessCopy} data-reveal>
        <Activity size={30} />
        <p>Датчик пульса</p>
        <h2>Слышите темп.<br />Видите прогресс.</h2>
        <span>Инфракрасный датчик считывает пульс во время тренировки. В приложении Fitness доступны более 50 типов активности, калории и кольцо подвижности.</span>
      </div>
      <figure className={styles.lifestyleImage}><Image src="/media/airpods-pro-3/fitness-natural.webp" alt="Бегунья тренируется в AirPods Pro 3 у набережной" fill sizes="(max-width: 850px) 100vw, 58vw" /></figure>
    </section>

    <section className={styles.smartGrid}>
      <article data-reveal><Languages size={30} /><h3>Разговор без паузы</h3><p>Live Translation помогает понимать собеседника через AirPods. Доступность языков зависит от страны и устройства.</p></article>
      <article data-reveal><ShieldCheck size={30} /><h3>Слушайте безопаснее</h3><p>Защита слуха снижает воздействие громкого окружающего шума, а проверка слуха помогает лучше понимать собственный профиль.</p></article>
    </section>

    <section className={styles.charging}>
      <Image src="/media/airpods-pro-3/charging.webp" alt="AirPods Pro 3 в зарядном футляре рядом с USB-C и магнитной зарядкой" fill sizes="100vw" />
      <div className={styles.chargingCopy} data-reveal>
        <BatteryCharging size={30} />
        <p>До 24 часов вместе с футляром</p>
        <h2>Пять минут.<br />Ещё один час.</h2>
        <span>Футляр заряжается через USB‑C, MagSafe, Qi или зарядное устройство Apple Watch. Встроенный динамик помогает найти его через Локатор.</span>
      </div>
    </section>

    <section className={styles.closing}>
      <p>AirPods Pro 3</p>
      <h2>Тишина.<br />По вашему выбору.</h2>
      <Link className={styles.buy} href={buyHref}>Выбрать AirPods Pro 3 <ArrowUpRight size={18} /></Link>
    </section>

    <footer className={styles.footnote}>
      <p>Изображения созданы с помощью ИИ для визуальной презентации устройства и сценариев использования. Внешний вид, интерфейсы и посадка могут незначительно отличаться.</p>
      <p>Характеристики сверены по данным Apple для AirPods Pro 3. Некоторые функции здоровья, защиты слуха, Live Translation и Apple Intelligence доступны не во всех странах и требуют совместимого устройства и актуальной версии системы.</p>
    </footer>
  </div>;
}
