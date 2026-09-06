import { prisma } from "@/lib/prisma";

/** Курс всегда читается заново — ни кеша, ни ISR: изменение курса в админке
 * должно немедленно отразиться на витрине (ТЗ, п.11), это прямое требование
 * заказчика, не наша инициатива. */
export async function getCurrentRate(): Promise<number> {
  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { setAt: "desc" },
  });
  if (!latest) {
    throw new Error("Курс валют не задан — прогони сиды (prisma db seed)");
  }
  return latest.usdToByn.toNumber();
}

/** Округление итоговой суммы — до целых BYN (бизнес-решение, см. план). */
export function usdToByn(usd: number, rate: number): number {
  return Math.round(usd * rate);
}
