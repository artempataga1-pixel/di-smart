import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "@/app/admin/session-actions";

export const metadata: Metadata = {
  title: "Di-SMART Admin",
  robots: { index: false, follow: false },
};

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <div className="mb-8 font-[family-name:var(--font-body)] text-lg font-semibold">
          Di-SMART <span className="text-[var(--color-accent)]">Admin</span>
        </div>
        <AdminNav />
        <form action={logoutAction} className="mt-auto pt-6">
          <button
            type="submit"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-line)] py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
          >
            Выйти
          </button>
        </form>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
