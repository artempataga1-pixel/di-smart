import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AccessoryRef } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function AccessoriesGrid({ accessories }: { accessories: AccessoryRef[] }) {
  return (
    <div className={styles.accessoryGrid}>
      {accessories.map((a) => (
        <Link key={a.slug} href={`/product/${a.slug}`} className={styles.accessoryCard}>
          <p className={styles.accessoryName}>{a.name}</p>
          <p className={styles.accessoryShort}>{a.short}</p>
          <span className={styles.accessoryLink}>
            Смотреть товар <ArrowRight size={14} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
