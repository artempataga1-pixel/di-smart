import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentRate } from "@/lib/pricing";
import { isRawCartItem, resolveCartLines, type RawCartItem } from "@/lib/cart-resolve";
import {
  broadcastOrderTelegramMessage,
  formatOrderMessage,
  isTelegramConfigured,
  type TelegramDeliveryLog,
} from "@/lib/telegram";
import { isBelarusPhoneComplete } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MAX_CART_ITEMS = 50;

type OrderWithItems = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

function loadOrder(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { items: true } });
}

async function sendAndLogTelegram(order: OrderWithItems): Promise<TelegramDeliveryLog> {
  const text = formatOrderMessage({
    name: order.name,
    phone: order.phone,
    comment: order.comment,
    items: order.items.map((i) => ({
      productNameSnapshot: i.productNameSnapshot,
      colorLabelSnapshot: i.colorLabelSnapshot,
      variantLabelSnapshot: i.variantLabelSnapshot,
      priceBynSnapshot: i.priceBynSnapshot,
      quantity: i.quantity,
    })),
    totalByn: order.totalByn,
    createdAt: order.createdAt,
  });

  let log: TelegramDeliveryLog;
  try {
    log = await broadcastOrderTelegramMessage(text);
  } catch (e) {
    // Непредвиденное исключение (не сбой конкретного chat_id — те уже
    // перехвачены внутри broadcastOrderTelegramMessage через allSettled).
    // Важно НЕ подставлять chatIdsConfigured:false наугад — иначе реальный
    // сбой при настроенном боте выглядел бы для клиента как "интеграция не
    // подключена" и telegramResultResponse ошибочно вернул бы успех.
    console.error("[order] telegram broadcast threw unexpectedly", e);
    log = {
      attemptAt: new Date().toISOString(),
      chatIdsConfigured: isTelegramConfigured(),
      chatIdsCount: 0,
      deliveredCount: 0,
      results: [],
    };
  }

  try {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        telegramSentAt: log.deliveredCount > 0 ? new Date() : null,
        telegramDeliveryLog: JSON.parse(JSON.stringify(log)),
      },
    });
  } catch (e) {
    // Заказ уже сохранён и (возможно) уведомление доставлено — сбой записи
    // лога не должен превращаться в ошибку для клиента.
    console.error("[order] failed to persist telegram delivery log", e);
  }

  return log;
}

function telegramResultResponse(order: OrderWithItems, log: TelegramDeliveryLog) {
  if (!log.chatIdsConfigured) {
    // Бот ещё не подключён (нет токена/получателей) — это состояние "интеграция
    // не настроена", не сбой доставки. Заказ сохранён, клиент видит успех.
    return NextResponse.json({ ok: true, orderId: order.id, telegramConfigured: false });
  }
  if (log.deliveredCount > 0) {
    return NextResponse.json({ ok: true, orderId: order.id });
  }
  // Получатели заданы, но ни один не получил сообщение — заказ цел в БД,
  // но клиенту сообщаем нечестный "успех" не будем: пусть предложит повтор.
  return NextResponse.json({ ok: false, orderId: order.id, error: "telegram_delivery_failed" });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`order:${ip}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Ветка A: повторная отправка уведомления по уже сохранённому заказу
  // (после ответа telegram_delivery_failed) — без создания нового Order.
  if (typeof body.retryOrderId === "string" && body.retryOrderId) {
    const order = await loadOrder(body.retryOrderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }
    if (order.telegramSentAt) {
      return NextResponse.json({ ok: true, orderId: order.id });
    }
    const log = await sendAndLogTelegram(order);
    return telegramResultResponse(order, log);
  }

  // Honeypot — до любого обращения к БД, чтобы спам-боты не засоряли Order.
  if (typeof body.honeypot === "string" && body.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true, orderId: `DISMART-${Date.now()}` });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ ok: false, error: "invalid_name" }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? body.phone : "";
  if (!isBelarusPhoneComplete(phone)) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  }

  const commentRaw = typeof body.comment === "string" ? body.comment.trim() : "";
  if (commentRaw.length > 500) {
    return NextResponse.json({ ok: false, error: "invalid_comment" }, { status: 400 });
  }
  const comment = commentRaw.length > 0 ? commentRaw : null;

  const rawItemsInput: unknown[] = Array.isArray(body.items) ? body.items : [];
  const rawItems: RawCartItem[] = rawItemsInput.filter(isRawCartItem);
  if (rawItems.length === 0) {
    return NextResponse.json({ ok: false, error: "empty_cart" }, { status: 400 });
  }
  if (rawItems.length > MAX_CART_ITEMS) {
    return NextResponse.json({ ok: false, error: "cart_too_large" }, { status: 400 });
  }

  const rate = await getCurrentRate();
  const lines = await resolveCartLines(rawItems, rate);
  // Строка помечается OUT_OF_STOCK, если пропал именно вариант (не сам
  // товар) — resolveCartLines оставляет её в ответе для отображения в
  // корзине, но оформлять заказ на неё нельзя: между показом корзины и
  // сабмитом товар мог закончиться.
  if (lines.length === 0 || lines.some((l) => l.availability === "OUT_OF_STOCK")) {
    return NextResponse.json({ ok: false, error: "cart_items_unavailable" }, { status: 400 });
  }

  const totalByn = lines.reduce((sum, l) => sum + l.priceByn * l.quantity, 0);

  let order: OrderWithItems;
  try {
    order = await prisma.order.create({
      data: {
        name,
        phone,
        comment,
        totalByn,
        exchangeRateUsed: rate,
        items: {
          create: lines.map((l) => ({
            product: { connect: { id: l.productId } },
            variant: l.variantId ? { connect: { id: l.variantId } } : undefined,
            productNameSnapshot: l.name,
            variantLabelSnapshot: l.variantAttributePairs.length
              ? l.variantAttributePairs.map((p) => `${p.attributeName}: ${p.value}`).join(" ")
              : null,
            colorLabelSnapshot: l.colorName,
            priceUsdSnapshot: l.priceUsd,
            priceBynSnapshot: l.priceByn,
            quantity: l.quantity,
          })),
        },
      },
      include: { items: true },
    });
  } catch (e) {
    console.error("[order] failed to create order", e);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
  // Заказ уже сохранён в БД (задача 43) — всё, что ниже, не должно приводить
  // к необработанной ошибке: сбой отправки/лога не должен "терять" заказ
  // из вида клиента.

  const log = await sendAndLogTelegram(order);
  return telegramResultResponse(order, log);
}
