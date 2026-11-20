import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Курс кешируется между запросами, чтобы каждая навигация не ждала Neon.
 * Серверное действие настроек немедленно сбрасывает тег после изменения. */
const getCurrentRateCached = unstable_cache(async (): Promise<number> => {
  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { setAt: "desc" },
    select: { usdToByn: true },
  });
  if (!latest) {
    throw new Error("Курс валют не задан — прогони сиды (prisma db seed)");
  }
  return latest.usdToByn.toNumber();
}, ["current-exchange-rate-v2"], {
  revalidate: 3600,
  tags: ["storefront-pricing"],
});

export const getCurrentRate = cache(getCurrentRateCached);

/** Историческое поведение для товаров без подтверждённой BYN-цены. */
export function usdToByn(usd: number, rate: number): number {
  return Math.round(usd * rate);
}

/** Магазин может задавать подтверждённую цену в BYN. Старые товары по-прежнему
 * рассчитываются из USD; выбор цены одинаков для витрины и оформления заказа. */
export function resolveBynPrice(exactByn: { toNumber(): number } | null, usd: number, rate: number): number {
  return exactByn?.toNumber() ?? usdToByn(usd, rate);
}

export function roundByn(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
