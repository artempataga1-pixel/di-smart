export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <p className="text-sm text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-body)] text-3xl font-semibold">
        {value}
        {hint && <span className="ml-1.5 text-sm font-normal text-[var(--color-muted)]">{hint}</span>}
      </p>
    </div>
  );
}
