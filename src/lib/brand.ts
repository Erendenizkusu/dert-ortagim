/**
 * Dertdaş marka sabitleri.
 *
 * Logo: iki kol (kişi) ortada kenetlenir — el sıkışma. Kenetlenme noktasının
 * hemen üstünde, iki kişinin birlikte yarattığı bir kalp durur. Sol yarı mor,
 * sağ yarı gül; iki ayrı kişi, ortak bir dayanışma.
 */

export const BRAND_NAME = "dertdaş";
export const BRAND_TAGLINE = "Dertlerini paylaş, yalnız olmadığını hisset.";

/** Sol kol: alt-soldan gelip ortada kenetlenir. */
export const MARK_ARM_LEFT = "M4 23Q10 20.4 15.7 15.6";
/** Sağ kol: MARK_ARM_LEFT'in x=16 eksenine göre aynası. */
export const MARK_ARM_RIGHT = "M28 23Q22 20.4 16.3 15.6";

/** Kalbin sol yarısı (dolu). Ucu kenetlenmenin üstüne bakar. */
export const MARK_HEART_LEFT =
  "M16 13C13.3 10.9 11.2 9.4 11.2 7.7C11.2 6.3 12.2 5.5 13.4 5.5C14.6 5.5 15.5 6.4 16 7.3Z";
/** Kalbin sağ yarısı (dolu). */
export const MARK_HEART_RIGHT =
  "M16 13C18.7 10.9 20.8 9.4 20.8 7.7C20.8 6.3 19.8 5.5 18.6 5.5C17.4 5.5 16.5 6.4 16 7.3Z";

/** Marka renkleri (koyu ve açık zeminde de okunur). */
export const MARK_VIOLET = "#a78bfa";
export const MARK_ROSE = "#f2749e";
export const MARK_NAVY = "#0c0d17";

type MarkOptions = {
  left?: string;
  right?: string;
  strokeWidth?: number;
};

/** React dışı bağlamlar için (ImageResponse, data URI) ham SVG üretir. */
export function brandMarkSvg({
  left = MARK_VIOLET,
  right = MARK_ROSE,
  strokeWidth = 3.2,
}: MarkOptions = {}) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">` +
    `<path d="${MARK_ARM_LEFT}" fill="none" stroke="${left}" stroke-width="${strokeWidth}" stroke-linecap="round"/>` +
    `<path d="${MARK_ARM_RIGHT}" fill="none" stroke="${right}" stroke-width="${strokeWidth}" stroke-linecap="round"/>` +
    `<path d="${MARK_HEART_LEFT}" fill="${left}"/>` +
    `<path d="${MARK_HEART_RIGHT}" fill="${right}"/>` +
    `</svg>`
  );
}

export function brandMarkDataUri(options?: MarkOptions) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(brandMarkSvg(options))}`;
}
