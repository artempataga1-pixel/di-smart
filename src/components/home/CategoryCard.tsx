"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { CategoryContent } from "@/types/content";

export interface MagnetSquare {
  /** позиция в % относительно фото-плашки */
  x: number;
  y: number;
  /** размер квадратика в px */
  size: number;
}

interface CategoryCardProps {
  category: CategoryContent;
  image: string;
  squares: MagnetSquare[];
}

const GRID_COLS = 12;
const GRID_ROWS = 8;

const PIXEL_BLOCKS = Array.from({ length: GRID_ROWS }, (_, row) =>
  Array.from({ length: GRID_COLS }, (_, col) => ({ row, col }))
).flat();

interface MagnetSquareItemProps {
  square: MagnetSquare;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}

function MagnetSquareItem({ square, pointerX, pointerY }: MagnetSquareItemProps) {
  const dx = useTransform(pointerX, (v) => (v - square.x / 100) * 40);
  const dy = useTransform(pointerY, (v) => (v - square.y / 100) * 40);
  const springX = useSpring(dx, { stiffness: 80, damping: 18, mass: 0.6 });
  const springY = useSpring(dy, { stiffness: 80, damping: 18, mass: 0.6 });

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute rounded-[3px] bg-[var(--color-accent-ink)]/30 mix-blend-multiply"
      style={{
        left: `${square.x}%`,
        top: `${square.y}%`,
        width: square.size,
        height: square.size,
        x: springX,
        y: springY,
      }}
    />
  );
}

export function CategoryCard({ category, image, squares }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      pointerX.set((e.clientX - rect.left) / rect.width);
      pointerY.set((e.clientY - rect.top) / rect.height);
    },
    [pointerX, pointerY]
  );

  const handleLeave = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
    setHovered(false);
  }, [pointerX, pointerY]);

  return (
    <Link
      href={`/catalog/${category.slug}`}
      data-stagger-item
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group flex flex-col overflow-hidden rounded-[6px_var(--radius-xl)_6px_var(--radius-xl)] border border-[var(--color-ink)]/15 bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-accent-soft)]">
        <Image
          src={image}
          alt={category.title}
          fill
          sizes="(min-width: 768px) 20vw, 50vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />

        <div
          className="pointer-events-none absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}
        >
          {PIXEL_BLOCKS.map(({ row, col }) => {
            const delayIn = (row + col) * 0.018;
            const delayOut = (GRID_ROWS - row + (GRID_COLS - col)) * 0.012;
            return (
              <motion.span
                key={`${row}-${col}`}
                className="bg-[var(--color-accent-ink)]/50"
                initial={false}
                animate={{ scale: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.25, delay: hovered ? delayIn : delayOut }}
              />
            );
          })}
        </div>

        {squares.map((sq, i) => (
          <MagnetSquareItem key={i} square={sq} pointerX={pointerX} pointerY={pointerY} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 p-4">
        <span className="text-sm font-medium text-[var(--color-text)]">{category.title}</span>
        <ArrowUpRight className="size-4 shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent-ink)]" />
      </div>
    </Link>
  );
}
