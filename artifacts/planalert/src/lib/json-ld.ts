// Client-side mirror of server/json-ld.mjs — keep the two in sync.
// Used by pages via useMeta({ jsonLd }) so client-side navigation carries
// the same structured data the server/prerender emits in raw HTML.
import { SITE_ORIGIN } from "@/lib/site";
import type { BlogPost } from "@/lib/blog-api";

export const LOGO_URL = `${SITE_ORIGIN}/bell-logo.png`;

export const SAME_AS = [
  "https://facebook.com/planalert",
  "https://instagram.com/getplanalert",
  "https://linkedin.com/company/planalert",
  "https://tiktok.com/@getplanalert",
  "https://twitter.com/getplanalert",
];

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PlanAlert",
    url: `${SITE_ORIGIN}/`,
    logo: LOGO_URL,
    sameAs: SAME_AS,
  };
}

export function webSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PlanAlert",
    url: `${SITE_ORIGIN}/`,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function toIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function blogPostingJsonLd(post: BlogPost): Record<string, unknown> {
  const url = `${SITE_ORIGIN}/blog/${post.slug}`;
  const block = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    url,
    datePublished: toIso(post.publishDate),
    dateModified: toIso(post.updatedAt) || toIso(post.publishDate),
    image: post.openGraphImageUrl || post.featuredImageUrl || undefined,
    author: { "@type": "Organization", name: post.author || "PlanAlert" },
    publisher: {
      "@type": "Organization",
      name: "PlanAlert",
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  return JSON.parse(JSON.stringify(block));
}

export function blogPostBreadcrumbJsonLd(post: BlogPost): Record<string, unknown> {
  return breadcrumbJsonLd([
    { name: "Home", url: `${SITE_ORIGIN}/` },
    { name: "Blog", url: `${SITE_ORIGIN}/blog` },
    { name: post.title, url: `${SITE_ORIGIN}/blog/${post.slug}` },
  ]);
}
