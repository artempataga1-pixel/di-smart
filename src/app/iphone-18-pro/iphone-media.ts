export interface ProductMediaAsset {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  position?: string;
}

const base = "/media/iphone-18-pro/images/natural";
const photo = (name: string, alt: string, fit: "cover" | "contain" = "cover", position = "50% 50%"): ProductMediaAsset => ({ src: `${base}/${name}.webp`, alt, fit, position });

export const productMedia: Record<string, ProductMediaAsset> = {
  "highlight-design": photo("design-burgundy", "Бордовый iPhone 18 Pro"),
  "highlight-camera": photo("camera", "Крупный план системы камер"),
  "highlight-performance": { src: "/media/iphone-18-pro/apple/a20-pro.webp", alt: "Процессор Apple A20 Pro", fit: "cover" },
  "highlight-battery": photo("battery", "iPhone на деревянном столике кафе"),
  "introduction": photo("battery", "Бордовый iPhone и чашка кофе при дневном свете"),
  "design-burgundy": photo("design-burgundy", "iPhone 18 Pro в бордовом цвете, вид сзади", "contain"),
  "design-glacier": photo("glacier", "iPhone 18 Pro в ледниковом цвете, вид сзади", "contain"),
  "design-silver": photo("silver", "iPhone 18 Pro в серебристом цвете, вид сзади", "contain"),
  "design-black": photo("black", "iPhone 18 Pro в чёрном цвете, вид сзади", "contain"),
  "camera-system": photo("camera", "Три объектива и бордовый корпус камеры iPhone", "cover", "50% 35%"),
  "camera-light": photo("portrait-minsk", "Голубоглазая блондинка у окна в Минске в мягком утреннем свете", "cover", "62% 50%"),
  "camera-zoom": photo("landscape", "Визуализация рисовых террас Джатилувих на Бали", "cover", "50% 50%"),
  "camera-macro": photo("macro", "Капля росы на бордовом лепестке каллы", "cover", "44% 50%"),
  "camera-controls": photo("controls", "Визуализация съёмки Троицкого предместья в Минске на телефон"),
  "cinematic-film": photo("cinema", "Визуализация пляжа Санур на Бали с традиционными лодками"),
  "battery-lifestyle": photo("battery", "Бордовый телефон на деревянном столике кафе"),
  "charging": photo("charging", "Магнитная зарядка на задней панели бордового iPhone", "contain"),
  "chip-and-cooling": { src: "/media/iphone-18-pro/apple/a20-pro.webp", alt: "Процессор с маркировкой Apple A20 Pro", fit: "contain" },
  "performance-gaming": photo("gaming", "Игра на широком экране телефона в руках"),
  "ios-experience": photo("experience", "Бордовый iPhone с двух сторон на столе при дневном свете", "contain"),
  "ecosystem": photo("ecosystem", "iPhone, ноутбук и наушники на рабочем столе", "contain"),
  "accessories-case": photo("case", "Бордовый защитный чехол на iPhone", "contain"),
  "accessories-charge": photo("charging", "Магнитное зарядное устройство с плетёным кабелем", "contain"),
  "model-pro": photo("design-burgundy", "iPhone 18 Pro в бордовом корпусе"),
  "model-max": photo("design-burgundy", "iPhone 18 Pro Max в бордовом корпусе"),
};
