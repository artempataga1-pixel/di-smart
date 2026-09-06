export function AdminErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-[var(--radius-sm)] border border-[var(--color-warning)] bg-[var(--color-accent-soft)] px-4 py-2.5 text-sm text-[var(--color-accent-ink)]"
    >
      {message}
    </p>
  );
}
