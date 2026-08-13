import { useEffect } from "react";

interface MetaOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>> | null;
}

function setTag(selector: string, attrs: Record<string, string>): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
  return el;
}

export function useMeta(opts: MetaOptions): void {
  useEffect(() => {
    const original = document.title;
    const created: HTMLElement[] = [];

    if (opts.title) document.title = opts.title;
    if (opts.description) {
      const el = setTag('meta[name="description"]', { name: "description", content: opts.description });
      created.push(el);
    }
    if (opts.canonical) {
      const el = setTag('link[rel="canonical"]', { rel: "canonical", href: opts.canonical });
      created.push(el);
    }
    const ogPairs: Array<[string, string | undefined]> = [
      ["og:title", opts.ogTitle ?? opts.title],
      ["og:description", opts.ogDescription ?? opts.description],
      ["og:image", opts.ogImage],
      ["og:type", opts.ogType ?? "article"],
    ];
    ogPairs.forEach(([prop, value]) => {
      if (!value) return;
      const el = setTag(`meta[property="${prop}"]`, { property: prop, content: value });
      created.push(el);
    });
    // The client owns JSON-LD after hydration: drop any server/prerender
    // injected blocks (they lack data-dynamic) so direct loads don't end up
    // with duplicates once the page's own blocks are appended below.
    document.head
      .querySelectorAll('script[type="application/ld+json"]:not([data-dynamic])')
      .forEach((el) => el.remove());
    const scriptEls: HTMLScriptElement[] = [];
    const jsonLdBlocks = opts.jsonLd
      ? Array.isArray(opts.jsonLd)
        ? opts.jsonLd
        : [opts.jsonLd]
      : [];
    for (const block of jsonLdBlocks) {
      const scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = JSON.stringify(block);
      scriptEl.dataset.dynamic = "true";
      document.head.appendChild(scriptEl);
      scriptEls.push(scriptEl);
    }
    return () => {
      document.title = original;
      scriptEls.forEach((el) => el.remove());
    };
  }, [
    opts.title,
    opts.description,
    opts.canonical,
    opts.ogTitle,
    opts.ogDescription,
    opts.ogImage,
    opts.ogType,
    JSON.stringify(opts.jsonLd ?? null),
  ]);
}
