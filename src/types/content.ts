import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface TrustBadgeItem {
  icon: LucideIcon;
  title: string;
  description: string;
}
