import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { flagshipCampaigns } from "@/constants/content/flagships";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import styles from "./flagship-page.module.css";

export function flagshipMetadata(slug: string): Metadata {
  const campaign = flagshipCampaigns.find(item => item.slug === slug);
  if (!campaign) return {};
  return { title: `${campaign.name} — Di-SMART`, description: campaign.description, alternates: { canonical: campaign.href } };
}

export function FlagshipPage({ slug }: { slug: string }) {
  const campaign = flagshipCampaigns.find(item => item.slug === slug);
  if (!campaign?.category) notFound();
  return <div className={styles.page}>
    <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: campaign.categoryName ?? "Каталог", href: `/catalog/${campaign.category}` }, { label: campaign.name }]} />
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.family}>{campaign.categoryName}</p>
        <h1>{campaign.name}</h1>
        <p className={styles.tagline}>{campaign.subtitle}</p>
        <Link className={styles.button} href={`/catalog/${campaign.category}`}>Смотреть категорию</Link>
      </div>
      <figure className={styles.figure}>
        <Image src={campaign.image} alt={`Иллюстрация категории ${campaign.categoryName}`} width={campaign.width} height={campaign.height} sizes="(min-width: 1100px) 1000px, 94vw" loading="eager" />
        <figcaption>Иллюстрация категории. Изображения конкретной модели добавим отдельно.</figcaption>
      </figure>
    </section>
    <section className={styles.overview} aria-labelledby="overview">
      <h2 id="overview">Знакомство с {campaign.name}</h2>
      <p className={styles.description}>{campaign.description}</p>
      <div className={styles.features}>{campaign.features?.map(feature => <div key={feature.title}><h3>{feature.title}</h3><p>{feature.text}</p></div>)}</div>
      <p className={styles.note}>Подробный обзор и доступные конфигурации появятся здесь позже.</p>
      {campaign.source && <a className={styles.source} href={campaign.source} target="_blank" rel="noreferrer">Подробнее о модели на сайте производителя</a>}
    </section>
    <nav className={styles.other} aria-label="Другие флагманы">
      <h2>Другие флагманы</h2>
      <div>{flagshipCampaigns.filter(item => item.slug !== slug).map(item => <Link key={item.slug} href={item.href}>{item.name}</Link>)}</div>
    </nav>
  </div>;
}
