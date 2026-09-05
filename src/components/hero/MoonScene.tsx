"use client";

import { forwardRef } from "react";

interface MoonSceneRefs {
  haloRef: React.RefObject<HTMLDivElement | null>;
  dustRef: React.RefObject<SVGGElement | null>;
  discRef: React.RefObject<HTMLDivElement | null>;
  terminatorRef: React.RefObject<SVGCircleElement | null>;
  orbitRef: React.RefObject<HTMLDivElement | null>;
}

const DUST_POINTS = [
  { cx: 40, cy: 60, r: 4, duration: 8, delay: 0 },
  { cx: 340, cy: 90, r: 3, duration: 10, delay: 0.6 },
  { cx: 70, cy: 260, r: 5, duration: 9, delay: 1.2 },
  { cx: 310, cy: 300, r: 3, duration: 11, delay: 0.3 },
  { cx: 200, cy: 20, r: 2.5, duration: 7.5, delay: 0.9 },
  { cx: 20, cy: 180, r: 3.5, duration: 9.5, delay: 1.6 },
  { cx: 360, cy: 200, r: 2.5, duration: 8.5, delay: 0.4 },
  { cx: 180, cy: 340, r: 4, duration: 10.5, delay: 1.1 },
];

/** Чисто визуальная сцена — вся интерактивность (parallax/scroll) навешивается
 * снаружи через рефы на эти слои родительским MoonHero. */
export const MoonScene = forwardRef<HTMLDivElement, { refs: MoonSceneRefs }>(
  function MoonScene({ refs }, stageRef) {
    const { haloRef, dustRef, discRef, terminatorRef, orbitRef } = refs;

    return (
      <div ref={stageRef} className="moon-stage mx-auto aspect-square w-full max-w-[420px]">
        <div ref={haloRef} className="moon-halo" aria-hidden />

        <svg
          className="moon-dust absolute inset-0 h-full w-full"
          viewBox="0 0 380 360"
          aria-hidden
        >
          <g ref={dustRef}>
            {DUST_POINTS.map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill="var(--color-accent)"
                opacity={0.5}
                style={
                  {
                    "--dust-duration": `${p.duration}s`,
                    "--dust-delay": `${p.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        </svg>

        <div ref={orbitRef} className="absolute inset-0">
          <div className="moon-orbit-dot" />
        </div>

        <div ref={discRef} className="absolute inset-[14%]">
          <svg viewBox="0 0 200 200" className="h-full w-full overflow-hidden">
            <defs>
              <radialGradient id="moonBody" cx="35%" cy="30%" r="80%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#d9c8ef" />
                <stop offset="100%" stopColor="var(--color-accent-dark)" />
              </radialGradient>
              <filter id="craterBlur">
                <feGaussianBlur stdDeviation="3.2" />
              </filter>
            </defs>

            <circle cx="100" cy="100" r="96" fill="url(#moonBody)" />

            <ellipse cx="70" cy="70" rx="22" ry="16" fill="var(--color-ink)" opacity="0.16" filter="url(#craterBlur)" />
            <ellipse cx="130" cy="60" rx="14" ry="11" fill="var(--color-ink)" opacity="0.14" filter="url(#craterBlur)" />
            <ellipse cx="120" cy="130" rx="26" ry="18" fill="var(--color-ink)" opacity="0.18" filter="url(#craterBlur)" />
            <ellipse cx="55" cy="140" rx="12" ry="9" fill="var(--color-ink)" opacity="0.13" filter="url(#craterBlur)" />

            <circle
              cx="100"
              cy="100"
              r="97"
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            {/* Терминатор фазы — круг цвета фона поверх диска. Анимируется через
                SVG-атрибут cx (не CSS transform: px на SVG-геометрии имеет
                неоднозначную браузерную семантику относительно viewBox).
                Стартует концентрично центру диска — почти полностью его
                закрывая ("новолуние"), затем уезжает вправо на скролле. */}
            <circle ref={terminatorRef} cx="100" cy="100" r="99" fill="var(--color-bg)" />
          </svg>
        </div>

        <div className="absolute inset-0" aria-hidden>
          <MoonFlare x="18%" y="24%" delay={0} />
          <MoonFlare x="82%" y="66%" delay={1.4} />
          <MoonFlare x="72%" y="18%" delay={2.6} />
        </div>
      </div>
    );
  }
);

function MoonFlare({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <svg
      className="moon-flare absolute size-4 -translate-x-1/2 -translate-y-1/2 text-[var(--color-accent)]"
      style={{ left: x, top: y, "--flare-delay": `${delay}s` } as React.CSSProperties}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}
