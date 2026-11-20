"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// Новая редакция уведомления требует нового осознанного выбора.
const STORAGE_KEY = "di-smart-analytics-consent-v3";
type AnalyticsChoice = "accepted" | "rejected" | null;

/* Выбор хранится в localStorage и синхронизируется между вкладками. На сервере
 * статус неизвестен, поэтому аналитика не попадает в HTML до гидратации. */
const listeners = new Set<() => void>();
let choiceInMemory: AnalyticsChoice = null;

function getChoice(): AnalyticsChoice {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted" || saved === "rejected") return saved;
  } catch {
    // При недоступном localStorage выбор действует только в текущей вкладке.
  }
  return choiceInMemory;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      choiceInMemory = null;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): AnalyticsChoice {
  return null;
}

function saveChoice(choice: AnalyticsChoice) {
  choiceInMemory = choice;
  try {
    window.localStorage.removeItem("di-smart-analytics-consent-v1");
    window.localStorage.removeItem("di-smart-analytics-consent-v2");
    if (choice) window.localStorage.setItem(STORAGE_KEY, choice);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // При недоступном localStorage выбор сохраняется до закрытия вкладки.
  }
  listeners.forEach((listener) => listener());
}

export function useAnalyticsConsent(): boolean {
  return useSyncExternalStore(subscribe, getChoice, getServerSnapshot) === "accepted";
}

export function CookiePreferencesButton() {
  function openSettings() {
    const analyticsWasLoaded = getChoice() === "accepted";
    saveChoice(null);
    // Уже загруженный сторонний скрипт нельзя надёжно «выгрузить» из страницы.
    if (analyticsWasLoaded) window.location.reload();
  }
  return <button type="button" onClick={openSettings} className="text-left underline underline-offset-2 hover:text-[var(--color-accent)]">Настройки аналитики</button>;
}

export function CookieBanner() {
  const choice = useSyncExternalStore(subscribe, getChoice, getServerSnapshot);

  if (choice) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 max-h-[70dvh] overflow-y-auto border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-card)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
        <p className="text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
          Корзина и ваш выбор хранятся в браузере. Яндекс.Метрика загрузится только
          с отдельного разрешения и может использовать cookies для анализа посещений.
          На странице доставки отдельно загружается Яндекс Карта. Подробнее —{" "}
          <Link
            href="/cookies"
            className="underline underline-offset-2 hover:text-[var(--color-accent-ink)]"
          >
            правилах cookies
          </Link>
          .
        </p>
        <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
          <button type="button" onClick={() => saveChoice("rejected")} className="soft-btn min-h-11 rounded-full px-2 py-2 text-xs font-medium leading-tight sm:px-4 sm:text-sm md:px-6">Без аналитики</button>
          <button type="button" onClick={() => saveChoice("accepted")} className="soft-btn min-h-11 rounded-full px-2 py-2 text-xs font-medium leading-tight sm:px-4 sm:text-sm md:px-6">Разрешить аналитику</button>
        </div>
      </div>
    </div>
  );
}
