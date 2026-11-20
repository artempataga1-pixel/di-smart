import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.shell} aria-label="Открываем страницу" role="status">
      <div className={styles.hero} />
      <div className={styles.copy}>
        <span />
        <span />
      </div>
    </div>
  );
}
