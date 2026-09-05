"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "di-smart-cookie-consent-v1";

/* Тот же паттерн, что и cart-context.tsx: источник правды — localStorage вне
 * React, подписка через useSyncExternalStore. getServerSnapshot отдаёт
 * "принято" (баннер скрыт) на сервере, чтобы не мелькать при гидратации —
 * React сам ресинхронизирует с реальным client-снапшотом сразу после неё. */
const listeners = new Set<() => void>();
let acceptedInMemory = false;

function isAccepted(): boolean {
  if (acceptedInMemory) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getServerSnapshot() {
  return true;
}

export function CookieBanner() {
  const accepted = useSyncExternalStore(subscribe, isAccepted, getServerSnapshot);

  function handleAccept() {
    acceptedInMemory = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // localStorage недоступен (приватный режим) — баннер всё равно скрывается в этой вкладке
    }
    listeners.forEach((l) => l());
  }

  if (accepted) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-card)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <p className="text-sm text-[var(--color-muted)]">
          Мы используем cookies для корректной работы сайта. Продолжая пользоваться
          сайтом, вы соглашаетесь с их использованием — подробнее в{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-[var(--color-accent-ink)]"
          >
            политике конфиденциальности
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="soft-btn shrink-0 rounded-full px-6 py-2.5 text-sm font-medium"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
