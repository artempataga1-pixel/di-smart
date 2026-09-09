const BLOBS = [
  { color: "#FF7700", top: "-10%", left: "-10%", size: "42rem", opacity: 0.55 },
  { color: "#FFB000", top: "5%", left: "55%", size: "36rem", opacity: 0.4 },
  { color: "#FFD985", top: "45%", left: "10%", size: "30rem", opacity: 0.25 },
];

/** Один статичный градиентный фон на всю витрину (fixed, во весь вьюпорт,
 * за контентом). Раньше каждая флагманская страница монтировала свой
 * собственный набор блобов (FlagshipGradientBackground) — теперь это
 * единственный инстанс, подключённый в ShopChrome. */
export function GradientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {BLOBS.map((blob) => (
        <span
          key={blob.color}
          className="gradient-blob"
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            opacity: blob.opacity,
          }}
        />
      ))}
    </div>
  );
}
