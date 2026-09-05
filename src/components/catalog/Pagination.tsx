import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Предыдущая страница"
        className="flex size-9 items-center justify-center rounded-full border border-[var(--color-line)] disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
            p === page
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Следующая страница"
        className="flex size-9 items-center justify-center rounded-full border border-[var(--color-line)] disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
