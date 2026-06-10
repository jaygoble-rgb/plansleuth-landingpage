import { Bell } from "lucide-react";
import { Link } from "wouter";

export type SiteNavVariant = "default" | "overlay" | "sticky";

interface SiteNavProps {
  /**
   * Layout variant.
   *  - "default": in-flow nav.
   *  - "overlay": absolutely positioned over the hero (transparent).
   *  - "sticky": pinned to the top with a translucent background and bottom border.
   */
  variant?: SiteNavVariant;
  /** @deprecated use `variant="overlay"` instead. */
  overlay?: boolean;
}

const BASE = import.meta.env.BASE_URL;
const homeHash = (hash: string) => `${BASE}#${hash}`;

export function SiteNav({ variant, overlay = false }: SiteNavProps) {
  const resolved: SiteNavVariant = variant ?? (overlay ? "overlay" : "default");

  const wrapperClass =
    resolved === "sticky"
      ? "sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-primary/8"
      : "";

  const innerClass = [
    "relative flex items-center justify-between p-6 md:px-12 max-w-7xl mx-auto w-full",
    resolved === "overlay" ? "absolute top-0 left-0 right-0 z-50" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const nav = (
    <nav className={innerClass}>
      <Link
        href="/"
        className="flex items-center gap-2 font-serif text-2xl font-bold text-primary hover:opacity-90 transition-opacity"
      >
        <Bell className="w-6 h-6 text-secondary fill-secondary" strokeWidth={2.5} />
        <span>PlanAlert</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        <a
          href={homeHash("how-it-works")}
          className="text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          How it Works
        </a>
        <Link
          href="/about"
          className="text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          About
        </Link>
        <Link
          href="/blog"
          className="text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          Blog
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <a
          href={homeHash("get-started")}
          className="hidden sm:inline-block text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          Sign in
        </a>
        <a
          href={homeHash("get-started")}
          className="inline-flex items-center justify-center rounded-lg bg-[#2563FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#2563FF]/20 hover:bg-[#1E55E6] transition-colors"
        >
          Get Started Free
        </a>
      </div>
    </nav>
  );

  if (resolved === "sticky") {
    return <div className={wrapperClass}>{nav}</div>;
  }
  return nav;
}

export default SiteNav;
