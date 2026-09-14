import type { FaqItem } from "./galaxy-content";
import styles from "./galaxy-hero.module.css";

export function FaqAccordion({ questions }: { questions: FaqItem[] }) {
  return (
    <div className={styles.faq}>
      {questions.map((q) => (
        <details key={q.q} className={styles.faqItem}>
          <summary className={styles.faqQuestion}>{q.q}</summary>
          <p className={styles.faqAnswer}>{q.a}</p>
        </details>
      ))}
    </div>
  );
}
