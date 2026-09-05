import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

/** Фирменный знак заказчика — планета с орбитой — плюс текстовый wordmark. */
export function Logo({ variant = "light", className }: LogoProps) {
  const ink = variant === "dark" ? "var(--color-on-ink)" : "var(--color-text)";
  const mark =
    variant === "dark" ? "/images/logo-mark-light.png" : "/images/logo-mark-dark.png";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image src={mark} alt="" width={28} height={28} className="shrink-0" priority />
      <span
        className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-wide"
        style={{ color: ink }}
      >
        ЛУНА
      </span>
    </span>
  );
}
