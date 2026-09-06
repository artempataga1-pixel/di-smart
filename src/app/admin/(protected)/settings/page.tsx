import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { formatDateTime } from "@/lib/format";
import { updateExchangeRateAction } from "./actions";

export const metadata: Metadata = { title: "Настройки — Di-SMART Admin" };

const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rates = await prisma.exchangeRate.findMany({ orderBy: { setAt: "desc" }, take: 20 });
  const current = rates[0];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Настройки</h1>

      <AdminErrorBanner message={error} />

      <section className="max-w-md rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-1 text-lg font-medium">Курс валют</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Текущий: <strong>{current ? current.usdToByn.toString() : "—"} BYN</strong> за 1 USD
        </p>
        <form action={updateExchangeRateAction} className="flex items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            Новый курс (BYN за 1 USD)
            <input
              name="usdToByn"
              type="number"
              step="0.0001"
              min="0"
              required
              placeholder={current?.usdToByn.toString() ?? "3.10"}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]"
          >
            Обновить
          </button>
        </form>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Изменение немедленно пересчитывает цены на витрине — без пересборки.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">История изменений</h2>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Курс</th>
                <th className="px-4 py-3 font-medium">Кем задан</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(r.setAt)}</td>
                  <td className="px-4 py-3">{r.usdToByn.toString()} BYN</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{r.setBy ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
