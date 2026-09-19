"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

const finishes = [
  { name: "Натуральный титан", detail: "Титан Grade 5", swatch: "#aaa49b", image: "/media/apple-watch-ultra-4/finish-natural.webp" },
  { name: "Чёрный титан", detail: "DLC-покрытие", swatch: "#272829", image: "/media/apple-watch-ultra-4/finish-black.webp" },
] as const;

export function FinishPicker() {
  const [selected, setSelected] = useState(0);

  return <div className={styles.finishPicker} data-reveal>
    <div className={styles.finishStage} aria-live="polite">
      {finishes.map((finish, index) => <Image
        key={finish.name}
        src={finish.image}
        alt={`Apple Watch Ultra 4: ${finish.name}`}
        fill
        sizes="(max-width: 800px) 100vw, 1120px"
        className={selected === index ? styles.finishActive : styles.finishImage}
        priority={index === 0}
        loading={index === 0 ? undefined : "eager"}
      />)}
      <span className={styles.finishName}>{finishes[selected].name}</span>
    </div>
    <div className={styles.finishControls}>
      <div><strong>{finishes[selected].name}</strong><span>{finishes[selected].detail} · 49 мм</span></div>
      <div className={styles.swatches} role="radiogroup" aria-label="Покрытие корпуса">
        {finishes.map((finish, index) => <button
          key={finish.name}
          type="button"
          role="radio"
          aria-checked={selected === index}
          aria-label={finish.name}
          style={{ backgroundColor: finish.swatch }}
          onClick={() => setSelected(index)}
        />)}
      </div>
    </div>
  </div>;
}
