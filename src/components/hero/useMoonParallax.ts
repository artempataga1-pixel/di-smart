import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useIsTouch } from "@/lib/useIsTouch";

interface MoonParallaxRefs {
  stageRef: React.RefObject<HTMLDivElement | null>;
  haloRef: React.RefObject<HTMLDivElement | null>;
  discRef: React.RefObject<HTMLDivElement | null>;
  orbitRef: React.RefObject<HTMLDivElement | null>;
}

/** Десктоп: курсор двигает слои сцены с разной глубиной (halo медленнее всех,
 * диск луны — заметнее всего). Тач/мобайл: лёгкий бесконечный idle-дрейф вместо
 * mousemove-трекинга — программный scroll в drawer/чекауте не должен его дёргать. */
export function useMoonParallax({ stageRef, haloRef, discRef, orbitRef }: MoonParallaxRefs) {
  const isTouch = useIsTouch();

  useGSAP(
    () => {
      if (isTouch) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const stage = stageRef.current;
      if (!stage) return;

      const layers = [
        { ref: haloRef, factor: 10 },
        { ref: discRef, factor: 22 },
        { ref: orbitRef, factor: 14 },
      ];

      const movers = layers.map((layer) => ({
        x: gsap.quickTo(layer.ref.current, "x", { duration: 0.6, ease: "power3.out" }),
        y: gsap.quickTo(layer.ref.current, "y", { duration: 0.6, ease: "power3.out" }),
        factor: layer.factor,
      }));

      function onMove(e: MouseEvent) {
        const rect = stage!.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.factor);
          m.y(ny * m.factor);
        });
      }

      function onLeave() {
        movers.forEach((m) => {
          m.x(0);
          m.y(0);
        });
      }

      stage.addEventListener("mousemove", onMove);
      stage.addEventListener("mouseleave", onLeave);
      return () => {
        stage.removeEventListener("mousemove", onMove);
        stage.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: stageRef, dependencies: [isTouch] }
  );

  // Тач: мягкий бесконечный idle-дрейф диска, чтобы сцена не была статичной.
  useEffect(() => {
    if (!isTouch) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.to(discRef.current, {
      x: 4,
      y: -4,
      duration: 5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, [isTouch, discRef]);
}
