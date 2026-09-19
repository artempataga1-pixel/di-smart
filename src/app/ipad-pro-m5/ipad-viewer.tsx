"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

const finishes = [
  { name: "Space Black", swatch: "#414247", image: "/media/ipad-pro-m5/color-space-black-studio.webp" },
  { name: "Silver", swatch: "#d9dad8", image: "/media/ipad-pro-m5/color-silver-studio.webp" },
] as const;

export function IpadViewer() {
  const [selected, setSelected] = useState(0);

  return <div className={styles.viewer} data-reveal>
    <div className={styles.colorStage} aria-live="polite">
      {finishes.map((finish, index) => <Image
        key={finish.name}
        src={finish.image}
        alt={`iPad Pro 13 дюймов, цвет ${finish.name}`}
        fill
        sizes="(max-width: 860px) 100vw, 1180px"
        className={selected === index ? styles.colorImageActive : styles.colorImage}
        priority={index === 0}
        loading={index === 0 ? undefined : "eager"}
      />)}
      <span className={styles.finishBadge}>{finishes[selected].name}</span>
    </div>
    <div className={styles.viewerPanel}>
      <div>
        <p>{finishes[selected].name}</p>
        <span>Выберите покрытие корпуса</span>
      </div>
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
