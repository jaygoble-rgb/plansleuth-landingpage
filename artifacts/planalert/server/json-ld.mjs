// Shared JSON-LD (schema.org) builders used by both the production server
// (server/index.mjs) and the build-time prerender (scripts/prerender.mjs).
// Keep dependency-free — the production server cannot use workspace
// node_modules. A TypeScript mirror for the client lives in
// src/lib/json-ld.ts; keep the two in sync.

export const SITE_ORIGIN = "https://www.planalert.com";
export const LOGO_URL = `${SITE_ORIGIN}/bell-logo.png`;

export const SAME_AS = [
  "https://facebook.com/planalert",
  "https://instagram.com/getplanalert",
  "https://linkedin.com/company/planalert",
  "https://tiktok.com/@getplanalert",
  "https://twitter.com/getplanalert",
];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PlanAlert",
    url: `${SITE_ORIGIN}/`,
    logo: LOGO_URL,
    sameAs: SAME_AS,
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PlanAlert",
    url: `${SITE_ORIGIN}/`,
  };
}

export function breadcrumbJsonLd(items) {
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

function toIso(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function blogPostingJsonLd(post) {
  const url = `${SITE_ORIGIN}/blog/${post.slug}`;
  const image = post.openGraphImageUrl || post.featuredImageUrl || undefined;
  const block = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    url,
    datePublished: toIso(post.publishDate),
    dateModified: toIso(post.updatedAt) || toIso(post.publishDate),
    image,
    author: { "@type": "Organization", name: post.author || "PlanAlert" },
    publisher: {
      "@type": "Organization",
      name: "PlanAlert",
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  // Drop undefined members so the emitted JSON stays clean.
  return JSON.parse(JSON.stringify(block));
}

export function blogPostBreadcrumbJsonLd(post) {
  return breadcrumbJsonLd([
    { name: "Home", url: `${SITE_ORIGIN}/` },
    { name: "Blog", url: `${SITE_ORIGIN}/blog` },
    { name: post.title, url: `${SITE_ORIGIN}/blog/${post.slug}` },
  ]);
}

// Serializes blocks into <script type="application/ld+json"> tags. `<` is
// escaped so post titles can never break out of the script element.
export function jsonLdScriptTags(blocks) {
  return blocks
    .filter(Boolean)
    .map(
      (b) =>
        `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, "\\u003c")}</script>`,
    )
    .join("\n    ");
}

// Injects blocks just before </head>.
export function injectJsonLd(html, blocks) {
  if (!blocks || blocks.length === 0) return html;
  const tags = jsonLdScriptTags(blocks);
  return html.replace("</head>", () => `    ${tags}\n  </head>`);
}
