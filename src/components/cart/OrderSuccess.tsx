import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SITE } from "@/constants/content/site";
import { SocialLinks } from "@/components/ui/SocialLinks";

export function OrderSuccess({ orderId, telegramConfigured = true }: { orderId: string; telegramConfigured?: boolean }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
        <CheckCircle2 className="size-8 text-[var(--color-accent-ink)]" />
      </div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
        {telegramConfigured ? "Заявка принята" : "Тестовая заявка сохранена"}
      </h1>
      <p className="break-words text-lg font-medium tabular-nums text-[var(--color-text)]">№ {orderId}</p>
      <p className="break-words text-[var(--color-muted)]">
        {telegramConfigured
          ? `Менеджер позвонит вам, чтобы подтвердить наличие, цену и доставку. Звоним ${SITE.managerHours}; заявки, оставленные ночью, обрабатываем утром.`
          : "Уведомления в Telegram пока не настроены. Заявка доступна в админке."}
      </p>

      {telegramConfigured && (
        <div className="mt-2 w-full">
          <p className="mb-3 text-sm text-[var(--color-muted)]">Не хотите ждать звонка? Напишите нам — номер заявки уже в сообщении.</p>
          <SocialLinks singleRow message={`Здравствуйте! Оставил(а) заявку ${orderId} на сайте ${SITE.name}.`} />
        </div>
      )}

      <Link
        href="/catalog"
        className="mt-2 rounded-[var(--radius-sm)] border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]"
      >
        Вернуться в каталог
      </Link>
    </div>
  );
}
