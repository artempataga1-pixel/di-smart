import photoDimensions from "@/constants/content/product-photo-dimensions.json";
import { getStorefrontPhoto } from "@/lib/image-quality";

const dimensions: Record<string, number[]> = photoDimensions;

/** One fixed frame for the whole model, independent of the selected colour.
 * Unknown or mixed formats safely fall back to a square with object-contain. */
export function getProductGalleryAspect(urls: (string | null)[]): number {
  const sources = [...new Set(urls.filter((url): url is string => Boolean(url)))];
  const sizes = sources.map((url) => dimensions[getStorefrontPhoto(url).split(/[?#]/)[0]]);
  if (!sizes.length || sizes.some((size) => !size?.[0] || !size?.[1])) return 1;
  const ratio = sizes[0][0] / sizes[0][1];
  if (sizes.some(([width, height]) => Math.abs(width / height - ratio) > 0.01)) return 1;
  return ratio;
}
