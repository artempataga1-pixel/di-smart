import type { MediaAsset } from "@/components/ui/MediaFrame";

export const media: Record<string, MediaAsset> = {
  heroPoster: { id: "heroPoster", alt: "Samsung Galaxy S25 Ultra, титановый корпус", tone: "titanium" },
  designBlack: { id: "designBlack", alt: "Galaxy S25 Ultra, цвет Чёрный", tone: "black" },
  designTitanium: { id: "designTitanium", alt: "Galaxy S25 Ultra, цвет Титан", tone: "titanium" },
  designBlue: { id: "designBlue", alt: "Galaxy S25 Ultra, цвет Синий", tone: "blue" },
  sPenWriting: { id: "sPenWriting", alt: "S Pen — заметки и рисунки на Galaxy S25 Ultra", tone: "titanium" },
  cameraNight: { id: "cameraNight", alt: "Ночная съёмка на камеру 200 Мп", tone: "blue" },
  performanceGaming: { id: "performanceGaming", alt: "Игры на Snapdragon 8 Elite for Galaxy", tone: "black" },
  batteryLife: { id: "batteryLife", alt: "Автономность 5000 мАч", tone: "blue" },
  galaxyAiEdit: { id: "galaxyAiEdit", alt: "Galaxy AI — Generative Edit и Circle to Search", tone: "titanium" },
  promo: { id: "promo", alt: "", tone: "blue" },
};
