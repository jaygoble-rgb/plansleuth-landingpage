import { Bell } from "lucide-react";
import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="bg-background py-12 border-t border-primary/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary hover:opacity-90 transition-opacity">
          <Bell className="w-5 h-5 text-secondary fill-secondary" strokeWidth={2.5} />
          <span>PlanAlert</span>
        </Link>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PlanAlert. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
