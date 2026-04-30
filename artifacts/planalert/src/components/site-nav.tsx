import { Bell } from "lucide-react";
import { Link } from "wouter";

interface SiteNavProps {
  overlay?: boolean;
}

export default function SiteNav({ overlay = false }: SiteNavProps) {
  return (
    <nav
      className={[
        "flex items-center justify-between p-6 md:px-12 max-w-7xl mx-auto w-full",
        overlay ? "absolute top-0 left-0 right-0 z-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-primary hover:opacity-90 transition-opacity">
        <Bell className="w-6 h-6 text-secondary fill-secondary" strokeWidth={2.5} />
        <span>PlanAlert</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/blog"
          className="text-sm font-medium text-primary/70 hover:text-primary transition-colors"
        >
          Blog
        </Link>
      </div>
    </nav>
  );
}
