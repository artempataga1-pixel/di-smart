interface CheckboxFilterGroupProps<T extends string | number> {
  title: string;
  options: T[];
  selected: T[];
  onToggle: (value: T) => void;
  formatLabel?: (value: T) => string;
}

export function CheckboxFilterGroup<T extends string | number>({
  title,
  options,
  selected,
  onToggle,
  formatLabel,
}: CheckboxFilterGroupProps<T>) {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-[var(--color-text)]">{title}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2.5 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="size-4 rounded border-[var(--color-line)] text-[var(--color-accent)] accent-[var(--color-accent)]"
            />
            {formatLabel ? formatLabel(option) : option}
          </label>
        ))}
      </div>
    </div>
  );
}
