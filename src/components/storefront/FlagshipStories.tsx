import Image from "@/components/ui/StoreImage";
import Link from "next/link";
import { FlagshipScroll } from "./FlagshipScroll";
import styles from "./flagship-stories.module.css";

import { flagshipCampaigns } from "@/constants/content/flagships";

export function FlagshipStories({ products }: { products: { id: string; slug: string; name: string; subtitle: string | null; image?: string | null }[] }) {
  return <div className={styles.stories}><FlagshipScroll>
    {products.map(product => {
      const campaign = flagshipCampaigns.find(item => item.slug === product.slug);
      if (!campaign) return null;
      const mobileImage = campaign.mobileImage ?? product.image;
      return <div key={product.id} className={styles.frame} style={{ width: `min(100%, 1040px, calc(${(campaign.width / campaign.height * 100).toFixed(2)}svh - ${Math.round(360 * campaign.width / campaign.height)}px))` }}>
        <article className={styles.panel} aria-labelledby={`preview-${product.slug}`}>
          <div className={`${styles.visual} ${mobileImage ? styles.hasMobileImage : ""}`}>
            <picture className={styles.picture}>
              {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage} />}
              <Image src={campaign.image} alt={`Превью ${product.name}`} width={campaign.width} height={campaign.height} sizes="(min-width: 1200px) 1000px, 94vw" className={styles.image} />
            </picture>
          </div>
          <div className={styles.copy}>
            <h3 id={`preview-${product.slug}`}>{product.name}</h3>
            <p>{product.subtitle}</p>
            <Link href={campaign.href}>Подробнее</Link>
          </div>
        </article>
      </div>;
    })}
  </FlagshipScroll></div>;
}
