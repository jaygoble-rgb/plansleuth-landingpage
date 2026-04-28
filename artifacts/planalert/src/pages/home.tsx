import React, { useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center p-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-serif text-2xl font-bold text-primary">
          <Bell className="w-6 h-6 text-secondary fill-secondary" strokeWidth={2.5} />
          <span>PlanAlert</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-12 py-20">
        <div className="max-w-2xl w-full text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-primary">
            Stop overpaying on your{" "}
            <em className="font-serif italic text-secondary">cell phone &amp; internet plans</em>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            Providers quietly offer cheaper plans to new customers and never tell you.
            PlanAlert monitors the market and alerts you the moment a better deal appears.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            {submitted ? (
              <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl text-primary font-medium w-full">
                <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                You're on the list! We'll be in touch.
              </div>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-14 rounded-xl px-4 text-base bg-white border-primary/10 shadow-sm focus-visible:ring-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 rounded-xl px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 whitespace-nowrap"
                >
                  Join Waitlist
                </Button>
              </>
            )}
          </form>

          <p className="text-sm text-muted-foreground mt-5">
            Currently in private beta — opening spots in small batches.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-primary/10 px-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PlanAlert. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
