export function ProductSpecsTable({
  specs,
  description,
}: {
  specs: { name: string; value: string }[];
  description: string | null;
}) {
  if (!description && specs.length === 0) return null;

  return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-7">
        {description && (
          <>
            <h2 className="text-lg font-semibold leading-snug text-[var(--color-text)]">Описание</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-muted)] sm:text-base sm:leading-7">{description}</p>
          </>
        )}

        {specs.length > 0 && (
          <>
            <h2 className={`${description ? "mt-7" : ""} text-lg font-semibold leading-snug text-[var(--color-text)]`}>Характеристики</h2>
            <dl className="mt-3 divide-y divide-[var(--color-line)]">
              {specs.map((spec) => (
                <div key={`${spec.name}:${spec.value}`} className="grid gap-1 py-2.5 text-sm leading-6 sm:grid-cols-[minmax(9rem,0.42fr)_1fr] sm:gap-5">
                  <dt className="text-[var(--color-muted)]">{spec.name}</dt>
                  <dd className="font-medium text-[var(--color-text)]">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
  );
}
