"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isForeignKeyConstraintError, isUniqueConstraintError } from "@/lib/admin/errors";
import { errorRedirectUrl, isValidSlug, parseIntField } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

const PATH = "/admin/categories";

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createCategoryAction(formData: FormData) {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const brandId = String(formData.get("brandId") ?? "");
  const sortOrder = parseIntField(formData.get("sortOrder"));

  if (!name || !isValidSlug(slug) || !brandId) {
    redirect(errorRedirectUrl(PATH, "Название, slug и бренд обязательны"));
  }

  try {
    await prisma.category.create({
      data: {
        name,
        slug,
        brandId,
        sortOrder,
        seoTitle: optionalText(formData, "seoTitle"),
        seoDescription: optionalText(formData, "seoDescription"),
        h1: optionalText(formData, "h1"),
      },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(errorRedirectUrl(PATH, `Категория со slug «${slug}» уже существует`));
    }
    if (isForeignKeyConstraintError(e)) {
      redirect(errorRedirectUrl(PATH, "Выбранный бренд не найден"));
    }
    throw e;
  }

  revalidatePath(PATH);
  redirect(PATH);
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const brandId = String(formData.get("brandId") ?? "");
  const sortOrder = parseIntField(formData.get("sortOrder"));
  const isActive = formData.get("isActive") === "on";

  if (!id || !name || !isValidSlug(slug) || !brandId) {
    redirect(errorRedirectUrl(PATH, "Проверьте поля формы: название, slug и бренд обязательны"));
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        brandId,
        sortOrder,
        isActive,
        seoTitle: optionalText(formData, "seoTitle"),
        seoDescription: optionalText(formData, "seoDescription"),
        h1: optionalText(formData, "h1"),
      },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(errorRedirectUrl(PATH, `Категория со slug «${slug}» уже существует`));
    }
    if (isForeignKeyConstraintError(e)) {
      redirect(errorRedirectUrl(PATH, "Выбранный бренд не найден"));
    }
    throw e;
  }

  revalidatePath(PATH);
  redirect(PATH);
}
