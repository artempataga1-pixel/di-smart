import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductVisual, CATEGORY_GRADIENT } from "@/components/ui/ProductVisual";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { CategorySlug, ProductIconKey } from "@/types/product";

interface PromoBannerProps {
  eyebrow: string;
  title: string;
  href: string;
  icon: ProductIconKey;
  category: CategorySlug;
  reverse?: boolean;
  image?: string;
  video?: string;
}

export function PromoBanner({
  eyebrow,
  title,
  href,
  icon,
  category,
  reverse,
  image,
  video,
}: PromoBannerProps) {
  return (
    <RevealOnScroll>
      <Link
        href={href}
        className={`group grid overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] md:grid-cols-2 ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-[16/10] md:aspect-auto">
          <div className="transition-transform duration-500 group-hover:scale-105 h-full w-full">
            {video ? (
              <div
                className={cn(
                  "relative h-full w-full bg-gradient-to-br",
                  CATEGORY_GRADIENT[category]
                )}
              >
                <video
                  className="h-full w-full object-contain p-10"
                  src={video}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />
              </div>
            ) : image ? (
              <div
                className={cn(
                  "relative h-full w-full bg-gradient-to-br",
                  CATEGORY_GRADIENT[category]
                )}
              >
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain p-10"
                />
              </div>
            ) : (
              <ProductVisual icon={icon} category={category} size="lg" />
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3 p-8 md:p-12">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
            {eyebrow}
          </p>
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
            {title}
          </h3>
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-accent-ink)] transition-colors group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-surface-soft)]">
            В каталог
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </RevealOnScroll>
  );
}
