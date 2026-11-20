import photoMasters from "@/constants/content/photo-masters.json";
import photoReplacements from "@/constants/content/product-photo-replacements.json";

/** Applied to storefront photography; 75 remains accepted for cached pages. */
export const STOREFRONT_IMAGE_QUALITY = 90;

const masters: Record<string, string> = photoMasters;
const replacements: Record<string, string> = photoReplacements;

/** Reviewed full-frame replacements take precedence over older lossless copies. */
export function getStorefrontPhoto(src: string): string {
  const queryIndex = src.search(/[?#]/);
  const pathname = queryIndex < 0 ? src : src.slice(0, queryIndex);
  const suffix = queryIndex < 0 ? "" : src.slice(queryIndex);
  return getPhotoMaster(replacements[pathname] ? `${replacements[pathname]}${suffix}` : src);
}

/** Only verified, bundled photographs have a lossless master override.
 * Uploads and external URLs keep their own source and cache semantics. */
export function getPhotoMaster(src: string): string {
  if (!src.startsWith("/media/")) return src;
  const queryIndex = src.search(/[?#]/);
  const pathname = queryIndex < 0 ? src : src.slice(0, queryIndex);
  const suffix = queryIndex < 0 ? "" : src.slice(queryIndex);
  return masters[pathname] ? `${masters[pathname]}${suffix}` : src;
}
