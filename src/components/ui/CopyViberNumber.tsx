"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SITE } from "@/constants/content/site";
import { ViberIcon } from "@/components/ui/SocialIcons";

export function CopyViberNumber({ dark = false }: { dark?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyNumber() {
    const number = SITE.phoneHref.slice(4);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(number);
      } else {
        const field = document.createElement("textarea");
        field.value = number;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className={dark
      ? "flex basis-full flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm text-[var(--color-on-ink-muted)]"
      : "flex basis-full flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm text-[var(--color-muted)]"}
    >
      <span className="inline-flex items-center gap-2">
        <ViberIcon className="size-4 shrink-0" />
        Viber: <span className="select-all">{SITE.phone}</span>
      </span>
      <button
        type="button"
        onClick={copyNumber}
        aria-label="Скопировать номер для Viber"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        {status === "copied" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {status === "copied" ? "Скопировано" : "Скопировать"}
      </button>
      {status === "failed" && <span role="status" className="basis-full text-xs">Не удалось скопировать — выделите номер.</span>}
    </div>
  );
}
