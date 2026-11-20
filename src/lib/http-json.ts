/** Ограничение применяется к потоку, в том числе без Content-Length. */
export class RequestBodyError extends Error {
  constructor(public code: string, public status: number) { super(code); }
}

export async function readJsonObject(request: Request, maxBytes = 16 * 1024): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new RequestBodyError("invalid_content_type", 415);
  }
  if (Number(request.headers.get("content-length")) > maxBytes) {
    throw new RequestBodyError("body_too_large", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("invalid_json", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new RequestBodyError("request_timeout", 408)), 10_000);
  });
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), timeout]);
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new RequestBodyError("body_too_large", 413);
      chunks.push(value);
    }
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid object");
    return value as Record<string, unknown>;
  } catch (error) {
    void reader.cancel().catch(() => {});
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError("invalid_json", 400);
  } finally {
    clearTimeout(timer);
  }
}
