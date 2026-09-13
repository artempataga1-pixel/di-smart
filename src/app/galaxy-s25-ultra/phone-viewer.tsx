// src/app/galaxy-s25-ultra/phone-viewer.tsx
"use client";

import { useState } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Finish } from "./galaxy-content";
import styles from "./phone-viewer.module.css";

/** До подбора лицензионной 3D-модели/360°-кадров (см. Global Constraints
 * плана и открытый пункт в задаче 12) показываем плейсхолдер-фото по
 * выбранному цвету. Переключатель цвета — уже финальный UI; апгрейд на
 * настоящий 3D/360°-вьюер не потребует правок разметки, только замену
 * MediaFrame на реальную 3D-сцену. */
export function PhoneViewer({ finishes }: { finishes: Finish[] }) {
  const [activeId, setActiveId] = useState(finishes[0].id);
  const active = finishes.find((f) => f.id === activeId) ?? finishes[0];

  return (
    <div className={styles.viewer}>
      <MediaFrame asset={active.media} className={styles.stage} />
      <div className={styles.swatches} role="radiogroup" aria-label="Цвет корпуса">
        {finishes.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={f.id === activeId}
            onClick={() => setActiveId(f.id)}
            className={styles.swatch}
            style={{ backgroundColor: f.hex }}
            aria-label={f.label}
          />
        ))}
      </div>
      <p className={styles.activeLabel}>{active.label}</p>
    </div>
  );
}
