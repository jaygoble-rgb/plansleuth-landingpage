import { Bell } from "lucide-react";
import { Link } from "wouter";

export default function SiteNav() {
  return (
    <nav className="flex items-center justify-between p-6 md:px-12 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-primary hover:opacity-90 transition-opacity">
        <Bell className="w-6 h-6 text-secondary fill-secondary" strokeWidth={2.5} />
        <span>PlanAlert</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          Blog
        </Link>
      </div>
    </nav>
  );
}
