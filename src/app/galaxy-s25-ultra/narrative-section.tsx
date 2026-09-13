import { MediaFrame } from "@/components/ui/MediaFrame";
import type { NarrativeSectionData } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function NarrativeSection({
  data,
  sectionRef,
}: {
  data: NarrativeSectionData;
  sectionRef: (el: HTMLElement | null) => void;
}) {
  return (
    <section
      id={data.id}
      ref={sectionRef}
      className={`${styles.section} ${styles.narrativeSection} ${data.mediaPosition === "left" ? styles.narrativeMediaLeft : ""}`}
    >
      <div className={styles.narrativeCopy}>
        <p className={styles.eyebrow}>{data.eyebrow}</p>
        <h2 className={styles.sectionTitle}>{data.title}</h2>
        <p className={styles.sectionBody}>{data.body}</p>
        {data.bullets && (
          <ul className={styles.narrativeBullets}>
            {data.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </div>
      <MediaFrame asset={data.media} className={styles.narrativeMedia} />
    </section>
  );
}
