"use client";

import Link from "next/link";
import { X, Phone } from "lucide-react";
import { MAIN_NAV } from "@/constants/content/nav";
import { SITE } from "@/constants/content/site";
import type { NavBrand } from "@/lib/catalog";

export function MobileMenu({
  navBrands,
  onClose,
}: {
  navBrands: NavBrand[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)] md:hidden">
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-line)] px-4">
        <span className="font-[family-name:var(--font-heading)] text-lg font-semibold">
          Меню
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть меню"
          className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line)]"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="rounded-[var(--radius-sm)] px-3 py-3 text-lg font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
          >
            {item.label}
          </Link>
        ))}

        {navBrands.map((brand) => (
          <div key={brand.slug}>
            <p className="mt-4 px-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              {brand.name}
            </p>
            {brand.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog/${cat.slug}`}
                onClick={onClose}
                className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <a
        href={SITE.phoneHref}
        className="flex items-center justify-center gap-2 border-t border-[var(--color-line)] p-4 text-lg font-semibold text-[var(--color-accent-ink)]"
      >
        <Phone className="size-5" />
        {SITE.phone}
      </a>
    </div>
  );
}
