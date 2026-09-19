"use client";

import { useEffect, useRef, useState } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { createDeviceScene } from "@/components/webgl-viewer/device-scene";
import type { Finish } from "./galaxy-content";
import styles from "./phone-viewer.module.css";

type Scene = Awaited<ReturnType<typeof createDeviceScene>>;

/**
 * Galaxy S25 Ultra viewer. Uses the shared device-agnostic WebGL engine
 * (components/webgl-viewer) with the Galaxy config. Until the licensed GLB is
 * placed in /public/media/galaxy-s25-ultra/model/, loadAssets() rejects and the
 * viewer stays on the photo poster + colour switcher — same graceful fallback
 * as the iPhone viewer. When the model arrives, the 3D activates with no markup
 * change here.
 */
export function PhoneViewer({ finishes }: { finishes: Finish[] }) {
  const [activeId, setActiveId] = useState(finishes[0].id);
  const active = finishes.find((f) => f.id === activeId) ?? finishes[0];
  const activeIndex = Math.max(0, finishes.findIndex((f) => f.id === activeId));

  const container = useRef<HTMLDivElement>(null);
  const engine = useRef<Scene | null>(null);
  const current = useRef(activeIndex);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    current.current = activeIndex;
    engine.current?.setColor(active.hex, activeIndex);
  }, [activeIndex, active.hex]);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let cancelled = false;
    let started = false;
    const observer = new IntersectionObserver((entries) => {
      if (started || !entries.some((e) => e.isIntersecting)) return;
      started = true;
      observer.disconnect();
      void Promise.all([
        import("@/components/webgl-viewer/device-scene"),
        import("./galaxy-device"),
      ])
        .then(([{ createDeviceScene }, { galaxyConfig }]) =>
          createDeviceScene(host, galaxyConfig, () => {}),
        )
        .then((scene) => {
          if (cancelled) { scene.dispose(); return; }
          engine.current = scene;
          scene.setColor(finishes[current.current].hex, current.current);
          setStatus("ready");
        })
        .catch(() => { if (!cancelled) setStatus("failed"); });
    }, { rootMargin: "300px" });
    observer.observe(host);
    return () => { cancelled = true; observer.disconnect(); engine.current?.dispose(); engine.current = null; };
  }, [finishes]);

  return (
    <div className={styles.viewer}>
      <div className={styles.stageWrap}>
        <div
          className={styles.stage3d}
          ref={container}
          data-visible={status === "ready"}
          role="region"
          aria-label="Трёхмерная модель Galaxy S25 Ultra. Перетаскивайте для вращения."
        />
        {status !== "ready" && <MediaFrame asset={active.media} className={styles.stage} />}
      </div>
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
      <p className={styles.activeLabel} role="status">
        {status === "ready" ? `${active.label} · потяните, чтобы повернуть` : status === "failed" ? `${active.label} · фотографии` : active.label}
      </p>
    </div>
  );
}
