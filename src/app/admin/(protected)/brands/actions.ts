"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUniqueConstraintError } from "@/lib/admin/errors";
import { errorRedirectUrl, isValidSlug, parseIntField } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

const PATH = "/admin/brands";

export async function createBrandAction(formData: FormData) {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const sortOrder = parseIntField(formData.get("sortOrder"));

  if (!name || !isValidSlug(slug)) {
    redirect(errorRedirectUrl(PATH, "Название обязательно, slug — латиница/цифры/дефисы"));
  }

  try {
    await prisma.brand.create({ data: { name, slug, sortOrder } });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(errorRedirectUrl(PATH, `Бренд со slug «${slug}» уже существует`));
    }
    throw e;
  }

  revalidatePath(PATH);
  redirect(PATH);
}

export async function updateBrandAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const sortOrder = parseIntField(formData.get("sortOrder"));
  const isActive = formData.get("isActive") === "on";

  if (!id || !name || !isValidSlug(slug)) {
    redirect(errorRedirectUrl(PATH, "Проверьте поля формы: название и slug обязательны"));
  }

  try {
    await prisma.brand.update({ where: { id }, data: { name, slug, sortOrder, isActive } });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(errorRedirectUrl(PATH, `Бренд со slug «${slug}» уже существует`));
    }
    throw e;
  }

  revalidatePath(PATH);
  redirect(PATH);
}
