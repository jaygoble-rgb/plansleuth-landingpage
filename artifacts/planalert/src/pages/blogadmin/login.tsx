import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Bell, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminMe, useAdminLogin } from "@/hooks/use-admin";

export default function BlogAdminLogin() {
  const [, navigate] = useLocation();
  const me = useAdminMe();
  const login = useAdminLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (me.data) navigate("/blogadmin");
  }, [me.data, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate("/blogadmin");
    } catch {
      // Error UI shown below
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-serif text-2xl font-bold text-primary mb-8">
          <Bell className="w-6 h-6 text-secondary fill-secondary" strokeWidth={2.5} />
          <span>PlanAlert</span>
        </Link>

        <div className="bg-white border border-primary/10 rounded-2xl p-8 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">Restricted area. Authorized administrators only.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                data-testid="input-admin-password"
              />
            </div>
            {login.isError && (
              <p className="text-sm text-destructive" data-testid="text-login-error">
                {(login.error as Error)?.message || "Sign in failed"}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white"
              disabled={login.isPending}
              data-testid="button-submit-login"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
