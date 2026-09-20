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
      <h2 data-reveal>Шум — снаружи.<br />Музыка — с вами.</h2>
      <p className={styles.introLead} data-reveal>Акустику пересобрали заново: тишина стала глубже, сцена — шире, а голос собеседника звучит будто рядом. И ещё одна новинка — AirPods Pro 3 впервые считают пульс прямо во время тренировки.</p>
    </section>

    <section className={styles.metrics} aria-label="Ключевые характеристики">
      <div data-reveal><strong>до 2×</strong><span>тише благодаря новому шумоподавлению</span></div>
      <div data-reveal><strong>8 часов</strong><span>музыки при включённом ANC</span></div>
      <div data-reveal><strong>IP57</strong><span>не боятся пыли, пота и воды</span></div>
    </section>

    <section className={styles.design}>
      <div className={styles.designCopy} data-reveal>
        <p>Обновлённая посадка</p>
        <h2>Корпус компактнее.<br />Держится увереннее.</h2>
        <p>Сам корпус уменьшился. Амбушюры с пенным наполнением плотнее прилегают и глушат шум ещё до того, как включится ANC. Размеров теперь пять — от XXS до L, — так что подобрать точную посадку стало проще.</p>
        <div className={styles.tipScale} aria-label="Размеры амбушюр"><span>XXS</span><span>XS</span><span>S</span><span>M</span><span>L</span></div>
      </div>
      <figure className={styles.designImage} data-reveal><Image src="/media/airpods-pro-3/design.webp" alt="AirPods Pro 3 и зарядный футляр крупным планом" fill sizes="(max-width: 850px) 100vw, 760px" /></figure>
    </section>

    <section className={styles.silence}>
      <div className={styles.silenceCopy} data-reveal>
        <Volume2 size={30} />
        <p>Активное шумоподавление</p>
        <h2>Город не выключить.<br />Тишину — можно.</h2>
        <span>Малошумные микрофоны, вычислительное аудио и новые амбушюры вместе убирают вдвое больше шума, чем в AirPods Pro 2.</span>
      </div>
      <figure className={styles.lifestyleImage}><Image src="/media/airpods-pro-3/silence-natural.webp" alt="Мужчина слушает музыку в AirPods Pro 3 вечером на улице" fill sizes="(max-width: 850px) 100vw, 58vw" /></figure>
    </section>

    <section className={styles.sound}>
      <div className={styles.soundTitle} data-reveal><p>Персонализированный звук</p><h2>Куда голова —<br />туда и сцена.</h2></div>
      <div className={styles.orbit} aria-hidden="true"><span /><span /><span /><i>H2</i></div>
      <p className={styles.soundCopy} data-reveal>Адаптивный эквалайзер подстраивает звук под то, как наушники сидят именно у вас в ушах. Персональное пространственное аудио с отслеживанием положения головы держит сцену на месте — даже если вы повернулись к собеседнику.</p>
    </section>

    <section className={styles.fitness}>
      <div className={styles.fitnessCopy} data-reveal>
        <Activity size={30} />
        <p>Датчик пульса</p>
        <h2>Пульс — прямо в ухе.<br />Прогресс — в приложении.</h2>
        <span>Инфракрасный датчик снимает пульс прямо во время тренировки, без дополнительных ремней и часов. Fitness собирает всё в одном месте: больше 50 видов активности, калории, кольцо подвижности.</span>
      </div>
      <figure className={styles.lifestyleImage}><Image src="/media/airpods-pro-3/fitness-natural.webp" alt="Бегунья тренируется в AirPods Pro 3 у набережной" fill sizes="(max-width: 850px) 100vw, 58vw" /></figure>
    </section>

    <section className={styles.smartGrid}>
      <article data-reveal><Languages size={30} /><h3>Перевод, а не пауза</h3><p>Live Translation переводит речь собеседника прямо в наушниках, так что разговор не превращается в переписку с телефоном в руках. Набор языков и стран пока ограничен и зависит от устройства.</p></article>
      <article data-reveal><ShieldCheck size={30} /><h3>Слух под присмотром</h3><p>Защита слуха автоматически приглушает слишком громкий шум вокруг, а встроенная проверка слуха показывает, как вы слышите на самом деле.</p></article>
    </section>

    <section className={styles.charging}>
      <Image src="/media/airpods-pro-3/charging.webp" alt="Футляр AirPods Pro 3 заряжается от USB-C и беспроводной зарядки" fill sizes="100vw" />
      <div className={styles.chargingCopy} data-reveal>
        <BatteryCharging size={30} />
        <p>До 24 часов вместе с футляром</p>
        <h2>5 минут заряда.<br />Ещё час музыки.</h2>
        <span>Заряжать футляр можно от USB‑C, MagSafe, любой Qi-зарядки или даже зарядного диска Apple Watch — тем, что и так под рукой. А если он потеряется, встроенный динамик отзовётся через Локатор.</span>
      </div>
    </section>

    <section className={styles.closing}>
      <p>AirPods Pro 3</p>
      <h2>Тишина.<br />Ровно та, что нужна.</h2>
      <Link className={styles.buy} href={buyHref}>Выбрать AirPods Pro 3 <ArrowUpRight size={18} /></Link>
    </section>

    <footer className={styles.footnote}>
      <p>Изображения на странице сгенерированы нейросетью — чтобы наглядно показать устройство и сценарии использования. Реальный вид, интерфейс и посадка в ухе могут немного отличаться.</p>
      <p>Все характеристики выверены по официальным данным Apple для AirPods Pro 3. Часть функций — здоровье, защита слуха, Live Translation и Apple Intelligence — пока доступна не везде и требует совместимого устройства с актуальной версией системы.</p>
    </footer>
  </div>;
}
