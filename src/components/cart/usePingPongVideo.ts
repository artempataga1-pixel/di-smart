"use client";

import { useEffect, useRef } from "react";

/** Проигрывает видео вперёд до конца, затем плавно перематывает назад к
 * началу через requestAnimationFrame и снова запускает воспроизведение —
 * эффект "бумеранг" без рывка на стыке. Нативный `loop` для этого не
 * подходит: он перезапускает ролик с начала, а не разворачивает его. */
export function usePingPongVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;
    let lastTimestamp = 0;

    function stepReverse(timestamp: number) {
      if (!video) return;
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const next = video.currentTime - delta;

      if (next <= 0) {
        lastTimestamp = 0;
        video.currentTime = 0;
        video.play().catch(() => {});
        return;
      }

      video.currentTime = next;
      rafId = requestAnimationFrame(stepReverse);
    }

    function handleEnded() {
      lastTimestamp = 0;
      rafId = requestAnimationFrame(stepReverse);
    }

    video.addEventListener("ended", handleEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return videoRef;
}
