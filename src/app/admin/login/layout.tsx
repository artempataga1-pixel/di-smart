import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход — Di-SMART Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <div className="admin-theme">{children}</div>;
}
