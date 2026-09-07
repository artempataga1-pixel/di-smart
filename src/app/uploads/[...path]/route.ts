import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";

/** Раздаёт файлы из `public/uploads/**` через динамический роут, а не через
 * штатную статическую отдачу `public/`.
 *
 * В production/standalone-режиме Next.js один раз сканирует `public/` при
 * старте процесса (`setupFsCheck` в `next/dist/server/lib/router-utils/
 * filesystem.js`) и строит статический список файлов для раздачи — файлы,
 * появившиеся в `public/uploads/**` ПОСЛЕ старта (а это все фото, которые
 * админ когда-либо загрузит через форму — задача 56, `image-actions.ts`),
 * в этот список не попадают и штатная раздача отвечает кастомной 404-страницей,
 * несмотря на то что файл реально лежит на диске (в примонтированном Docker
 * volume `uploads`). Найдено вживую при первой полной проверке `docker
 * compose up --build` после появления реальной загрузки фото (задача 66) —
 * `npm run dev` эту проблему не проявляет (там `public/` читается заново на
 * каждый запрос), поэтому раньше никто её не видел.
 *
 * Route Handler не подвержен той же проблеме — он резолвится динамически на
 * каждый запрос, поэтому и обычный `<img src="/uploads/...">` (админка), и
 * `next/image` (витрина — `next/image` для локальных путей проксирует запрос
 * через тот же внутренний обработчик маршрутов, `fetchInternalImage`, поэтому
 * без этого файла падал бы и он) снова начинают видеть свежезагруженные фото
 * без перезапуска контейнера. */

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (segments.some((segment) => segment.includes("..") || segment.includes("\0"))) {
    return new NextResponse(null, { status: 400 });
  }

  const filePath = path.join(UPLOADS_ROOT, ...segments);
  // Второй, независимый от проверки сегментов барьер против выхода за
  // пределы UPLOADS_ROOT — на случай неочевидного обхода регэкспа выше.
  if (!filePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      return new NextResponse(null, { status: 404 });
    }
    const buffer = await readFile(filePath);
    const contentType = CONTENT_TYPE_BY_EXT[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
