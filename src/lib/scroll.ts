/** Плавный скролл к якорю на странице — общий для hero-стрелок и кнопок
 * "Выбрать конфигурацию", которые возвращают к блоку покупки. Уважает
 * системную настройку уменьшенного движения (как и остальные reveal-анимации
 * в проекте). */
export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}
