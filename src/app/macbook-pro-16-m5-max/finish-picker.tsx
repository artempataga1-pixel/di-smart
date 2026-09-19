"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

const finishes = [
  { name: "Space Black", swatch: "#3b3c40", image: "/media/macbook-pro-m5-max/color-space-black.webp" },
  { name: "Silver", swatch: "#d9dadb", image: "/media/macbook-pro-m5-max/color-silver.webp" },
] as const;

export function FinishPicker() {
  const [selected, setSelected] = useState(0);

  return <div className={styles.finishPicker} data-reveal>
    <div className={styles.finishStage} aria-live="polite">
      {finishes.map((finish, index) => <Image
        key={finish.name}
        src={finish.image}
        alt={`MacBook Pro 16 дюймов в цвете ${finish.name}`}
        fill
        sizes="(max-width: 860px) 100vw, 1060px"
        className={selected === index ? styles.finishImageActive : styles.finishImage}
        priority={index === 0}
        loading={index === 0 ? undefined : "eager"}
      />)}
      <span className={styles.finishBadge}>{finishes[selected].name}</span>
    </div>
    <div className={styles.finishPanel}>
      <div><strong>{finishes[selected].name}</strong><span>Анодированный алюминий</span></div>
      <div className={styles.swatches} role="radiogroup" aria-label="Цвет корпуса">
        {finishes.map((finish, index) => <button
          key={finish.name}
          type="button"
          role="radio"
          aria-checked={selected === index}
          aria-label={finish.name}
          style={{ background: finish.swatch }}
          onClick={() => setSelected(index)}
        />)}
      </div>
    </div>
  </div>;
}
