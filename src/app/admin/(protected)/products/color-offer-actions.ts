"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorRedirectUrl, parseOptionalBynPrice } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

/** Опциональные overrides: пустая строка удаляет запись и возвращает наследование. */
export async function saveColorOfferAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const colorValueId = String(formData.get("colorValueId") ?? "");
  const variantId = String(formData.get("variantId") ?? "") || null;
  const priceByn = parseOptionalBynPrice(formData.get("priceByn"));
  const availabilityRaw = formData.get("availability");
  const availability = availabilityRaw === "IN_STOCK" || availabilityRaw === "OUT_OF_STOCK"
    ? availabilityRaw : null;
  const back = `/admin/products/${productId}#colors`;

  if (!productId || !colorValueId || priceByn === undefined) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Проверьте цену цвета в BYN") + "#colors");
  }

  // Нельзя записать цену к SKU или цвету другого товара, даже если подменили форму.
  const [color, variant] = await Promise.all([
    prisma.productColorValue.findFirst({ where: { id: colorValueId, productId }, select: { id: true } }),
    variantId ? prisma.productVariant.findFirst({ where: { id: variantId, productId }, select: { id: true } }) : Promise.resolve(null),
  ]);
  if (!color || (variantId && !variant)) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Цвет или конфигурация не принадлежат этому товару") + "#colors");
  }

  const existing = await prisma.productColorOffer.findFirst({
    where: { colorValueId, variantId },
    select: { id: true },
  });
  if (priceByn === null && availability === null) {
    if (existing) await prisma.productColorOffer.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.productColorOffer.update({ where: { id: existing.id }, data: { priceByn, availability } });
  } else {
    await prisma.productColorOffer.create({ data: { colorValueId, variantId, priceByn, availability } });
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidateTag("storefront-catalog", { expire: 0 });
  redirect(back);
}
