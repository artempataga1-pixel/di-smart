/**
 * Проверенные дополнения для карточек, где исходный каталог содержал меньше
 * трёх параметров. Значения, зависящие от точного SKU, сюда не добавляем.
 * Источники и оговорки: docs/catalog/research-missing-specs.md.
 */
export const CATALOG_SPEC_ADDITIONS: Record<string, [string, string][]> = {
  "airpods-max": [["Конструкция", "Полноразмерные"], ["Режимы", "Шумоподавление и прозрачность"]],
  "apple-20w-adapter": [["Подключение", "Устройства с USB-C"]],
  "apple-35w-dual-adapter": [["Зарядка", "До двух устройств одновременно"]],
  "apple-magsafe-charger": [["Подключение", "Встроенный кабель USB-C"]],
  "apple-pencil-2": [["Управление", "Двойное касание"], ["Связь", "Bluetooth"]],
  "apple-pencil-pro": [["Управление", "Поворот корпуса и двойное касание"], ["Поиск", "Локатор Apple"]],
  "apple-pencil-usb-c": [["Рисование", "Чувствительность к наклону"], ["Крепление", "Магнитное хранение на iPad"]],
  "cable-braided-usbc": [["Назначение", "Зарядка и передача данных"]],
  "cable-usbc-jack": [["Назначение", "Подключение проводных наушников"], ["Выход", "3,5 мм"]],
  "cable-usbc-lightning": [["Назначение", "Зарядка и синхронизация"], ["Подключение", "USB-C — Lightning"]],
  "cable-usbc-usbc": [["Назначение", "Зарядка и передача данных"], ["Подключение", "USB-C — USB-C"]],
  "earpods-usb-c": [["Управление", "Пульт на кабеле"], ["Звонки", "Встроенный микрофон"]],
  "galaxy-buds3": [["Конструкция", "Открытая"], ["Защита", "IP57"]],
  "galaxy-buds3-pro": [["Конструкция", "Внутриканальная"], ["Защита", "IP57"]],
  "galaxy-s25-case": [["Совместимость", "Samsung Galaxy S25"], ["Назначение", "Защита корпуса"]],
  "ipad-folio-case": [["Форм-фактор", "Чехол-книжка"], ["Функция", "Подставка для планшета"]],
  "iphone-clear-case": [["Внешний вид", "Прозрачный"], ["Назначение", "Защита корпуса"]],
  "iphone-silicone-case": [["Тип", "Чехол для iPhone"], ["Назначение", "Защита корпуса"]],
  "macbook-sleeve": [["Форм-фактор", "Чехол-рукав"], ["Назначение", "Переноска ноутбука"]],
  "redmi-buds-8-lite": [["Связь", "Bluetooth 5.4"]],
  "s-pen-pro": [["Связь", "Bluetooth"], ["Функции", "Air Actions"]],
  "samsung-25w-charger": [["Стандарт", "USB Power Delivery 3.0 PPS"]],
  "samsung-45w-charger": [["Стандарт", "USB Power Delivery 3.0 PPS"]],
  "samsung-cable-usbc-usbc": [["Назначение", "Зарядка и передача данных"], ["Подключение", "USB-C — USB-C"]],
  "watch-hermes-series-11": [["Автономность", "До 24 часов"]],
  "watch-se-3": [["Экран", "Always-On Retina OLED"], ["Автономность", "До 18 часов"]],
  "watch-series-11": [["Экран", "LTPO3 OLED"], ["Автономность", "До 24 часов"]],
  "watch-series-11-cellular": [["Связь", "Cellular (при поддержке оператором)"], ["Автономность", "До 24 часов"]],
};

export function withCatalogSpecAdditions(slug: string, specs: [string, string][]): [string, string][] {
  const result = [...specs];
  const existingNames = new Set(specs.map(([name]) => name.toLocaleLowerCase("ru")));
  for (const [name, value] of CATALOG_SPEC_ADDITIONS[slug] ?? []) {
    if (!existingNames.has(name.toLocaleLowerCase("ru"))) {
      result.push([name, value]);
      existingNames.add(name.toLocaleLowerCase("ru"));
    }
  }
  return result;
}
