import { ShoppingBag, Wrench, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import type { ServiceItem, TrustBadgeItem } from "@/types/content";

export const SERVICES: ServiceItem[] = [
  {
    icon: Wrench,
    title: "Ремонт и обслуживание",
    description:
      "Профессиональный ремонт техники любой сложности — от замены экрана до диагностики платы.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Консультации по выбору",
    description:
      "Поможем подобрать устройство под задачи и бюджет, настроим и перенесём данные.",
  },
  {
    icon: ShieldCheck,
    title: "Гарантийное обслуживание",
    description:
      "Гарантийная и постгарантийная поддержка — следим за техникой и после покупки.",
  },
];

export const TRUST_BADGES: TrustBadgeItem[] = [
  {
    icon: ShieldCheck,
    title: "Официальная гарантия",
    description: "На всю технику в магазине",
  },
  {
    icon: Wrench,
    title: "Сервисный центр",
    description: "Ремонт и диагностика на месте",
  },
  {
    icon: MessageCircleQuestion,
    title: "Экспертная консультация",
    description: "Поможем подобрать и настроить",
  },
  {
    icon: ShoppingBag,
    title: "Мультибренд",
    description: "Apple, Samsung и Dyson в одном месте",
  },
];
