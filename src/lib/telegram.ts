export interface TelegramDeliveryLogEntry {
  chatId: string;
  delivered: boolean;
  telegramMessageId?: number;
  httpStatus?: number;
  errorCode?: number;
  errorDescription?: string;
  errorMessage?: string;
}

export interface TelegramDeliveryLog {
  attemptAt: string;
  chatIdsConfigured: boolean;
  chatIdsCount: number;
  deliveredCount: number;
  results: TelegramDeliveryLogEntry[];
}

export interface OrderMessageItemInput {
  productNameSnapshot: string;
  colorLabelSnapshot: string | null;
  variantLabelSnapshot: string | null;
  priceBynSnapshot: number;
  quantity: number;
}

export interface OrderMessageInput {
  name: string;
  phone: string;
  comment: string | null;
  items: OrderMessageItemInput[];
  totalByn: number;
  createdAt: Date;
}

class TelegramSendError extends Error {
  httpStatus?: number;
  errorCode?: number;
  errorDescription?: string;

  constructor(message: string, opts: { httpStatus?: number; errorCode?: number; errorDescription?: string } = {}) {
    super(message);
    this.name = "TelegramSendError";
    this.httpStatus = opts.httpStatus;
    this.errorCode = opts.errorCode;
    this.errorDescription = opts.errorDescription;
  }
}

/** Экранирование под parse_mode: "HTML" — Telegram парсит &, <, > как разметку,
 * если их не экранировать, sendMessage целиком вернёт ошибку на любом имени/
 * комментарии с этими символами. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatOrderItemLine(item: OrderMessageItemInput, index: number): string {
  const parts: string[] = [escapeHtml(item.productNameSnapshot), "—"];
  const details: string[] = [];
  if (item.colorLabelSnapshot) details.push(`Цвет: ${escapeHtml(item.colorLabelSnapshot)}`);
  if (item.variantLabelSnapshot) details.push(escapeHtml(item.variantLabelSnapshot));
  if (details.length) parts.push(details.join(" "), "—");
  parts.push(`Цена: ${item.priceBynSnapshot} BYN`);
  const line = `${index + 1}. ${parts.join(" ")}`;
  return item.quantity > 1 ? `${line} × ${item.quantity}` : line;
}

/** Формат — по примеру из ТЗ (раздел 10), телефон — кликабельная ссылка
 * tel: через HTML-разметку (parse_mode: "HTML" в sendMessage). */
export function formatOrderMessage(input: OrderMessageInput): string {
  const phoneDigits = input.phone.replace(/[^\d+]/g, "");
  const contactLines = [
    `Имя: ${escapeHtml(input.name)}`,
    `Телефон: <a href="tel:${phoneDigits}">${escapeHtml(input.phone)}</a>`,
  ];
  if (input.comment) contactLines.push(`Комментарий: ${escapeHtml(input.comment)}`);

  const orderLines = ["Заказ:", ...input.items.map(formatOrderItemLine)];

  const dateFormatted = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    dateStyle: "short",
    timeStyle: "short",
  }).format(input.createdAt);

  const blocks = [
    "Новая заявка Di-SMART",
    contactLines.join("\n"),
    orderLines.join("\n"),
    `Итого: ${input.totalByn} BYN`,
    `Дата/время заявки: ${dateFormatted}`,
  ];

  return blocks.join("\n\n");
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string
): Promise<{ telegramMessageId: number }> {
  let res: Response;
  try {
    res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    throw new TelegramSendError(e instanceof Error ? e.message : "network error");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new TelegramSendError(data?.description ?? `HTTP ${res.status}`, {
      httpStatus: res.status,
      errorCode: data?.error_code,
      errorDescription: data?.description,
    });
  }
  return { telegramMessageId: data.result.message_id };
}

function parseTelegramConfig(): { token: string | undefined; chatIds: string[] } {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { token, chatIds };
}

/** Используется вызывающим кодом, чтобы отличить "интеграция не подключена"
 * от настоящего сбоя рассылки (см. broadcastOrderTelegramMessage) — важно
 * для catch-фолбэка на случай непредвиденного исключения. */
export function isTelegramConfigured(): boolean {
  const { token, chatIds } = parseTelegramConfig();
  return Boolean(token) && chatIds.length > 0;
}

/** Рассылка всем получателям параллельно через Promise.allSettled — блокировка
 * или ошибка у одного chat_id не должна прерывать отправку остальным (прямое
 * бизнес-требование, не Promise.all). Заказ считается доставленным, если
 * доставлено хотя бы одному — решает вызывающий код по deliveredCount. */
export async function broadcastOrderTelegramMessage(text: string): Promise<TelegramDeliveryLog> {
  const { token, chatIds } = parseTelegramConfig();
  const chatIdsConfigured = Boolean(token) && chatIds.length > 0;

  if (!chatIdsConfigured) {
    return {
      attemptAt: new Date().toISOString(),
      chatIdsConfigured: false,
      chatIdsCount: 0,
      deliveredCount: 0,
      results: [],
    };
  }

  const settled = await Promise.allSettled(
    chatIds.map((chatId) => sendTelegramMessage(token!, chatId, text))
  );

  const results: TelegramDeliveryLogEntry[] = settled.map((r, i) => {
    const chatId = chatIds[i];
    if (r.status === "fulfilled") {
      return { chatId, delivered: true, telegramMessageId: r.value.telegramMessageId };
    }
    const reason = r.reason;
    if (reason instanceof TelegramSendError) {
      return {
        chatId,
        delivered: false,
        httpStatus: reason.httpStatus,
        errorCode: reason.errorCode,
        errorDescription: reason.errorDescription,
      };
    }
    return { chatId, delivered: false, errorMessage: reason instanceof Error ? reason.message : String(reason) };
  });

  return {
    attemptAt: new Date().toISOString(),
    chatIdsConfigured: true,
    chatIdsCount: chatIds.length,
    deliveredCount: results.filter((r) => r.delivered).length,
    results,
  };
}
