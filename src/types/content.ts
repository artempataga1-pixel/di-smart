import type { CategorySlug, ProductIconKey } from "./product";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export interface CategoryContent {
  slug: CategorySlug;
  title: string;
  singular: string;
  description: string;
  icon: ProductIconKey;
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
