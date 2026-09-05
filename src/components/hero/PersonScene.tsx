"use client";

import { useEffect, useRef } from "react";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4";

/** Ниже этой ширины скраббинг мышью недоступен — там просто идёт обычное автовоспроизведение. */
const DESKTOP_BREAKPOINT = 1024;

/** Видео человека, который "следит" за курсором: на десктопе горизонтальное
 * движение мыши перематывает таймлайн ролика, создавая иллюзию слежения
 * взглядом; на мобильных экранах ролик просто проигрывается сам. */
export function PersonScene() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let prevX: number | null = null;
    let target = 0;
    let seeking = false;

    function applySeek() {
      if (!video) return;
      seeking = true;
      video.currentTime = target;
    }

    function handleMouseMove(e: MouseEvent) {
      if (!video || window.innerWidth < DESKTOP_BREAKPOINT || !video.duration) return;

      if (prevX === null) {
        prevX = e.clientX;
        return;
      }

      const delta = e.clientX - prevX;
      prevX = e.clientX;

      target = Math.min(
        Math.max(target + (delta / window.innerWidth) * 0.8 * video.duration, 0),
        video.duration
      );

      if (!seeking) applySeek();
    }

    function handleSeeked() {
      seeking = false;
      if (video && Math.abs(video.currentTime - target) > 0.03) applySeek();
    }

    window.addEventListener("mousemove", handleMouseMove);
    video.addEventListener("seeked", handleSeeked);

    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      video.autoplay = true;
      video.play().catch(() => {});
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-surface)]">
      <video
        ref={videoRef}
        className="h-full w-full object-cover object-right"
        src={VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
    </div>
  );
}
