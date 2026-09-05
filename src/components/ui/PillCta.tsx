import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillCtaProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<PillCtaProps["variant"]>, string> = {
  primary:
    "bg-[var(--color-accent)] text-white shadow-[var(--shadow-accent-glow)] hover:bg-[var(--color-accent-dark)]",
  ghost:
    "border border-[var(--color-line)] text-[var(--color-accent-ink)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-soft)]",
};

const SIZE_CLASS: Record<NonNullable<PillCtaProps["size"]>, string> = {
  md: "gap-2 px-6 py-3.5 text-sm",
  sm: "gap-1.5 px-4 py-2 text-sm",
};

export function PillCta({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: PillCtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center rounded-full font-medium transition-colors",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className
      )}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
