"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorRedirectUrl, parsePositiveDecimalField } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

const PATH = "/admin/settings";

/** Курс — append-only (задача 24/57): каждое изменение создаёт новую запись
 * ExchangeRate, история сохраняется. Цены на витрине пересчитываются
 * немедленно — getCurrentRate() (src/lib/pricing.ts) не кеширует, читает
 * последнюю запись по setAt на каждый рендер (ТЗ, п.11). */
export async function updateExchangeRateAction(formData: FormData) {
  await requireAdminSession();
  const rate = parsePositiveDecimalField(formData.get("usdToByn"));

  if (rate === null || rate <= 0) {
    redirect(errorRedirectUrl(PATH, "Курс должен быть положительным числом"));
  }

  await prisma.exchangeRate.create({ data: { usdToByn: rate!, setBy: "admin" } });

  revalidatePath(PATH);
  redirect(PATH);
}
