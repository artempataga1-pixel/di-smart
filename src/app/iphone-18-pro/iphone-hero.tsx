"use client";

import Link from "next/link";
import Image from "next/image";
import { productMedia } from "./iphone-media";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { highlights, cameraDetails, questions } from "./iphone-content";
import styles from "./iphone-hero.module.css";
import { HeroFilm } from "./hero-film";
import { PhoneViewer } from "./phone-viewer";
import { AppleExperience } from "./apple-experience";

/** Generated editorial imagery; all variants are local, responsive and lazy-loaded. */
function ProductMedia({ id, shape = "wide" }: { id: string; shape?: "wide" | "portrait" | "cinema" }) {
  const asset = productMedia[id];
  return (
    <div className={`${styles.mediaFrame} ${styles[shape]} ${id === "model-pro" ? styles.compactModel : ""}`} data-media-id={id}>
      <Image
        src={asset.src}
        alt={id.startsWith("highlight-") ? "" : asset.alt}
        fill
        sizes={id.startsWith("highlight-") ? "800px" : shape === "portrait" ? "(max-width: 760px) 90vw, 560px" : "(max-width: 760px) 100vw, (max-width: 1200px) 95vw, 1120px"}
        className={styles.editorialImage}
        style={{ objectFit: asset.fit, objectPosition: asset.position }}
      />
    </div>
  );
}

function CameraStory() {
  const [active, setActive] = useState(0);
  const steps = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
    }, { threshold: [.25, .5, .75], rootMargin: "-18% 0px -25% 0px" });
    steps.current.forEach(step => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return <div className={styles.cameraStory}>
    <div className={styles.cameraSticky}>
      <div className={styles.cameraStage}>
        {cameraDetails.map((item, index) => <div key={item.slot} className={`${styles.cameraSlide} ${active === index ? styles.cameraSlideActive : ""}`} aria-hidden={active !== index}><ProductMedia id={item.slot} /></div>)}
        <div className={styles.cameraGlow} aria-hidden="true" />
        <span className={styles.cameraCounter}>0{active + 1} / 03</span>
      </div>
    </div>
    <div className={styles.cameraSteps}>
      {cameraDetails.map((item, index) => <article key={item.slot} ref={node => { steps.current[index] = node; }} data-step={index} data-active={active === index}>
        <span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p>
      </article>)}
    </div>
  </div>;
}

export function IPhoneHero() {
  const pageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [finish, setFinish] = useState(0);
  const [model, setModel] = useState<"pro" | "max">("pro");
  const [railPosition, setRailPosition] = useState({ start: true, end: false });
  const railFrame = useRef(0);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    const stop = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const start = () => {
      stop();
      if (motion.matches) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const frame = entry.target as HTMLElement;
          observer?.unobserve(frame);
          const gallery = frame.closest(`.${styles.cameraGrid}`);
          const index = gallery ? Array.from(gallery.children).indexOf(frame.parentElement!) : 0;
          const delay = innerWidth > 760 ? Math.max(0, index) * 110 : 0;
          const animation = frame.animate([
            { opacity: .12, transform: `translate3d(0, ${innerWidth > 760 ? 72 : 32}px, 0) scale(.96)` },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          ], { duration: 1100, delay, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }, { threshold: .08, rootMargin: "0px 0px -32px 0px" });
      root.querySelectorAll<HTMLElement>("[data-media-id], [data-reveal]").forEach(frame => {
        const id = frame.dataset.mediaId ?? "";
        if (!id.startsWith("highlight-") && !id.startsWith("model-")) observer?.observe(frame);
      });
    };
    start();
    motion.addEventListener("change", start);
    return () => { stop(); motion.removeEventListener("change", start); };
  }, []);

  function scrollRail(direction: number) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * (rail.firstElementChild?.getBoundingClientRect().width ?? 360) + direction * 24, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <div className={styles.page} ref={pageRef}>
      <a href="#highlights" className={styles.skipLink}>Перейти к обзору</a>
      <div>
        <HeroFilm />

        <section id="highlights" className={`${styles.section} ${styles.highlights}`} aria-labelledby="highlights-title">
          <div className={styles.sectionTop} data-reveal><h2 id="highlights-title">Главное —<br />в четырёх кадрах.</h2><span>iPhone 18 Pro и Pro Max</span></div>
          <div className={styles.highlightRail} ref={railRef} onScroll={event => {
            const el = event.currentTarget;
            if (railFrame.current) return;
            railFrame.current = requestAnimationFrame(() => {
              railFrame.current = 0;
              const next = { start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 };
              setRailPosition(previous => previous.start === next.start && previous.end === next.end ? previous : next);
            });
          }}>
            {highlights.map(item => <a href={`#${item.target}`} className={styles.highlightCard} key={item.target}>
              <p>{item.category}</p><h3>{item.title}</h3><ProductMedia id={item.slot} shape="portrait" /><span className={styles.circleLink}><ArrowRight size={19} aria-hidden="true" /></span>
            </a>)}
          </div>
          <div className={styles.railControls}><button onClick={() => scrollRail(-1)} disabled={railPosition.start} aria-label="Предыдущие преимущества"><ChevronLeft /></button><button onClick={() => scrollRail(1)} disabled={railPosition.end} aria-label="Следующие преимущества"><ChevronRight /></button></div>
        </section>

        <section className={`${styles.section} ${styles.introduction}`} aria-labelledby="intro-title">
          <div data-reveal><p className={styles.kicker}>iPhone 18 Pro</p>
          <h2 id="intro-title">Серьёзный инструмент.<br />На каждый день.</h2>
          <p className={styles.lead}>Камера, производительность и автономность собраны в одном корпусе. <strong>Берёте в руку — и работаете.</strong></p></div>
          <ProductMedia id="introduction" />
        </section>

        <section id="design" className={`${styles.section} ${styles.design}`} aria-labelledby="design-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>Дизайн</p><h2 id="design-title">Точный с любого угла.</h2></div>
          <PhoneViewer selected={finish} onSelect={setFinish} />
          <div className={styles.twoColumns}>
            <article><h3>Материалы говорят сами.</h3><p>Матовый металл, стекло и чёткий контур блока камер.</p></article>
            <article><h3>Pro или Pro Max.</h3><p>Одинаковые возможности. Разный размер в руке.</p></article>
          </div>
        </section>

        <section id="cameras" className={`${styles.section} ${styles.cameras}`} aria-labelledby="camera-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>Система камер Pro</p><h2 id="camera-title">Сначала вы видите.<br />Потом снимаете.</h2></div>
          <ProductMedia id="camera-system" shape="cinema" />
          <dl className={styles.specStrip}>
            <div><dt>48 Мп</dt><dd>каждая из трёх задних камер</dd></div>
            <div><dt>8×</dt><dd>зум оптического качества</dd></div>
            <div><dt>ƒ/1,48–4,0</dt><dd>переменная диафрагма основной камеры</dd></div>
          </dl>
          <p className={styles.lead} data-reveal><strong>Три объектива оставляют вам выбор:</strong> работать со светом, расстоянием или самой маленькой деталью.</p>
          <CameraStory />
          <div className={styles.editorial} data-reveal><h3>Кадр — ваш.<br />Контроль тоже.</h3><p>Фокус, экспозиция и зум доступны сразу. Меньше поисков в меню — больше внимания сцене.</p></div>
          <ProductMedia id="camera-controls" />
        </section>

        <section id="video" className={`${styles.section} ${styles.videoSection}`} aria-labelledby="video-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>Видео</p><h2 id="video-title">Движение без суеты.</h2></div>
          <ProductMedia id="cinematic-film" shape="cinema" />
          <div className={styles.editorial} data-reveal><h3>Сняли.<br />Собрали. Показали.</h3><p>Стабильный кадр, чистый звук и монтаж на том же устройстве.</p></div>
        </section>

        <section id="battery" className={`${styles.section} ${styles.battery}`} aria-labelledby="battery-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>Аккумулятор</p><h2 id="battery-title">Длинный день.<br />Без оглядки на заряд.</h2></div>
          <ProductMedia id="battery-lifestyle" />
          <div className={styles.batteryStat}><span>До</span><strong>45 часов</strong><p>воспроизведения видео на iPhone 18 Pro Max¹</p></div>
          <div className={styles.charging}><p className={styles.kicker}>MagSafe</p><h3>Положили.<br />Заряд пошёл.</h3><ProductMedia id="charging" /></div>
        </section>

        <section id="performance" className={`${styles.section} ${styles.performance}`} aria-labelledby="performance-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>A20 Pro</p><h2 id="performance-title">Запас скорости.<br />На несколько шагов вперёд.</h2></div>
          <ProductMedia id="chip-and-cooling" />
          <p className={styles.lead} data-reveal>Монтаж, графика и игры идут плавно. <strong>Без паузы между идеей и действием.</strong></p>
          <div className={styles.twoColumns}><article><h3>Для работы.</h3><p>Сложные проекты открываются без лишнего ожидания.</p></article><article><h3>Для игры.</h3><p>Высокая частота кадров и стабильная производительность.</p></article></div>
          <ProductMedia id="performance-gaming" shape="cinema" />
        </section>

        <section id="experience" className={`${styles.section} ${styles.experience}`} aria-labelledby="experience-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>iOS</p><h2 id="experience-title">Всё знакомо.<br />Всё под рукой.</h2></div>
          <ProductMedia id="ios-experience" />
          <div className={styles.editorial} data-reveal><h3>Mac, AirPods, Watch.<br />Продолжайте с того же места.</h3><p>Файлы, звонки и звук переходят между устройствами без лишних действий.</p></div>
          <ProductMedia id="ecosystem" shape="cinema" />
        </section>

        <AppleExperience />
        <section id="accessories" className={`${styles.section} ${styles.accessories}`} aria-labelledby="accessories-title">
          <div className={styles.sectionTop}><h2 id="accessories-title">Последний штрих.<br />И он ваш.</h2><Link href="/catalog">Перейти в каталог <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className={styles.twoColumns}><article><ProductMedia id="accessories-case" /><h3>Чехол под ваш стиль.</h3><p>Цвет, материал, ощущение в руке. Найдите сочетание, которое нравится именно вам.</p></article><article><ProductMedia id="accessories-charge" /><h3>Всё для вашего дня.</h3><p>Зарядка дома, кабель в поездку, наушники для дороги. Подберём совместимые аксессуары.</p></article></div>
        </section>

        <section id="closer" className={`${styles.section} ${styles.choose}`} aria-labelledby="choose-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>Выбор</p><h2 id="choose-title">Pro или Pro Max.</h2></div>
          <fieldset className={styles.modelPicker}><legend className={styles.srOnly}>Выберите модель</legend><label><input type="radio" name="model" checked={model === "pro"} onChange={() => setModel("pro")} /><span>iPhone 18 Pro</span></label><label><input type="radio" name="model" checked={model === "max"} onChange={() => setModel("max")} /><span>iPhone 18 Pro Max</span></label></fieldset>
          <div className={styles.modelPanel} data-model={model}><ProductMedia id={`model-${model}`} shape="portrait" /><div aria-live="polite"><h3>iPhone 18 Pro{model === "max" ? " Max" : ""}</h3><p className={styles.screenSize}>{model === "pro" ? "6,3 дюйма" : "6,9 дюйма"} · Super Retina XDR²</p><p>{model === "pro" ? "Компактнее в руке." : "Больше пространства для видео и работы."}</p><Link href="/product/iphone-18-pro" className={styles.primaryCta}>Выбрать конфигурацию <ArrowRight size={17} aria-hidden="true" /></Link></div></div>
        </section>

        <section className={`${styles.section} ${styles.service}`} aria-labelledby="service-title">
          <h2 id="service-title">Ваш следующий iPhone.<br />В Di-SMART.</h2>
          <div className={styles.threeColumns}><article><h3>Поможем выбрать.</h3><p>Обсудим, что для вас важно, и подберём модель, память и аксессуары.</p><Link href="/contacts">Связаться с нами <ArrowRight size={15} aria-hidden="true" /></Link></article><article><h3>Время обновиться.</h3><p>Узнайте, как обменять нынешний телефон по программе Trade-in.</p><Link href="/trade-in">Подробнее о Trade-in <ArrowRight size={15} aria-hidden="true" /></Link></article><article><h3>Всё о получении.</h3><p>Посмотрите условия доставки и гарантии перед оформлением заказа.</p><Link href="/delivery">Доставка и гарантия <ArrowRight size={15} aria-hidden="true" /></Link></article></div>
        </section>

        <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title"><h2 id="faq-title">Пара вопросов<br />перед знакомством.</h2><div>{questions.map(item => <details key={item.question}><summary>{item.question}<Plus size={20} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div></section>
      </div>
      <aside className={styles.footer} aria-label="Примечания к характеристикам">
        <div className={styles.footnotes}><p>¹ Максимальное время воспроизведения видео по данным Apple. Фактическое время работы зависит от настроек, сети и использования.</p><p>² Диагональ измерена по прямоугольнику. Видимая область экрана меньше.</p><p>3D-геометрия и исходное изображение Siri — материалы Apple; интерфейс Siri локализован для страницы. Остальные иллюстрации созданы с ИИ или предоставлены заказчиком и не являются образцами съёмки на устройство. Технические данные: <a href="https://www.apple.com/iphone-18-pro/" target="_blank" rel="noreferrer">Apple</a>. Цену, комплектацию и наличие уточняйте в Di-SMART.</p></div>
      </aside>
    </div>
  );
}
