"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorRedirectUrl, parsePositiveDecimalField } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

const PATH = "/admin/settings";

/** Курс — append-only (задача 24/57): каждое изменение создаёт новую запись,
 * после чего кеш витрины сбрасывается немедленно. */
export async function updateExchangeRateAction(formData: FormData) {
  await requireAdminSession();
  const rate = parsePositiveDecimalField(formData.get("usdToByn"));

  if (rate === null || rate <= 0) {
    redirect(errorRedirectUrl(PATH, "Курс должен быть положительным числом"));
  }

  await prisma.exchangeRate.create({ data: { usdToByn: rate!, setBy: "admin" } });

  revalidateTag("storefront-pricing", { expire: 0 });
  revalidateTag("storefront-catalog", { expire: 0 });
  revalidatePath(PATH);
  redirect(PATH);
}
