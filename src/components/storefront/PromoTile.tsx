import Image from "next/image";
import Link from "next/link";
import styles from "./storefront.module.css";

export function PromoTile({ title, subtitle, image, href, category = false, hero = false }: {
  title: string; subtitle?: string | null; image: string | null; href: string; category?: boolean; hero?: boolean;
}) {
  const Heading = hero ? "h1" : "h3";
  return <article className={`${styles.tile} ${hero ? styles.categoryHero : ""}`}>
    <div className={styles.tileCopy}>
      <Heading>{title}</Heading>
      <p>{subtitle || "Выберите своё устройство."}</p>
      <div className={styles.actions}>
        <Link href={href} className={styles.primary}>{category ? "Смотреть модели" : "Подробнее"}</Link>
        {hero && !category && <a href="#models" className={styles.secondary}>Все модели</a>}
      </div>
    </div>
    <Link href={href} className={styles.productImage} aria-label={`${category ? "Все модели" : "Подробнее"}: ${title}`} tabIndex={-1}>
      {image ? <Image src={image} alt={title} fill sizes={hero ? "(min-width: 1024px) 900px, 100vw" : "(min-width: 768px) 50vw, 100vw"} className={styles.render} loading={hero ? "eager" : "lazy"} /> : <div className={styles.assetSlot}><span>Фотография скоро появится</span></div>}
    </Link>
  </article>;
}
