import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Bell, LogOut, FileText, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminLogout, useAdminMe } from "@/hooks/use-admin";

interface AdminShellProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export function AdminShell({ children, title, actions }: AdminShellProps) {
  const [, navigate] = useLocation();
  const me = useAdminMe();
  const logout = useAdminLogout();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-background border-b border-primary/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
              <Bell className="w-5 h-5 text-secondary fill-secondary" strokeWidth={2.5} />
              <span>PlanAlert</span>
            </Link>
            <span className="hidden md:inline text-xs uppercase tracking-widest text-muted-foreground">
              Blog Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/blogadmin"
              className="hidden md:inline-flex items-center gap-1.5 text-sm text-primary/80 hover:text-primary"
              data-testid="link-admin-posts"
            >
              <FileText className="w-4 h-4" /> Posts
            </Link>
            <Link
              href="/blogadmin/waitlist"
              className="hidden md:inline-flex items-center gap-1.5 text-sm text-primary/80 hover:text-primary"
              data-testid="link-admin-waitlist"
            >
              <Users className="w-4 h-4" /> Waitlist
            </Link>
            <span className="hidden md:inline text-sm text-muted-foreground">{me.data?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout.mutateAsync();
                navigate("/blogadmin/login");
              }}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          {(title || actions) && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              {title && <h1 className="font-serif text-3xl font-bold text-primary">{title}</h1>}
              {actions}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const me = useAdminMe();
  const [, navigate] = useLocation();

  if (me.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>
    );
  }
  if (!me.data) {
    navigate("/blogadmin/login");
    return null;
  }
  return <>{children}</>;
}

export function NewPostButton() {
  const [, navigate] = useLocation();
  return (
    <Button
      onClick={() => navigate("/blogadmin/new")}
      className="rounded-xl bg-primary hover:bg-primary/90 text-white"
      data-testid="button-new-post"
    >
      <Plus className="w-4 h-4 mr-1.5" /> New Post
    </Button>
  );
}
