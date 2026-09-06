"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/brands", label: "Бренды" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/settings", label: "Настройки" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent-ink)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
