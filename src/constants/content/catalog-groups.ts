export const ACCESSORY_CATEGORIES = ["chargers", "cables", "cases", "stylus"];
const category = (slug: string, name: string, brand?: string) => ({ slug, name, href: `/catalog/${slug}${brand ? `?brand=${brand}` : ""}` });
export const CATALOG_GROUPS = [
  { slug: "apple", name: "Apple", href: "/catalog?brand=apple", categories: [category("iphone", "iPhone", "apple"), category("ipad", "iPad", "apple"), category("macbook", "MacBook", "apple"), category("watch", "Apple Watch", "apple"), category("airpods", "AirPods", "apple"), category("apple-devices", "Другие устройства Apple", "apple")] },
  { slug: "samsung", name: "Samsung", href: "/catalog?brand=samsung", categories: [category("samsung-smartphones", "Смартфоны", "samsung"), category("samsung-tablets", "Планшеты", "samsung"), category("samsung-audio", "Наушники", "samsung"), category("watch", "Часы", "samsung")] },
  { slug: "accessories", name: "Аксессуары", href: "/catalog?group=accessories", categories: [category("chargers", "Зарядные устройства"), category("cables", "Кабели"), category("cases", "Чехлы"), category("stylus", "Стилусы")] },
];
