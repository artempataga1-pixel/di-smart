import type { Metadata } from "next";
import { ContactInfoCard } from "@/components/contacts/ContactInfoCard";
import { MapEmbed } from "@/components/contacts/MapEmbed";
import { ContactsVideoBackground } from "@/components/contacts/ContactsVideoBackground";

export const metadata: Metadata = { title: "Контакты — ЛУНА" };

export default function ContactsPage() {
  return (
    <div className="relative">
      <ContactsVideoBackground />

      <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
          Контакты
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <ContactInfoCard />
          <MapEmbed />
        </div>
      </div>
    </div>
  );
}
