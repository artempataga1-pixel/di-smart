import Link from "next/link";
import type { LineupTier } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function LineupPicker({ tiers }: { tiers: LineupTier[] }) {
  return (
    <div className={styles.lineup}>
      {tiers.map((t) => (
        <div key={t.slug} className={`${styles.lineupCard} ${t.current ? styles.lineupCardCurrent : ""}`}>
          <p className={styles.lineupName}>{t.name}</p>
          <p className={styles.lineupShort}>{t.short}</p>
          {t.current ? (
            <span className={styles.lineupCurrentBadge}>Вы здесь</span>
          ) : (
            <Link href={`/product/${t.slug}`} className={styles.lineupLink}>
              Смотреть товар
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
