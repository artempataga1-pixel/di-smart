import { cn } from "@/lib/utils";

type BadgeTone = "accent" | "dark" | "warning" | "success";

const TONE_CLASS: Record<BadgeTone, string> = {
  accent: "bg-[var(--color-accent)] text-white",
  dark: "bg-[var(--color-ink)] text-[var(--color-on-ink)]",
  warning: "bg-[var(--color-warning)] text-white",
  success: "bg-[var(--color-success)] text-white",
};

export function Badge({
  children,
  tone = "accent",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
