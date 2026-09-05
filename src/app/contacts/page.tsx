import type { Metadata } from "next";
import { ContactInfoCard } from "@/components/contacts/ContactInfoCard";
import { ContactsVideoBackground } from "@/components/contacts/ContactsVideoBackground";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = { title: `Контакты — ${SITE.name}` };

export default function ContactsPage() {
  return (
    <div className="relative">
      <ContactsVideoBackground />

      <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
          Контакты
        </h1>

        <div className="mt-8 max-w-md">
          <ContactInfoCard />
        </div>
      </div>
    </div>
  );
}
