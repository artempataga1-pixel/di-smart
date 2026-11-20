import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "@/app/admin/session-actions";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

// Админские страницы содержат оперативные данные и не должны наследовать
// ISR-кеш публичной витрины.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Di-SMART Admin",
  robots: { index: false, follow: false },
};

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-theme flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)] lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="mb-4 flex items-center justify-between lg:mb-10">
          <Link href="/admin" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-sm font-bold text-white">D</span>
            <span>Di-SMART <span className="text-[var(--color-accent-ink)]">Admin</span></span>
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent-ink)] lg:hidden">
            Сайт <ExternalLink size={13} aria-hidden="true" />
          </Link>
        </div>
        <AdminNav />
        <div className="mt-4 hidden border-t border-[var(--color-line)] pt-4 lg:mt-auto lg:block">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="mb-3 flex items-center justify-between rounded-xl px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-ink)]">
            Открыть сайт <ExternalLink size={15} aria-hidden="true" />
          </Link>
          <form action={logoutAction}>
            <SubmitButton type="submit" className="w-full rounded-xl border border-[var(--color-line)] py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]">Выйти</SubmitButton>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        <form action={logoutAction} className="mt-10 border-t border-[var(--color-line)] pt-4 lg:hidden">
          <SubmitButton type="submit" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-ink)]">Выйти из админки</SubmitButton>
        </form>
      </main>
    </div>
  );
}
