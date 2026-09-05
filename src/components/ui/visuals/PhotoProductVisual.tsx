import Image from "next/image";
import { CATEGORY_GRADIENT } from "@/components/ui/ProductVisual";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/types/product";

interface PhotoProductVisualProps {
  src: string;
  alt: string;
  category: CategorySlug;
}

export function PhotoProductVisual({ src, alt, category }: PhotoProductVisualProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center bg-gradient-to-br",
        CATEGORY_GRADIENT[category]
      )}
    >
      <Image src={src} alt={alt} fill sizes="400px" className="object-contain p-8" />
    </div>
  );
}
