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

export function SiteNav({ variant, overlay = false }: SiteNavProps) {
  const resolved: SiteNavVariant = variant ?? (overlay ? "overlay" : "default");

  const wrapperClass =
    resolved === "sticky"
      ? "sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-primary/8"
      : "";

  const innerClass = [
    "flex items-center justify-between p-6 md:px-12 max-w-7xl mx-auto w-full",
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
      <div className="flex items-center gap-6">
        <Link
          href="/blog"
          className="text-lg font-semibold text-primary/80 hover:text-primary transition-colors"
        >
          Blog
        </Link>
      </div>
    </nav>
  );

  if (resolved === "sticky") {
    return <div className={wrapperClass}>{nav}</div>;
  }
  return nav;
}

export default SiteNav;
