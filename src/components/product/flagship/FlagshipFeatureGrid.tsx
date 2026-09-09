interface FeatureCard {
  label: string;
  value: string;
  description: string;
}

const FEATURES: Record<string, FeatureCard[]> = {
  "iphone-17-pro": [
    {
      label: "Чип",
      value: "A19 Pro",
      description: "Вейпор-охлаждение держит пик производительности дольше — до 40% выше устойчивая производительность.",
    },
    {
      label: "Камера",
      value: "48 + 48 + 12 Мп",
      description: "Самый длинный зум на iPhone: оптически до 8x, цифровой — до 40x.",
    },
    {
      label: "Дисплей",
      value: "6.3\" ProMotion",
      description: "120 Гц и 3000 нит на солнце — экран, который не боится улицы.",
    },
    {
      label: "Аккумулятор",
      value: "До 33 ч видео",
      description: "Быстрая зарядка 40 Вт и MagSafe — 50% всего за 20–30 минут.",
    },
    {
      label: "Корпус",
      value: "Алюминий + Ceramic Shield 2",
      description: "Защитное стекло спереди втрое прочнее предыдущего поколения.",
    },
    {
      label: "Цвета",
      value: "Silver / Cosmic Orange / Deep Blue",
      description: "От 256 ГБ до 2 ТБ памяти — под любые задачи.",
    },
  ],
  "galaxy-s25-ultra": [
    {
      label: "Процессор",
      value: "Snapdragon 8 Elite for Galaxy",
      description: "+40% NPU, +37% CPU, +30% GPU по данным производителя.",
    },
    {
      label: "Камера",
      value: "200 Мп + S Pen",
      description: "AI Zoom до 100x, перископ-зум 5x — и S Pen всегда под рукой.",
    },
    {
      label: "Дисплей",
      value: "6.9\" Dynamic AMOLED 2X",
      description: "Адаптивные 120 Гц, 2600 нит, защитное стекло Corning Gorilla Armor 2.",
    },
    {
      label: "Аккумулятор",
      value: "5000 мАч",
      description: "До 31 ч видео, 45 Вт проводная и 15 Вт беспроводная зарядка.",
    },
    {
      label: "Корпус",
      value: "Титан, IP68",
      description: "Прочность без компромиссов в весе.",
    },
    {
      label: "Цвета",
      value: "4 титановых оттенка",
      description: "От 256 ГБ до 1 ТБ памяти — под любые задачи.",
    },
  ],
};

export function FlagshipFeatureGrid({ slug }: { slug: string }) {
  const features = FEATURES[slug];
  if (!features) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.label}
          className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent-ink)]">
            {feature.label}
          </p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text)]">
            {feature.value}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
