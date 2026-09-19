import Link from "next/link";
import { flagshipCampaigns } from "@/constants/content/flagships";
import { FlagshipStories } from "@/components/storefront/FlagshipStories";
import { getHeroMedia, getStorefront } from "@/lib/storefront";
import { HeroVideo } from "@/components/storefront/HeroVideo";
import { PromoTile } from "@/components/storefront/PromoTile";
import { HomeCategoryAnchor } from "@/components/home/HomeCategoryAnchor";
import styles from "@/components/storefront/storefront.module.css";

export default async function HomePage() {
  const [categories, media] = await Promise.all([getStorefront(), getHeroMedia()]);
  const products = categories.flatMap(category => category.products);
  const flagships = flagshipCampaigns.map(campaign => {
    const product = products.find(item => item.slug === campaign.slug);
    return product ?? { id: campaign.slug, slug: campaign.slug, name: campaign.name, subtitle: campaign.subtitle };
  });
  return <>
    <HeroVideo {...media} />
    {flagships.length > 0 && <section id="highlights" className={styles.section} aria-labelledby="flagships">
      <div className={styles.heading}><h2 id="flagships">Флагманы.</h2><p>Познакомьтесь поближе.</p></div>
      <FlagshipStories products={flagships} />
    </section>}
    <section id={flagships.length ? "categories" : "highlights"} className={styles.section} aria-labelledby="devices">
      <HomeCategoryAnchor />
      <div className={styles.heading}><h2 id="devices">Категории.</h2><p>Для работы. Для творчества. Для себя.</p></div>
      <div className={styles.grid}>{categories.map(category => <PromoTile key={category.slug} category title={category.name} subtitle="Найдите то, что подходит вам." image={category.image ?? category.products.find(product => product.image)?.image ?? null} href={`/catalog/${category.slug}`} />)}</div>
    </section>
    <section className={styles.catalogCta}><h2>Весь каталог.</h2><p>Все устройства, конфигурации и актуальные цены в одном месте.</p><Link className={styles.primary} href="/catalog">Смотреть все устройства</Link></section>
  </>;
}
