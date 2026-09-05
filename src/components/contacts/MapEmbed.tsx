"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { SITE } from "@/constants/content/site";

export function MapEmbed() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] text-center">
        <MapPin className="size-6 text-[var(--color-muted)]" />
        <p className="text-sm text-[var(--color-muted)]">{SITE.address}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
      <iframe
        title="Карта — ЛУНА"
        src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(SITE.mapQuery)}`}
        width="100%"
        height="380"
        className="border-0"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
