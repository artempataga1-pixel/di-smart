import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import type { TelegramDeliveryLog } from "@/lib/telegram";

export const metadata: Metadata = { title: "Заказ — Di-SMART Admin" };

function parseDeliveryLog(value: unknown): TelegramDeliveryLog | null {
  if (
    value &&
    typeof value === "object" &&
    "results" in value &&
    Array.isArray((value as { results: unknown }).results)
  ) {
    return value as TelegramDeliveryLog;
  }
  return null;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const log = parseDeliveryLog(order.telegramDeliveryLog);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-body)] text-2xl font-semibold">
          Заказ от {formatDateTime(order.createdAt)}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">ID: {order.id}</p>
      </div>

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Имя</p>
          <p>{order.name}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">Телефон</p>
          <p>
            <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
              {order.phone}
            </a>
          </p>
        </div>
        {order.comment && (
          <div className="sm:col-span-2">
            <p className="text-xs text-[var(--color-muted)]">Комментарий</p>
            <p>{order.comment}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-[var(--color-muted)]">Сумма</p>
          <p className="font-medium">{order.totalByn} BYN</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">Курс на момент заказа</p>
          <p>{order.exchangeRateUsed.toString()} BYN</p>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-3 text-lg font-medium">Состав заказа</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
              <th className="py-2 pr-3 font-medium">Товар</th>
              <th className="py-2 pr-3 font-medium">Конфигурация</th>
              <th className="py-2 pr-3 font-medium">Цена</th>
              <th className="py-2 font-medium">Кол-во</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-line)] last:border-0">
                <td className="py-2 pr-3">{item.productNameSnapshot}</td>
                <td className="py-2 pr-3 text-[var(--color-muted)]">
                  {[item.variantLabelSnapshot, item.colorLabelSnapshot].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="whitespace-nowrap py-2 pr-3">{item.priceBynSnapshot} BYN</td>
                <td className="py-2">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-3 text-lg font-medium">Доставка в Telegram</h2>
        {!log ? (
          <p className="text-sm text-[var(--color-muted)]">Отправка ещё не выполнялась</p>
        ) : !log.chatIdsConfigured ? (
          <p className="text-sm text-[var(--color-muted)]">Telegram-интеграция не настроена (нет токена/получателей)</p>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-[var(--color-muted)]">
              Попытка: {formatDateTime(new Date(log.attemptAt))} · доставлено {log.deliveredCount} из{" "}
              {log.chatIdsCount}
            </p>
            <ul className="flex flex-col gap-1">
              {log.results.map((r) => (
                <li key={r.chatId} className="flex items-center gap-2">
                  <span className="text-[var(--color-muted)]">{r.chatId}</span>
                  {r.delivered ? (
                    <span className="text-[var(--color-success)]">доставлено</span>
                  ) : (
                    <span className="text-[var(--color-warning)]">
                      ошибка{r.errorDescription ? `: ${r.errorDescription}` : r.errorMessage ? `: ${r.errorMessage}` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
