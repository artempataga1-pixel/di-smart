"use client";

import Script from "next/script";
import { useAnalyticsConsent } from "@/components/layout/CookieBanner";

/** Не загружаем сторонний скрипт до отдельного разрешения пользователя. */
export function YandexMetrika({ id }: { id: string | undefined }) {
  const allowed = useAnalyticsConsent();
  if (!id || !allowed) return null;

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${JSON.stringify(id)}, "init", {
            clickmap: false,
            trackLinks: false,
            accurateTrackBounce: true,
            webvisor: false
          });
        `}
    </Script>
  );
}
