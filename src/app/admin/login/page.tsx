"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/session-actions";

const initialState: LoginState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8"
      >
        <h1 className="mb-1 font-[family-name:var(--font-heading)] text-xl font-semibold">
          Di-SMART Admin
        </h1>
        <p className="mb-6 text-sm text-[var(--color-muted)]">Вход в панель управления</p>

        <label className="mb-3 flex flex-col gap-1.5 text-sm">
          Логин
          <input
            name="login"
            required
            autoComplete="username"
            className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="mb-4 flex flex-col gap-1.5 text-sm">
          Пароль
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {state.error && (
          <p className="mb-4 text-xs text-[var(--color-warning)]" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)] disabled:opacity-60"
        >
          {pending ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
