"use client";

export function ImageFileInput({ className }: { className?: string }) {
  return <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required className={className}
    onChange={event => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      input.setCustomValidity(file && file.size > 8 * 1024 * 1024 ? "Фото слишком большое. Выберите файл до 8 МБ." : "");
      input.reportValidity();
    }} />;
}
