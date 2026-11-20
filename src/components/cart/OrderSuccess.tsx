import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function OrderSuccess({ orderId, telegramConfigured = true }: { orderId: string; telegramConfigured?: boolean }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
        <CheckCircle2 className="size-8 text-[var(--color-accent-ink)]" />
      </div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
        {telegramConfigured ? "Заявка отправлена" : "Тестовая заявка сохранена"}
      </h1>
      <p className="break-words text-[var(--color-muted)]">
        Номер заявки {orderId}. {telegramConfigured
          ? "Уведомление отправлено менеджеру; он свяжется с вами для подтверждения."
          : "Уведомления в Telegram пока не настроены. Заявка доступна в админке."}
      </p>
      <Link
        href="/catalog"
        className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-dark)]"
      >
        Вернуться в каталог
      </Link>
    </div>
  );
}
