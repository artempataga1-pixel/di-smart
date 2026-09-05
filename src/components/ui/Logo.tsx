import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE } from "@/constants/content/site";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Временный бейдж заказчика (круглая эмблема с диском/кольцом as-is —
 * чистовая обработка фона отложена, см. заметку к задаче 12 в плане).
 * Круглая обрезка через rounded-full маскирует квадратные углы исходного PNG.
 */
export function Logo({ variant = "light", className }: LogoProps) {
  const ink = variant === "dark" ? "var(--color-on-ink)" : "var(--color-text)";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/images/logo-badge-temp.png"
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-full"
        priority
      />
      <span
        className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-wide"
        style={{ color: ink }}
      >
        {SITE.name}
      </span>
    </span>
  );
}
