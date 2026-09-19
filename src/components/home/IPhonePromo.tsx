import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function IPhonePromo() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6" aria-labelledby="iphone-promo-title">
      <Link href="/iphone-18-pro" className="group grid overflow-hidden rounded-[var(--radius-xl)] bg-black text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-ink)] md:grid-cols-[.8fr_1.2fr]">
        <div className="flex flex-col items-start justify-center p-8 md:py-12 lg:p-12">
          <h2 id="iphone-promo-title" className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight lg:text-4xl">iPhone 18 Pro</h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-[#c9bbb5]">Рассмотрите дизайн, камеры и возможности нового Pro.</p>
          <span className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors group-hover:bg-[#e6b8a8]">Познакомиться ближе <ArrowRight size={17} aria-hidden="true" /></span>
        </div>
        <div className="relative aspect-video self-center">
          <Image src="/media/iphone-18-pro/intro-end.jpg" alt="" fill sizes="(min-width: 1280px) 730px, (min-width: 768px) 60vw, 100vw" className="object-contain" />
        </div>
      </Link>
    </section>
  );
}
