import Link from "next/link";
import { Phone, Clock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FOOTER_CATALOG_NAV, FOOTER_INFO_NAV } from "@/constants/content/nav";
import { SITE } from "@/constants/content/site";
import { TelegramIcon, InstagramIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-ink-soft)] bg-[var(--color-ink)] text-[var(--color-on-ink)]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo variant="dark" />
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
              {SITE.tagline}
            </p>
            <p className="mt-3 max-w-xs text-sm text-[var(--color-on-ink-muted)]">
              Интернет-магазин техники Apple, Samsung и аксессуаров.
              Доставка по всей Беларуси.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-on-ink)]">Каталог</p>
            <ul className="flex flex-col gap-2">
              {FOOTER_CATALOG_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-on-ink-muted)] hover:text-[var(--color-on-ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[var(--color-on-ink)]">Информация</p>
            <ul className="flex flex-col gap-2">
              {FOOTER_INFO_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-on-ink-muted)] hover:text-[var(--color-on-ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 text-sm text-[var(--color-on-ink-muted)]">
            <a href={SITE.phoneHref} className="flex items-center gap-2 hover:text-[var(--color-on-ink)]">
              <Phone className="size-4 shrink-0" />
              {SITE.phone}
            </a>
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              {SITE.hours}
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              <a
                href={SITE.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-on-ink-muted)]/30 px-3 py-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-on-ink)]"
              >
                <TelegramIcon className="size-4 shrink-0" />
                Telegram
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-on-ink-muted)]/30 px-3 py-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-on-ink)]"
              >
                <InstagramIcon className="size-4 shrink-0" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--color-on-ink-muted)]/15 pt-6 text-xs text-[var(--color-on-ink-muted)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.fullName}. Демо-версия сайта.</p>
          <p>Цены и наличие носят ознакомительный характер.</p>
        </div>
      </div>
    </footer>
  );
}
