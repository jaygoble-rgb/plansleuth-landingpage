export const SITE_ORIGIN = "https://www.planalert.com";

export function canonicalUrl(path: string): string {
  return `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
}
