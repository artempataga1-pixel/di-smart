"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paginationRef = useRef<HTMLDivElement>(null);
  const paramsKey = searchParams.toString();
  const pageHrefs = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => {
      const nextPage = index + 1;
      const params = new URLSearchParams(paramsKey);
      if (nextPage <= 1) params.delete("page");
      else params.set("page", String(nextPage));
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    }),
    [paramsKey, pathname, totalPages],
  );

  useEffect(() => {
    const element = paginationRef.current;
    if (!element) return;

    const warmPages = () => {
      for (const index of [page - 2, page]) {
        const href = pageHrefs[index];
        if (href) router.prefetch(href);
      }
    };
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            observer?.disconnect();
            warmPages();
          },
          { rootMargin: "700px 0px" },
        )
      : null;

    if (observer) observer.observe(element);
    else warmPages();
    return () => observer?.disconnect();
  }, [page, pageHrefs, router]);

  if (totalPages <= 1) return null;

  const hrefForPage = (nextPage: number) => pageHrefs[nextPage - 1] ?? pathname;

  return (
    <div ref={paginationRef} className="mt-8 flex min-w-0 flex-wrap items-center justify-center gap-2 sm:mt-10">
      <Link
        href={hrefForPage(Math.max(1, page - 1))}
        prefetch
        replace
        scroll={false}
        aria-disabled={page === 1}
        aria-label="Предыдущая страница"
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] sm:size-9 ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
      >
        <ChevronLeft className="size-4" />
      </Link>

      <select
        aria-label="Страница каталога"
        value={page}
        onChange={(event) => router.replace(hrefForPage(Number(event.target.value)), { scroll: false })}
        className="min-h-11 max-w-[calc(100vw-144px)] rounded-full border border-[var(--color-line)] bg-white px-3 text-sm font-medium text-[var(--color-text)] sm:hidden"
      >
        {pageHrefs.map((_, index) => (
          <option key={index} value={index + 1}>Страница {index + 1} из {totalPages}</option>
        ))}
      </select>

      <div className="hidden min-w-0 flex-wrap items-center justify-center gap-1.5 sm:flex">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={hrefForPage(p)}
            prefetch={false}
            onMouseEnter={() => router.prefetch(hrefForPage(p))}
            onFocus={() => router.prefetch(hrefForPage(p))}
            replace
            scroll={false}
            aria-current={p === page ? "page" : undefined}
            className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
              p === page
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      <Link
        href={hrefForPage(Math.min(totalPages, page + 1))}
        prefetch
        replace
        scroll={false}
        aria-disabled={page === totalPages}
        aria-label="Следующая страница"
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] sm:size-9 ${page === totalPages ? "pointer-events-none opacity-40" : ""}`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
