import type { Metadata } from "next";
import { LoginForm } from "@/components/account/LoginForm";

export const metadata: Metadata = { title: "Личный кабинет — ЛУНА" };

export default function AccountPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 md:px-6">
      <LoginForm />
    </div>
  );
}
