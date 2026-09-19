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
    // React's JSX `muted` prop doesn't reliably set the DOM property on
    // <video> — without this, the browser treats it as unmuted and blocks
    // autoplay outright, showing its own native play button instead.
    element.muted = true;
    element.defaultMuted = true;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    // The hero is always the first thing on the page — no need to gate playback
    // on viewport visibility or a "slow connection" guess (Network Information
    // API's effectiveType is unreliable and was silently blocking autoplay on
    // perfectly normal connections). Just play it; pause only while the tab is
    // actually hidden or the user asked for reduced motion.
    const update = () => {
      if (media.matches || document.hidden) {
        element.pause();
        return;
      }
      if (element.getAttribute("src") !== video) element.src = video;
      if (!element.ended) void element.play().catch(() => {});
    };
    update();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);

    // Safety net: a small minority of browsers/devices block even muted
    // autoplay outright (a manually-set Safari "Never Auto-Play" preference,
    // certain battery-saver modes, etc.) — nothing a web page can force past.
    // Rather than leave the browser's own paused/play-button state showing,
    // resume playback silently on the very first interaction with the page,
    // whatever it is (tap, scroll, key press) — no visible control of ours
    // required, and in practice this fires within a moment of landing.
    const retry = () => { if (!media.matches && !document.hidden) void element.play().catch(() => {}); };
    const interactionEvents = ["pointerdown", "touchstart", "keydown", "scroll", "wheel"] as const;
    for (const type of interactionEvents) {
      document.addEventListener(type, retry, { once: true, passive: true, capture: true });
    }

    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      for (const type of interactionEvents) {
        document.removeEventListener(type, retry, { capture: true });
      }
      element.pause();
    };
  }, [video]);
  return <section className={styles.hero} aria-label="Технологии Di-SMART">
    <div className={styles.heroFrame}>
    <Image src={poster} alt="" fill sizes="100vw" preload className={styles.heroMedia} />
    <video ref={ref} muted playsInline autoPlay preload="auto" poster={poster} aria-hidden="true" className={styles.heroMedia} onError={() => setFailed(true)} style={failed ? { display: "none" } : undefined} />
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
