"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, ShoppingBag, Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MAIN_NAV } from "@/constants/content/nav";
import { SITE } from "@/constants/content/site";
import { useCart } from "@/lib/cart-context";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchField } from "@/components/ui/SearchField";
import type { NavBrand } from "@/lib/catalog";

export function Header({ navBrands }: { navBrands: NavBrand[] }) {
  const { itemCount, openDrawer } = useCart();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(value: string) {
    if (!value.trim()) return;
    router.push(`/catalog?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/" className="shrink-0">
              <Logo />
            </Link>

            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              placeholder="Поиск по товарам"
              className="hidden w-48 lg:flex lg:w-64"
            />
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            {MAIN_NAV.map((item) =>
              item.label === "Каталог" ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setCatalogOpen(true)}
                  onMouseLeave={() => setCatalogOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[var(--color-text)] transition-colors hover:text-[var(--color-accent-ink)]"
                  >
                    {item.label}
                  </Link>
                  {catalogOpen && (
                    <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)]">
                        {navBrands.map((brand) => (
                          <div key={brand.slug}>
                            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                              {brand.name}
                            </p>
                            {brand.categories.map((cat) => (
                              <Link
                                key={cat.slug}
                                href={`/catalog/${cat.slug}`}
                                className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-accent-ink)]"
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[var(--color-text)] transition-colors hover:text-[var(--color-accent-ink)]"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={SITE.phoneHref}
              className="hidden items-center gap-2 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-accent-ink)] lg:flex"
            >
              <Phone className="size-4" />
              {SITE.phone}
            </a>

            <button
              type="button"
              onClick={openDrawer}
              aria-label="Корзина"
              className="relative flex size-10 items-center justify-center rounded-full border border-[var(--color-line)] transition-colors hover:border-[var(--color-accent)]"
            >
              <ShoppingBag className="size-4.5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Меню"
              className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line)] md:hidden"
            >
              <Menu className="size-4.5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <MobileMenu navBrands={navBrands} onClose={() => setMobileOpen(false)} />
      )}
    </>
  );
}
