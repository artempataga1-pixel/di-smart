"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ChartNoAxesCombined, FolderTree, LayoutGrid, Package, Settings2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Обзор", icon: ChartNoAxesCombined },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: FolderTree },
  { href: "/admin/brands", label: "Бренды", icon: Boxes },
  { href: "/admin/orders", label: "Заказы", icon: LayoutGrid },
  { href: "/admin/settings", label: "Настройки", icon: Settings2 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Разделы админки" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent-ink)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
            }`}
          >
            <item.icon size={17} strokeWidth={1.8} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
