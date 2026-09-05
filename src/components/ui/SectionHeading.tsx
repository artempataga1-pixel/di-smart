import { cn } from "@/lib/utils";
import { PillCta } from "@/components/ui/PillCta";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "Смотреть всё",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && (
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
            {eyebrow}
          </p>
        )}
        <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-[var(--color-muted)]">{description}</p>
        )}
      </div>
      {href && (
        <PillCta href={href} variant="ghost" size="sm">
          {hrefLabel}
        </PillCta>
      )}
    </div>
  );
}
