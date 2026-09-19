"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export interface AdaptiveHeroVideoSource {
  src: string;
  type: string;
}

type VideoProps = Omit<
  ComponentPropsWithoutRef<"video">,
  "autoPlay" | "children" | "playsInline" | "poster" | "preload" | "src"
>;

interface AdaptiveHeroVideoProps extends VideoProps {
  poster: string;
  sources: readonly AdaptiveHeroVideoSource[];
}

/**
 * Autoplaying hero video that keeps its poster on constrained devices and only
 * attaches media sources after the hero actually enters the viewport.
 */
export function AdaptiveHeroVideo({
  poster,
  sources,
  onCanPlay,
  ...props
}: AdaptiveHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleRef = useRef(false);
  const allowedRef = useRef(false);
  const [sourcesEnabled, setSourcesEnabled] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React's JSX `muted` prop doesn't reliably set the DOM property on
    // <video> — without this, the browser treats it as unmuted and blocks
    // autoplay, showing its own native play button instead.
    video.muted = true;
    video.defaultMuted = true;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithConnection).connection;

    const mayPlay = () =>
      !reducedMotion.matches &&
      !connection?.saveData &&
      (!connection?.effectiveType || connection.effectiveType === "4g");

    const syncPlayback = () => {
      allowedRef.current = mayPlay();
      const shouldPlay = allowedRef.current && visibleRef.current;
      if (!allowedRef.current) setSourcesEnabled(false);
      else if (visibleRef.current) setSourcesEnabled(true);

      if (!shouldPlay || document.hidden) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // The poster remains visible when browser autoplay policy blocks video.
      });
    };

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            visibleRef.current = entry.isIntersecting;
            syncPlayback();
          },
          { threshold: 0.01 },
        )
      : null;

    if (observer) observer.observe(video);
    else {
      visibleRef.current = true;
      syncPlayback();
    }
    reducedMotion.addEventListener("change", syncPlayback);
    connection?.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);

    // Safety net: if a browser blocks even muted autoplay outright (a
    // manually-set "Never Auto-Play" preference, certain battery-saver
    // modes), resume silently on the very first interaction with the page —
    // no visible control of ours required.
    const retry = () => { if (video.paused && visibleRef.current && allowedRef.current) void video.play().catch(() => {}); };
    const interactionEvents = ["pointerdown", "touchstart", "keydown", "scroll", "wheel"] as const;
    for (const type of interactionEvents) {
      document.addEventListener(type, retry, { once: true, passive: true, capture: true });
    }

    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
      connection?.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      for (const type of interactionEvents) {
        document.removeEventListener(type, retry, { capture: true });
      }
      video.pause();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Adding/removing <source> nodes does not reliably restart resource
    // selection in every browser, so explicitly refresh the media element.
    video.load();
    if (sourcesEnabled && visibleRef.current && allowedRef.current && !document.hidden) {
      void video.play().catch(() => {});
    }
  }, [sourcesEnabled]);

  return (
    <video
      {...props}
      ref={videoRef}
      autoPlay
      muted
      playsInline
      preload="none"
      poster={poster}
      onCanPlay={(event) => {
        onCanPlay?.(event);
        if (visibleRef.current && allowedRef.current && !document.hidden) {
          void event.currentTarget.play().catch(() => {});
        }
      }}
    >
      {sourcesEnabled &&
        sources.map((source) => (
          <source key={`${source.type}:${source.src}`} src={source.src} type={source.type} />
        ))}
      Ваш браузер не поддерживает фоновое видео.
    </video>
  );
}
