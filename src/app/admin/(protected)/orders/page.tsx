import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Заказы — Di-SMART Admin" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Заказы</h1>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Имя</th>
              <th className="px-4 py-3 font-medium">Телефон</th>
              <th className="px-4 py-3 font-medium">Позиций</th>
              <th className="px-4 py-3 font-medium">Сумма</th>
              <th className="px-4 py-3 font-medium">Telegram</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--color-line)] last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="whitespace-nowrap font-medium hover:text-[var(--color-accent-ink)] hover:underline"
                  >
                    {formatDateTime(order.createdAt)}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.name}</td>
                <td className="whitespace-nowrap px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3">{order._count.items}</td>
                <td className="whitespace-nowrap px-4 py-3">{order.totalByn} BYN</td>
                <td className="px-4 py-3">
                  {order.telegramSentAt ? (
                    <span className="text-[var(--color-success)]">доставлено</span>
                  ) : (
                    <span className="text-[var(--color-warning)]">не доставлено</span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[var(--color-muted)]">
                  Заказов пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
