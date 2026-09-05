"use client";

import { useEffect, useRef } from "react";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

export function ContactsVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const directionRef = useRef<"forward" | "reverse">("forward");
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const REVERSE_RATE = 1;

    const stepReverse = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const next = video.currentTime - dt * REVERSE_RATE;

      if (next <= 0) {
        video.currentTime = 0;
        directionRef.current = "forward";
        lastTsRef.current = null;
        void video.play();
        return;
      }

      video.currentTime = next;
      rafRef.current = requestAnimationFrame(stepReverse);
    };

    const handleEnded = () => {
      directionRef.current = "reverse";
      video.pause();
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(stepReverse);
    };

    video.addEventListener("ended", handleEnded);
    void video.play();

    return () => {
      video.removeEventListener("ended", handleEnded);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden md:h-[560px]">
      <video
        ref={videoRef}
        className="h-full w-full object-cover [transform:scaleY(-1)]"
        src={VIDEO_SRC}
        muted
        playsInline
        autoPlay
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-white/0 to-[66.943%] to-white" />
    </div>
  );
}
