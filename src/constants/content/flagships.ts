/** Editorial campaigns, separate from purchasable inventory. Verified 2026-09-16.
 * This registry supplies both homepage previews and the new campaign pages.
 */
export interface FlagshipCampaign {
  slug: string;
  name: string;
  subtitle: string;
  href: string;
  image: string;
  /** Отдельный кадр для компактного флагманского блока страницы категории. */
  catalogImage?: string;
  width: number;
  height: number;
  category?: string;
  categoryName?: string;
  description?: string;
  features?: { title: string; text: string }[];
  source?: string;
}

export const flagshipCampaigns: FlagshipCampaign[] = [
  { name: "iPhone 18 Pro", subtitle: "Искусство быть Pro.", slug: "iphone-18-pro", href: "/iphone-18-pro", category: "iphone", categoryName: "iPhone", width: 1280, height: 720, image: "/media/iphone-18-pro/intro-end.jpg" },
  { name: "Samsung Galaxy S26 Ultra", subtitle: "Galaxy AI. Больше, чем вы представляли.", slug: "galaxy-s26-ultra", href: "/galaxy-s26-ultra", category: "samsung-smartphones", categoryName: "Samsung", width: 1470, height: 630, image: "/media/galaxy-s26-ultra/video/poster-wide.webp" },
  {
    slug: "ipad-pro-m5", name: "iPad Pro 13″ · M5", href: "/ipad-pro-m5", category: "ipad", categoryName: "iPad",
    subtitle: "Большие идеи. Одно касание.", image: "/media/ipad-pro-m5/hero-preview.webp", width: 1470, height: 630,
    description: "Старший iPad Pro с чипом M5 и дисплеем Ultra Retina XDR — для рисунка, монтажа и работы с несколькими приложениями.",
    features: [{ title: "M5", text: "Чип для творческих приложений и сложных задач." }, { title: "Ultra Retina XDR", text: "13-дюймовый дисплей для работы с изображением." }, { title: "Apple Pencil Pro", text: "Поддержка пера для точного рисования и заметок. Приобретается отдельно." }],
    source: "https://www.apple.com/ipad-pro/",
  },
  {
    slug: "macbook-pro-16-m5-max", name: "MacBook Pro 16″ · M5 Max", href: "/macbook-pro-16-m5-max", category: "macbook", categoryName: "MacBook",
    subtitle: "Большие проекты. Без мелкого шрифта.", image: "/media/macbook-pro-m5-max/hero-preview.webp", width: 1470, height: 630,
    description: "16-дюймовый MacBook Pro с M5 Max, Liquid Retina XDR и памятью до 128 ГБ — для профессионального видео, 3D, разработки и локальных AI-задач.",
    features: [{ title: "M5 Max", text: "До 18 ядер CPU, 40 ядер GPU и 614 ГБ/с пропускной способности памяти." }, { title: "Liquid Retina XDR", text: "16,2 дюйма, до 1600 нит в HDR и ProMotion до 120 Гц." }, { title: "До 22 часов", text: "Автономность воспроизведения видео в конфигурации M5 Max." }],
    source: "https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/",
  },
  {
    slug: "apple-watch-ultra-4", name: "Apple Watch Ultra 4", href: "/apple-watch-ultra-4", category: "watch", categoryName: "Apple Watch",
    subtitle: "Для тех, кто идёт дальше.", image: "/media/apple-watch-ultra-4/hero-poster.webp", catalogImage: "/media/catalog/products/apple-watch-ultra-4.webp", width: 1470, height: 630,
    description: "Флагманская линейка Apple Watch для спорта и активного отдыха. Ultra 4 представлена в сентябре 2026 года.",
    features: [{ title: "Ultra", text: "Старшая серия часов Apple с акцентом на спорт и приключения." }, { title: "Тренировки", text: "Инструменты для наблюдения за активностью и прогрессом." }, { title: "Новая модель", text: "Объявленное начало продаж — 18 сентября 2026 года. Наличие в магазине уточняется отдельно." }],
    source: "https://www.apple.com/newsroom/2026/09/apple-unveils-apple-watch-ultra-4/",
  },
  {
    slug: "airpods-pro-3", name: "AirPods Pro 3", href: "/airpods-pro-3", category: "airpods", categoryName: "AirPods",
    subtitle: "Ближе к музыке.", image: "/media/airpods-pro-3/hero-poster.webp", width: 1470, height: 630,
    description: "Флагманские внутриканальные AirPods с активным шумоподавлением — для музыки, разговоров и повседневных поездок.",
    features: [{ title: "Активное шумоподавление", text: "Помогает сосредоточиться на том, что вы слушаете." }, { title: "Прозрачный режим", text: "Позволяет слышать происходящее вокруг." }, { title: "Экосистема Apple", text: "Удобная работа с совместимыми устройствами Apple." }],
    source: "https://www.apple.com/airpods-pro/",
  },
  {
    slug: "xiaomi-17-ultra", name: "Xiaomi 17 Ultra", href: "/xiaomi-17-ultra", category: "xiaomi-smartphones", categoryName: "Xiaomi",
    subtitle: "Ваш взгляд. В деталях Ultra.", image: "/media/xiaomi-17-ultra/hero-poster.webp", width: 1470, height: 630,
    description: "Флагман Xiaomi с акцентом на мобильную фотографию и систему камер Leica. Для кадров, которые хочется сохранить.",
    features: [{ title: "Leica", text: "Система камер, созданная в сотрудничестве с Leica." }, { title: "Ultra", text: "Старшая фотолинейка смартфонов Xiaomi." }, { title: "Для съёмки", text: "Дополнительный Photography Kit Pro приобретается отдельно." }],
    source: "https://www.mi.com/global/product/xiaomi-17-ultra/",
  },
  {
    slug: "xiaomi-book-pro-14", name: "Xiaomi Book Pro 14", href: "/xiaomi-book-pro-14", category: "laptops", categoryName: "Ноутбуки",
    subtitle: "Рабочий день. В лёгком формате.", image: "/media/xiaomi-book-pro-14/hero-poster.jpg", width: 1470, height: 630,
    description: "Премиальный Xiaomi Book Pro 14 выбран флагманом нашей категории ноутбуков. Компактный формат для работы и повседневных задач.",
    features: [{ title: "Pro-серия", text: "Премиальная линейка ноутбуков Xiaomi." }, { title: "14 дюймов", text: "Компактный формат для работы дома и в дороге." }, { title: "Конфигурации", text: "Процессор, память и раскладку клавиатуры уточним при добавлении товаров." }],
    source: "https://www.mi.com/prod/xiaomi-book-pro-14",
  },
  {
    slug: "galaxy-tab-s11-ultra", name: "Samsung Galaxy Tab S11 Ultra", href: "/galaxy-tab-s11-ultra", category: "samsung-tablets", categoryName: "Планшеты Samsung",
    subtitle: "Больше пространства для идей.", image: "/media/galaxy-tab-s11-ultra/hero-poster.jpg", width: 1470, height: 630,
    description: "Старший планшет Samsung с 14,6-дюймовым экраном, S Pen и режимом DeX для многозадачной работы.",
    features: [{ title: "14,6 дюйма", text: "Большой дисплей для просмотра, рисования и рабочих окон." }, { title: "S Pen", text: "Перо для заметок, набросков и точного управления." }, { title: "Samsung DeX", text: "Режим многозадачности с интерфейсом рабочего стола." }],
    source: "https://www.samsung.com/us/tablets/galaxy-tab-s11/",
  },
];
