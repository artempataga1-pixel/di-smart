"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { errorRedirectUrl } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

const MAX_IMAGES_PER_PRODUCT = 10;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
/** productId приходит из скрытого поля формы, не из проверенного маршрута —
 * без этой проверки значение вроде "../../../../etc" ушло бы прямиком в
 * `path.join` ниже и позволило бы записать файл вне uploads/products/. */
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function photosPath(productId: string): string {
  return `/admin/products/${productId}#photos`;
}

function productUploadDir(productId: string): string {
  return path.join(process.cwd(), "public", "uploads", "products", productId);
}

export async function uploadProductImageAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const colorValueIdRaw = String(formData.get("colorValueId") ?? "") || null;
  const file = formData.get("file");

  if (!productId || !SAFE_ID_PATTERN.test(productId)) {
    redirect(errorRedirectUrl("/admin/products", "Некорректный товар"));
  }
  const productExists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!productExists) {
    redirect(errorRedirectUrl("/admin/products", "Товар не найден"));
  }

  // Целостность: привязка к цвету допускается только если этот цвет реально
  // принадлежит именно этому товару — иначе фото могло бы оказаться
  // привязанным к чужому ProductColorValue по угаданному/подменённому id.
  let colorValueId: string | null = null;
  if (colorValueIdRaw) {
    const colorBelongsToProduct = await prisma.productColorValue.findFirst({
      where: { id: colorValueIdRaw, productId },
      select: { id: true },
    });
    colorValueId = colorBelongsToProduct?.id ?? null;
  }

  if (!(file instanceof File) || file.size === 0) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Выберите файл изображения") + "#photos");
  }
  const image = file as File;
  if (image.size > MAX_FILE_SIZE_BYTES) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Файл слишком большой (максимум 8 МБ)") + "#photos");
  }
  if (!image.type.startsWith("image/")) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Можно загружать только изображения") + "#photos");
  }

  const existingCount = await prisma.productImage.count({ where: { productId } });
  if (existingCount >= MAX_IMAGES_PER_PRODUCT) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, `Не больше ${MAX_IMAGES_PER_PRODUCT} фото на товар`) + "#photos");
  }

  const dir = productUploadDir(productId);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await image.arrayBuffer());
  const filename = `${randomUUID()}.webp`;
  await sharp(buffer)
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(dir, filename));

  await prisma.productImage.create({
    data: {
      productId,
      url: `/uploads/products/${productId}/${filename}`,
      colorValueId,
      isMain: existingCount === 0,
      sortOrder: existingCount,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  redirect(photosPath(productId));
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");

  const image = id ? await prisma.productImage.findUnique({ where: { id } }) : null;
  if (image) {
    await prisma.productImage.delete({ where: { id } });
    try {
      await unlink(path.join(process.cwd(), "public", image.url));
    } catch (e) {
      console.error("[admin] failed to unlink product image file", e);
    }
    if (image.isMain) {
      const next = await prisma.productImage.findFirst({ where: { productId }, orderBy: { sortOrder: "asc" } });
      if (next) await prisma.productImage.update({ where: { id: next.id }, data: { isMain: true } });
    }
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(photosPath(productId));
}

export async function setMainProductImageAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");

  if (id) {
    await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId }, data: { isMain: false } }),
      prisma.productImage.update({ where: { id }, data: { isMain: true } }),
    ]);
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(photosPath(productId));
}
