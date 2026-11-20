import sharp from "sharp";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const formats: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif" };

/** Проверяем фактический формат, а сохраняем исходные байты без ресайза
 * и повторного lossy-кодирования. SVG/анимация не принимаются. */
export async function validateImageUpload(buffer: Buffer): Promise<string> {
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error("Допустимый размер фото — до 8 МБ.");
  const decoder = sharp(buffer, { limitInputPixels: 40_000_000, failOn: "warning" });
  const metadata = await decoder.metadata();
  const extension = metadata.format === "heif" && metadata.compression === "av1" ? "avif" : formats[metadata.format ?? ""];
  if (!extension || (metadata.pages ?? 1) > 1) throw new Error("Выберите обычное фото JPEG, PNG, WebP или AVIF.");
  // Полное декодирование обнаруживает усечённые файлы до публикации.
  await decoder.stats();
  return extension;
}
