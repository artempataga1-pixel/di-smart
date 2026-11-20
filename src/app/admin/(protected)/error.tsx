"use client";

export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section role="alert" className="rounded-xl border border-[var(--color-line)] p-6">
    <h1 className="text-xl font-semibold">Не удалось выполнить действие</h1>
    <p className="my-4">Обновите данные и проверьте результат перед повторным сохранением.</p>
    <button type="button" onClick={retry} className="soft-btn rounded-full px-6 py-3">Обновить данные</button>
  </section>;
}
