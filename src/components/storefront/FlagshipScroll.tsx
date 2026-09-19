"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./flagship-stories.module.css";

export function FlagshipScroll({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const stage = root.current;
    if (!stage) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || (connection?.effectiveType && connection.effectiveType !== "4g")) return;
    const cards = Array.from(stage.children) as HTMLElement[];
    if (cards.length < 2) return;
    const match = gsap.matchMedia();
    match.add("(prefers-reduced-motion: no-preference) and (min-width: 768px) and (min-height: 551px)", () => {
      gsap.set(stage, { height: "calc(100svh - 110px)", overflow: "hidden" });
      gsap.set(cards, { position: "absolute", top: 0, left: 0, right: 0 });
      gsap.set(cards.slice(1), { y: () => stage.offsetHeight + 32 });
      const syncAccess = () => {
        // Only the card currently presented should receive keyboard focus.
        let active = 0;
        cards.forEach((card, index) => { if (index && Number(gsap.getProperty(card, "y")) < stage.offsetHeight / 2) active = index; });
        cards.forEach((card, index) => { card.inert = index !== active; });
      };
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: stage, start: "top 80px", end: () => `+=${window.innerHeight * (cards.length - 1) * 1.3}`,
        pin: true, scrub: .65, invalidateOnRefresh: true,
        onRefresh: syncAccess,
      }, onUpdate: syncAccess });
      cards.slice(1).forEach((card, index) => {
        timeline.to({}, { duration: .2 });
        timeline.fromTo(card, { y: () => stage.offsetHeight + 32 }, { y: 0, duration: 1, ease: "none", immediateRender: false });
        timeline.set(cards[index], { visibility: "hidden" });
      });
      timeline.to({}, { duration: .25 });
      syncAccess();
      return () => {
        cards.forEach(card => { card.inert = false; });
      };
    });
    return () => match.revert();
  }, { scope: root });
  return <div ref={root} className={styles.stage}>{children}</div>;
}
