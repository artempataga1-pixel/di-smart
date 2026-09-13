import Image from "next/image";
import { cn } from "@/lib/utils";

export interface MediaAsset {
  id: string;
  alt: string;
  /** Появляется, когда есть реальный файл — до этого рендерится плейсхолдер. */
  src?: string;
  tone?: "titanium" | "blue" | "black";
}

const TONE_GRADIENT: Record<NonNullable<MediaAsset["tone"]>, string> = {
  titanium: "linear-gradient(135deg, #4b4b4d 0%, #8a8a86 50%, #d7d9dc 100%)",
  blue: "linear-gradient(135deg, #0d1b2a 0%, #3f5f7f 55%, #6f92ad 100%)",
  black: "linear-gradient(135deg, #020201 0%, #1c1c1e 55%, #3a3a3c 100%)",
};

export function MediaFrame({
  asset,
  className,
  fill = true,
  sizes = "100vw",
}: {
  asset: MediaAsset;
  className?: string;
  fill?: boolean;
  sizes?: string;
}) {
  if (asset.src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={asset.src} alt={asset.alt} fill={fill} sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={asset.alt}
      className={cn("relative flex items-center justify-center overflow-hidden text-white/70", className)}
      style={{ background: TONE_GRADIENT[asset.tone ?? "titanium"] }}
    >
      <svg width="15%" height="15%" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ minWidth: 40, minHeight: 40, maxWidth: 96, maxHeight: 96 }}>
        <rect x="6" y="2" width="12" height="20" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
        <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
