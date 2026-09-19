"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import styles from "./storefront.module.css";

export function HeroVideo({ video, poster }: { video: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const constrained = Boolean(
      connection?.saveData ||
      (connection?.effectiveType && connection.effectiveType !== "4g")
    );
    let visible = false;
    const update = () => {
      if (!visible || media.matches || constrained || document.hidden) {
        element.pause();
        return;
      }
      // Preserve the playback position when the hero re-enters the viewport.
      if (element.getAttribute("src") !== video) element.src = video;
      if (!element.ended) void element.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0 });
    observer.observe(element);
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [video]);
  return <section className={styles.hero} aria-label="Технологии Di-SMART">
    <div className={styles.heroFrame}>
    <Image src={poster} alt="" fill sizes="100vw" preload className={styles.heroMedia} />
    <video ref={ref} muted playsInline autoPlay preload="none" poster={poster} aria-hidden="true" className={styles.heroMedia} onError={() => setFailed(true)} style={failed ? { display: "none" } : undefined} />
    </div>
    <div className={styles.heroCopy}>
      <h1 className="sr-only">Di-SMART — интернет-магазин электроники</h1>
      <p className={styles.heroMessage}>Ваше следующее любимое устройство.</p>
      <a href="#highlights" className={styles.scrollCue} onClick={(event) => {
        const target = document.getElementById("highlights");
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }}>Листайте ниже <ArrowDown size={18} aria-hidden="true" /></a>
    </div>
  </section>;
}
