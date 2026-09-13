// src/app/galaxy-s25-ultra/galaxy-ai-experience.tsx
"use client";

import { useRef, useState } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { media } from "./galaxy-media";
import styles from "./galaxy-ai-experience.module.css";

const TABS = [
  {
    id: "circle-to-search",
    label: "Circle to Search",
    title: "Обведите — и получите ответ",
    body: "Обведите пальцем что угодно на экране — товар, текст, место на карте — Galaxy AI найдёт это в поиске, не выходя из приложения.",
  },
  {
    id: "generative-edit",
    label: "Generative Edit",
    title: "Перерисуйте кадр после съёмки",
    body: "Переместите или удалите объект на фото — Galaxy AI достроит фон так, будто его там никогда не было.",
  },
  {
    id: "note-assist",
    label: "Note Assist",
    title: "S Pen + Galaxy AI",
    body: "Рукописные заметки S Pen превращаются в форматированный текст, а Galaxy AI помогает с кратким содержанием и переводом.",
  },
] as const;

export function GalaxyAiExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = TABS[activeIndex];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = e.key === "ArrowRight" ? (activeIndex + 1) % TABS.length : (activeIndex - 1 + TABS.length) % TABS.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={styles.wrap}>
      <p>Galaxy AI</p>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700 }}>
        Ассистент, который под рукой
      </h2>
      <div role="tablist" aria-label="Возможности Galaxy AI" onKeyDown={onKeyDown} className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={i === activeIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            className={styles.tab}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className={styles.panel}>
        <div>
          <h3 className={styles.panelTitle}>{active.title}</h3>
          <p className={styles.panelBody}>{active.body}</p>
        </div>
        <MediaFrame asset={media.galaxyAiEdit} className={styles.panelMedia} />
      </div>
    </div>
  );
}
