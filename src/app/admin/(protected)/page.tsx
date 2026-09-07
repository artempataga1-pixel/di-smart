import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentRate } from "@/lib/pricing";
import { formatDateTime } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  const [orders, rate, productCount, orderCount] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    getCurrentRate(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-[family-name:var(--font-body)] text-3xl font-semibold">Дашборд</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Текущий курс" value={rate.toFixed(2)} hint="BYN за 1 USD" />
        <StatCard label="Активных товаров" value={String(productCount)} />
        <StatCard label="Всего заказов" value={String(orderCount)} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Последние заказы</h2>
          <Link href="/admin/orders" className="text-sm text-[var(--color-accent-ink)] hover:underline">
            Все заказы →
          </Link>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{o.phone}</td>
                  <td className="whitespace-nowrap px-4 py-3">{o.totalByn} BYN</td>
                  <td className="px-4 py-3">
                    {o.telegramSentAt ? (
                      <span className="text-[var(--color-success)]">доставлено</span>
                    ) : (
                      <span className="text-[var(--color-warning)]">не доставлено</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">
                    Заказов пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
