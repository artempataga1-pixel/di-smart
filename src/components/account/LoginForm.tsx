import { User, Lock } from "lucide-react";

export function LoginForm() {
  return (
    <div className="w-full rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)] md:p-10">
      <h1 className="text-center font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)]">
        Личный кабинет
      </h1>
      <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
        Демонстрационная страница — вход не требуется, чтобы посмотреть сайт
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-4 py-3 shadow-[inset_2px_4px_8px_rgba(43,26,64,0.08)]">
          <User className="size-4 shrink-0 text-[var(--color-muted)]" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Логин или e-mail"
            aria-label="Логин или e-mail"
            className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-4 py-3 shadow-[inset_2px_4px_8px_rgba(43,26,64,0.08)]">
          <Lock className="size-4 shrink-0 text-[var(--color-muted)]" />
          <input
            type="password"
            autoComplete="off"
            placeholder="Пароль"
            aria-label="Пароль"
            className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-7 flex gap-3">
        <button
          type="button"
          className="soft-btn flex-1 rounded-[var(--radius-sm)] py-3 text-sm font-medium"
        >
          Войти
        </button>
        <button
          type="button"
          className="soft-btn flex-1 rounded-[var(--radius-sm)] py-3 text-sm font-medium"
        >
          Регистрация
        </button>
      </div>

      <button
        type="button"
        className="mt-5 w-full text-center text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent-ink)]"
      >
        Забыли пароль?
      </button>
    </div>
  );
}
