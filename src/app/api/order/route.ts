import { NextRequest, NextResponse } from "next/server";

// Демо-приём заказа: только логирование на сервере, без секретов и внешних
// интеграций. Для продакшна — заменить на Telegram/CRM.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const orderId = `DISMART-${Date.now()}`;
  console.log(
    "[di-smart-demo][order]",
    JSON.stringify({ ...body, orderId, ts: new Date().toISOString() })
  );

  return NextResponse.json({ ok: true, orderId });
}
