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
  { name: "Samsung Galaxy S26 Ultra", subtitle: "Galaxy AI и S Pen встроены — почерк переводится в текст, пока вы просто пишете.", slug: "galaxy-s26-ultra", href: "/galaxy-s26-ultra", category: "samsung-smartphones", categoryName: "Samsung", width: 1470, height: 630, image: "/media/galaxy-s26-ultra/video/poster-wide.webp" },
  {
    slug: "ipad-pro-m5", name: "iPad Pro 13″ · M5", href: "/ipad-pro-m5", category: "ipad", categoryName: "iPad",
    subtitle: "Большие идеи. Одно касание.", image: "/media/ipad-pro-m5/hero-preview.webp", width: 1470, height: 630,
    description: "Старший iPad Pro с чипом M5 и дисплеем Ultra Retina XDR — для рисунка, монтажа и работы в нескольких приложениях сразу.",
    features: [{ title: "M5", text: "Тянет то, для чего раньше нужен был ноутбук: монтаж видео, рисование и десяток открытых приложений сразу." }, { title: "Ultra Retina XDR", text: "13 дюймов и запас яркости, чтобы видеть детали в тенях при цветокоррекции." }, { title: "Apple Pencil Pro", text: "Чувствует наклон и силу нажима — годится для рисования, а не только для галочек в чек-листах. Приобретается отдельно." }],
    source: "https://www.apple.com/ipad-pro/",
  },
  {
    slug: "macbook-pro-16-m5-max", name: "MacBook Pro 16″ · M5 Max", href: "/macbook-pro-16-m5-max", category: "macbook", categoryName: "MacBook",
    subtitle: "Большие проекты. Без мелкого шрифта.", image: "/media/macbook-pro-m5-max/hero-preview.webp", width: 1470, height: 630,
    description: "16-дюймовый MacBook Pro с M5 Max, Liquid Retina XDR и памятью до 128 ГБ — для профессионального видео, 3D, разработки и локальных AI-задач.",
    features: [{ title: "M5 Max", text: "До 18 ядер CPU, 40 ядер GPU и 614 ГБ/с скорости памяти — рендер, который раньше шёл всю ночь, укладывается в перерыв на кофе." }, { title: "Liquid Retina XDR", text: "16,2 дюйма, до 1600 нит в HDR и ProMotion до 120 Гц." }, { title: "До 22 часов", text: "Фильм в самолёте туда и обратно — и ещё останется заряд на такси из аэропорта." }],
    source: "https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/",
  },
  {
    slug: "apple-watch-ultra-4", name: "Apple Watch Ultra 4", href: "/apple-watch-ultra-4", category: "watch", categoryName: "Apple Watch",
    subtitle: "Работает там, где обычные часы садятся первыми.", image: "/media/apple-watch-ultra-4/hero-poster.webp", catalogImage: "/media/catalog/products/apple-watch-ultra-4.webp", width: 1470, height: 630,
    description: "Старшая модель Apple Watch для спорта и активного отдыха, объявленная 18 сентября 2026 года.",
    features: [{ title: "Ultra", text: "Старшая линия Apple Watch — та, что переживает не только пробежку в парке, но и полноценный поход." }, { title: "Тренировки", text: "Считает пульс и километры в фоне — чтобы вы думали о тренировке, а не о часах на запястье." }, { title: "Новая модель", text: "Старт продаж объявлен на 18 сентября 2026 года. Точную дату поступления в наш магазин уточняем отдельно." }],
    source: "https://www.apple.com/newsroom/2026/09/apple-unveils-apple-watch-ultra-4/",
  },
  {
    slug: "airpods-pro-3", name: "AirPods Pro 3", href: "/airpods-pro-3", category: "airpods", categoryName: "AirPods",
    subtitle: "Ближе к музыке.", image: "/media/airpods-pro-3/hero-poster.webp", width: 1470, height: 630,
    description: "Внутриканальные AirPods с активным шумоподавлением — для музыки в дороге, звонков и моментов, когда хочется отгородиться от вагона метро.",
    features: [{ title: "Активное шумоподавление", text: "Выключает гул самолёта и соседний разговор в опенспейсе — остаётся только то, что вы слушаете." }, { title: "Прозрачный режим", text: "Одно касание — и слышно объявление на перроне, не вынимая наушники из ушей." }, { title: "Автопереключение", text: "Слушали музыку на iPhone, взяли MacBook — звук сам переезжает туда, без настроек в Bluetooth-меню." }],
    source: "https://www.apple.com/airpods-pro/",
  },
  {
    slug: "xiaomi-17-ultra", name: "Xiaomi 17 Ultra", href: "/xiaomi-17-ultra", category: "xiaomi-smartphones", categoryName: "Xiaomi",
    subtitle: "Ваш взгляд. В деталях Ultra.", image: "/media/xiaomi-17-ultra/hero-poster.webp", width: 1470, height: 630,
    description: "Флагман Xiaomi с акцентом на мобильную фотографию и систему камер Leica. Для кадров, которые хочется сохранить.",
    features: [{ title: "Leica", text: "Цвет и рисунок боке настраивались вместе с Leica — угадывается с первого кадра." }, { title: "Ultra", text: "Старшая камера-линейка Xiaomi, где фото — не одна из функций, а главная причина купить телефон." }, { title: "Для съёмки", text: "Нужны кольцо ручной фокусировки и вспышка — берите Photography Kit Pro отдельно." }],
    source: "https://www.mi.com/global/product/xiaomi-17-ultra/",
  },
  {
    slug: "xiaomi-book-pro-14", name: "Xiaomi Book Pro 14", href: "/xiaomi-book-pro-14", category: "laptops", categoryName: "Ноутбуки",
    subtitle: "Рабочий день. В лёгком формате.", image: "/media/xiaomi-book-pro-14/hero-poster.jpg", width: 1470, height: 630,
    description: "Xiaomi Book Pro 14 — наш выбор флагмана среди ноутбуков: компактный корпус для работы и повседневных задач.",
    features: [{ title: "Pro-серия", text: "Старшая линейка ноутбуков Xiaomi — для тех, кому мало базовой модели." }, { title: "14 дюймов", text: "Помещается в дневной рюкзак рядом с зарядкой и не тянет плечо в метро." }, { title: "Конфигурации", text: "Точный процессор, память и раскладку клавиатуры добавим, как только подтвердим поставку — обещаем не молчать." }],
    source: "https://www.mi.com/prod/xiaomi-book-pro-14",
  },
  {
    slug: "galaxy-tab-s11-ultra", name: "Samsung Galaxy Tab S11 Ultra", href: "/galaxy-tab-s11-ultra", category: "samsung-tablets", categoryName: "Планшеты Samsung",
    subtitle: "Больше пространства для идей.", image: "/media/galaxy-tab-s11-ultra/hero-poster.jpg", width: 1470, height: 630,
    description: "Старший планшет Samsung с 14,6-дюймовым экраном, S Pen и режимом DeX для многозадачной работы.",
    features: [{ title: "14,6 дюйма", text: "Экран такого размера, что три окна помещаются рядом без прищура." }, { title: "S Pen", text: "Не тычете пальцем в мелкую иконку — перо ставит курсор туда, куда нужно, с первого раза." }, { title: "Samsung DeX", text: "Подключаете монитор — и планшет на столе работает как компьютер, а не как большой телефон." }],
    source: "https://www.samsung.com/us/tablets/galaxy-tab-s11/",
  },
];
