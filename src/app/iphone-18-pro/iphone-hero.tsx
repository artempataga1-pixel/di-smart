"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/components/ui/StoreImage";
import { ArrowRight } from "lucide-react";
import { productMedia } from "./iphone-media";
import styles from "./iphone-hero.module.css";
import { HeroFilm } from "./hero-film";
import { PhoneViewer } from "./phone-viewer";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { CrossSellProducts } from "@/components/product/CrossSellProducts";
import { BuyAnchor } from "@/components/storefront/BuyAnchor";
import { scrollToId } from "@/lib/scroll";
import type { CrossSellGroup, ProductDetail } from "@/lib/catalog";

/** Generated editorial imagery; all variants are local, responsive and lazy-loaded. */
function ProductMedia({ id, shape = "wide" }: { id: string; shape?: "wide" | "portrait" | "cinema" }) {
  const asset = productMedia[id];
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`${styles.mediaFrame} ${styles[shape]}`} data-media-id={id}>
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        sizes={shape === "portrait" ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 100vw, 1200px"}
        className={`${styles.editorialImage} ${loaded ? styles.imageLoaded : ""}`}
        style={{ objectFit: asset.fit, objectPosition: asset.position }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export function IPhoneHero({ pro, proMax, crossSell, initialModel = "pro" }: { pro: ProductDetail; proMax: ProductDetail; crossSell: CrossSellGroup[]; initialModel?: "pro" | "pro-max" }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<"pro" | "pro-max">(initialModel);
  const product = selectedModel === "pro" ? pro : proMax;

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
          const delay = innerWidth > 760 ? Math.max(0, index) * 60 : 0;
          frame.style.willChange = "transform, opacity";
          // Короткая и неглубокая анимация: при быстрой прокрутке блок не
          // успевает «висеть» бледным, а запуск чуть до входа в экран
          // скрывает её начало от пользователя.
          const animation = frame.animate([
            { opacity: 0, transform: `translate3d(0, ${innerWidth > 760 ? 36 : 16}px, 0) scale(.985)` },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          ], { duration: 600, delay, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" });
          animations.add(animation);
          animation.onfinish = () => { animations.delete(animation); frame.style.willChange = "auto"; };
        });
      }, { threshold: 0, rootMargin: "0px 0px 12% 0px" });
      // Photos are excluded here on purpose: they already fade in on their own
      // once loaded (see ProductMedia's onLoad handler). Sliding/scaling the
      // same rounded, overflow-hidden frame here as well would (a) double up
      // with that fade into a mushy, slower-looking reveal, and (b) briefly
      // show unrounded corners while the box is mid-scale — a real, visible
      // rendering glitch on some GPUs, not just a stacking preference.
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(frame => {
        if (frame.parentElement?.closest("[data-reveal]")) return;
        observer?.observe(frame);
      });
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

        <section id="buy" className="scroll-mt-20 bg-white px-4 pb-10 pt-14 md:px-6 md:pb-14 md:pt-20">
          <div className="mx-auto max-w-6xl">
            <ProductPurchasePanel
              key={product.id}
              product={product}
              modelSelector={
                <fieldset className={styles.modelSelector}>
                  <legend>Модель</legend>
                  <div className={styles.modelOptions}>
                    {([
                      { id: "pro", item: pro, screen: '6,3″' },
                      { id: "pro-max", item: proMax, screen: '6,9″' },
                    ] as const).map(({ id, item, screen }) => (
                      <div className={styles.modelChoice} key={id}>
                        <input
                          className={styles.modelInput}
                          type="radio"
                          name="iphone-18-model"
                          id={`iphone-18-model-${id}`}
                          checked={selectedModel === id}
                          onChange={() => setSelectedModel(id)}
                        />
                        <label className={styles.modelOption} htmlFor={`iphone-18-model-${id}`}>
                          <span>{item.name}</span>
                          <small>Экран {screen}</small>
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              }
            />
          </div>
        </section>

        <section id="product-details" className="scroll-mt-20 bg-white px-4 pb-16 md:px-6">
          <div className="mx-auto max-w-6xl">
            <ProductSpecsTable specs={product.specs} description={product.description} />
          </div>
        </section>

        <section className="bg-white px-4 pb-16 md:px-6">
          <div className="mx-auto max-w-6xl">
            <CrossSellProducts groups={crossSell} />
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
          <div className={styles.editorial} data-reveal><h3>Кадр и контроль над ним — всегда в ваших руках.</h3><p>Фокус, экспозиция и зум доступны сразу, без лишних касаний по меню — больше внимания достаётся самой сцене.</p></div>
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

      </div>
      <aside className={styles.footer} aria-label="Примечания к характеристикам">
        <div className={styles.footnotes}>
          <p>Фото моделей и цветов в карточке товара — официальные материалы Apple. Иллюстрации сценариев использования созданы с ИИ.</p>
          <p>3D-геометрия — материалы Apple. Фото в карточках предоставлены Apple. Остальные иллюстрации созданы с ИИ или предоставлены заказчиком и не являются образцами съёмки на устройство. Технические данные: <a href="https://www.apple.com/iphone-18-pro/" target="_blank" rel="noreferrer">Apple</a>. Цену, комплектацию и наличие уточняйте в Di-SMART.</p>
        </div>
      </aside>
    </div>
  );
}
