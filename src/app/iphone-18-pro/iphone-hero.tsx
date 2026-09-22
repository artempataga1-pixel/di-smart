"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { productMedia } from "./iphone-media";
import { cameraDetails } from "./iphone-content";
import styles from "./iphone-hero.module.css";
import { HeroFilm } from "./hero-film";
import { PhoneViewer } from "./phone-viewer";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { scrollToId } from "@/lib/scroll";
import type { CatalogCardData, ProductDetail } from "@/lib/catalog";

function BuyAnchor({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <a
      className={className}
      href="#buy"
      onClick={(event) => {
        event.preventDefault();
        scrollToId("buy");
      }}
    >
      {children}
    </a>
  );
}

/** Generated editorial imagery; all variants are local, responsive and lazy-loaded. */
function ProductMedia({ id, shape = "wide" }: { id: string; shape?: "wide" | "portrait" | "cinema" }) {
  const asset = productMedia[id];
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`${styles.mediaFrame} ${styles[shape]}`} data-media-id={id}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset.src}
        alt={asset.alt}
        className={`${styles.editorialImage} ${loaded ? styles.imageLoaded : ""}`}
        style={{ objectFit: asset.fit, objectPosition: asset.position }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
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

export function IPhoneHero({ product, related }: { product: ProductDetail; related: CatalogCardData[] }) {
  const pageRef = useRef<HTMLDivElement>(null);

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
          const siblings = frame.parentElement ? Array.from(frame.parentElement.children) : [];
          const index = siblings.indexOf(frame);
          const delay = innerWidth > 760 ? Math.max(0, index) * 90 : 0;
          frame.style.willChange = "transform, opacity";
          const animation = frame.animate([
            { opacity: 0, transform: `translate3d(0, ${innerWidth > 760 ? 72 : 32}px, 0) scale(.97)` },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          ], { duration: 1200, delay, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" });
          animations.add(animation);
          animation.onfinish = () => { animations.delete(animation); frame.style.willChange = "auto"; };
        });
      }, { threshold: .08, rootMargin: "0px 0px -32px 0px" });
      // Photos are excluded here on purpose: they already fade in on their own
      // once loaded (see ProductMedia's onLoad handler). Sliding/scaling the
      // same rounded, overflow-hidden frame here as well would (a) double up
      // with that fade into a mushy, slower-looking reveal, and (b) briefly
      // show unrounded corners while the box is mid-scale — a real, visible
      // rendering glitch on some GPUs, not just a stacking preference.
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(frame => observer?.observe(frame));
    };
    start();
    motion.addEventListener("change", start);
    return () => { stop(); motion.removeEventListener("change", start); };
  }, []);

  const [finish, setFinish] = useState(0);

  return (
    <div className={styles.page} ref={pageRef}>
      <a href="#buy" className={styles.skipLink} onClick={(event) => { event.preventDefault(); scrollToId("buy"); }}>Перейти к выбору конфигурации</a>
      <div>
        <HeroFilm />

        <section id="buy" className="scroll-mt-20 bg-white px-4 pb-10 pt-14 md:px-6 md:pb-14 md:pt-20" data-reveal>
          <div className="mx-auto max-w-6xl">
            <ProductPurchasePanel product={product} />
          </div>
        </section>

        <section className="bg-white px-4 pb-16 md:px-6" data-reveal>
          <div className="mx-auto max-w-6xl">
            <ProductSpecsTable specs={product.specs} description={product.description} />
          </div>
        </section>

        <section id="design" className={`${styles.section} ${styles.design}`} aria-labelledby="design-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>Дизайн</p><h2 id="design-title">Точный с любого угла.</h2></div>
          <PhoneViewer selected={finish} onSelect={setFinish} />
          <div className={styles.twoColumns}>
            <article data-reveal><h3>Материалы говорят сами.</h3><p>Матовый металл, стекло и чёткий контур блока камер.</p></article>
            <article data-reveal><h3>Pro или Pro Max.</h3><p>Одинаковые возможности в разном размере корпуса.</p></article>
          </div>
        </section>

        <section id="cameras" className={`${styles.section} ${styles.cameras}`} aria-labelledby="camera-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>Система камер Pro</p><h2 id="camera-title">Сначала вы видите кадр,<br />потом нажимаете спуск.</h2></div>
          <ProductMedia id="camera-system" shape="cinema" />
          <dl className={styles.specStrip}>
            <div><dt>48 Мп</dt><dd>каждая из трёх задних камер</dd></div>
            <div><dt>8×</dt><dd>зум оптического качества</dd></div>
            <div><dt>ƒ/1,48–4,0</dt><dd>переменная диафрагма основной камеры</dd></div>
          </dl>
          <p className={styles.lead} data-reveal><strong>Три объектива оставляют вам выбор:</strong> работать со светом, расстоянием или самой маленькой деталью.</p>
          <CameraStory />
          <div className={styles.editorial} data-reveal><h3>Кадр и контроль над ним —<br />всегда в ваших руках.</h3><p>Фокус, экспозиция и зум доступны сразу, без лишних касаний по меню — больше внимания достаётся самой сцене.</p></div>
          <ProductMedia id="camera-controls" />
        </section>

        <section id="performance" className={`${styles.section} ${styles.performance}`} aria-labelledby="performance-title">
          <div className={styles.sectionHeading} data-reveal><p className={styles.kicker}>A20 Pro</p><h2 id="performance-title">Запас скорости<br />на несколько шагов вперёд.</h2></div>
          <ProductMedia id="chip-and-cooling" />
          <p className={styles.lead} data-reveal>Монтаж, графика и игры идут без единой запинки, будто между идеей и результатом вообще нет паузы.</p>
          <div className={styles.twoColumns}><article data-reveal><h3>Для работы.</h3><p>Сложные проекты открываются без лишнего ожидания.</p></article><article data-reveal><h3>Для игры.</h3><p>Высокая частота кадров и стабильная производительность.</p></article></div>
        </section>

        <section className={styles.closer}>
          <p>iPhone 18 Pro</p>
          <h2>Ваш следующий iPhone<br />уже рядом.</h2>
          <BuyAnchor className={styles.buy}>Выбрать конфигурацию <ArrowRight size={18} /></BuyAnchor>
        </section>

        <section className="bg-white px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-6xl">
            <RelatedProducts products={related} />
          </div>
        </section>
      </div>
      <aside className={styles.footer} aria-label="Примечания к характеристикам">
        <div className={styles.footnotes}>
          <p>Изображения на странице сгенерированы нейросетью — чтобы показать устройство и типичные сценарии использования. Интерфейс, оттенки корпуса и детали ремешка у серийных устройств могут немного отличаться.</p>
          <p>3D-геометрия — материалы Apple. Остальные иллюстрации созданы с ИИ или предоставлены заказчиком и не являются образцами съёмки на устройство. Технические данные: <a href="https://www.apple.com/iphone-18-pro/" target="_blank" rel="noreferrer">Apple</a>. Цену, комплектацию и наличие уточняйте в Di-SMART.</p>
        </div>
      </aside>
    </div>
  );
}
