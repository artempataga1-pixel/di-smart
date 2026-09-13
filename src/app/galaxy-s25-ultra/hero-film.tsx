"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { MediaFrame, type MediaAsset } from "@/components/ui/MediaFrame";
import styles from "./hero-film.module.css";

type PlayState = "paused" | "playing" | "ended" | "error";

/** videoSrc не задан, пока не пришлют готовый ролик — до этого рендерится
 * статичный постер-плейсхолдер того же визуального веса, чтобы подстановка
 * реального видео не требовала правок разметки (см. Global Constraints). */
export function HeroFilm({ poster, videoSrc }: { poster: MediaAsset; videoSrc?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<PlayState>("paused");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!videoSrc || reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => setState("playing")).catch(() => setState("paused"));
  }, [videoSrc, reduceMotion]);

  useEffect(() => {
    if (!videoSrc) return;
    function onVisibility() {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) video.pause();
      else if (state === "playing") video.play();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [videoSrc, state]);

  if (!videoSrc || state === "error") {
    return (
      <div className={styles.frame}>
        <MediaFrame asset={poster} className={styles.media} fill />
      </div>
    );
  }

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (state === "playing") {
      video.pause();
      setState("paused");
    } else {
      if (state === "ended") video.currentTime = 0;
      video.play();
      setState("playing");
    }
  }

  return (
    <div className={styles.frame}>
      <video
        ref={videoRef}
        className={styles.media}
        src={videoSrc}
        poster={poster.src}
        muted
        playsInline
        onEnded={() => setState("ended")}
        onError={() => setState("error")}
      />
      <button
        type="button"
        onClick={toggle}
        className={styles.control}
        aria-label={state === "playing" ? "Пауза" : state === "ended" ? "Смотреть снова" : "Воспроизвести"}
      >
        {state === "playing" ? <Pause size={18} /> : state === "ended" ? <RotateCcw size={18} /> : <Play size={18} />}
      </button>
    </div>
  );
}
