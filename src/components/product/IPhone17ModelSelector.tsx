import Link from "next/link";
import { productPath } from "@/lib/product-route";
import { cn } from "@/lib/utils";

const models = [
  { slug: "iphone-17-pro", name: "iPhone 17 Pro", screen: "6,3″" },
  { slug: "iphone-17-pro-max", name: "iPhone 17 Pro Max", screen: "6,9″" },
] as const;

/** Keep each model's URL, photos, variants and specifications together. */
export function IPhone17ModelSelector({ slug }: { slug: string }) {
  if (!models.some((model) => model.slug === slug)) return null;

  return (
    <nav aria-label="Модель">
      <p className="mb-3 text-[15px] font-semibold text-[var(--color-text)]">Модель</p>
      <div className="grid max-w-[560px] grid-cols-2 gap-2.5">
        {models.map((model) => {
          const active = model.slug === slug;
          return (
            <Link
              key={model.slug}
              href={productPath(model.slug)}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[82px] min-w-0 flex-col justify-center gap-[5px] rounded-2xl border px-3 py-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-accent)] sm:px-[18px]",
                active
                  ? "border-[var(--color-accent)] bg-[#f4f8ff] shadow-[inset_0_0_0_1px_var(--color-accent)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-accent)]"
              )}
            >
              <span className="text-base font-semibold tracking-[-.02em] text-[var(--color-text)]">
                {model.name}
              </span>
              <span className="text-[13px] text-[var(--color-muted)]">Экран {model.screen}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
