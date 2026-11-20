import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness без запросов к БД: проверка процесса, не готовности каталога. */
export function GET() {
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
