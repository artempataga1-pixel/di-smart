import NextImage, { type ImageProps } from "next/image";
import { getStorefrontPhoto, STOREFRONT_IMAGE_QUALITY } from "@/lib/image-quality";

/** Shared photo source and delivery quality without changing layout or crop. */
export default function StoreImage({ src, quality = STOREFRONT_IMAGE_QUALITY, ...props }: ImageProps) {
  return (
    <NextImage
      {...props}
      src={typeof src === "string" ? getStorefrontPhoto(src) : src}
      quality={quality}
    />
  );
}
