import React, { useState } from "react";
import { Bell, CheckCircle, Wifi, Smartphone, ArrowRight, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12 max-w-7xl mx-auto w-full absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2 font-serif text-2xl font-bold text-primary">
          <Bell className="w-6 h-6 text-secondary fill-secondary" strokeWidth={2.5} />
          <span>PlanAlert</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Now monitoring
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-primary">
              Stop overpaying on your<br /><em className="font-serif italic text-secondary">cell phone &amp; internet plans</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
              We built <strong className="text-xl md:text-2xl text-primary">PlanAlert</strong> to continuously monitor <strong className="text-xl md:text-2xl text-primary">cell phone</strong> and <strong className="text-xl md:text-2xl text-primary">internet plans</strong> — ours, yours, everyone's — and ping you the moment a better deal appears. The more members, the smarter we all get.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              <strong className="text-xl md:text-2xl text-primary">PlanAlert</strong> is currently in private beta. <strong className="text-xl md:text-2xl text-primary">Join the waitlist for early access</strong> — we're opening spots in small batches.
            </p>
            
            <form onSubmit={handleSubscribe} className="relative flex flex-col sm:flex-row gap-3 max-w-md w-full">
              {submitted ? (
                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl text-primary font-medium w-full animate-in zoom-in-95">
                  <CheckCircle className="w-5 h-5 text-secondary" />
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
                  <Button type="submit" size="lg" className="h-14 rounded-xl px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    Join Waitlist
                  </Button>
                </>
              )}
            </form>
          </div>
          
          <div className="relative flex items-center justify-center animate-in fade-in slide-in-from-right-8 duration-1000 fill-mode-both delay-300">
            {/* Bills + alert notification visual */}
            <div className="relative w-80 h-96 md:w-96 md:h-[440px]">
              <img src="/bill.svg" alt="Wireless bill" className="absolute inset-0 w-full h-full" />

              {/* Alert notification card */}
              <img
                src="/notification.svg"
                alt="Better deal found notification"
                className="absolute w-64"
                style={{ bottom: -8, right: -16 }}
              />
            </div>

          </div>
        </div>
      </header>

      {/* The Problem Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
          <Bell className="w-96 h-96" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">A $400 Billion Problem</h2>
              <p className="text-xl text-primary-foreground/80 leading-relaxed mb-8">
                US consumers lose approximately $400B every year on household services. That's about <strong className="text-secondary">$4,500 per household</strong> taken from your pocket.
              </p>
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                Providers rely on you setting it and forgetting it. This isn't going to change, but together we can stay one step ahead.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Cell Phone", icon: Smartphone, active: true },
                { label: "Internet", icon: Wifi, active: true },
              ].map((service, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                  <service.icon className="w-8 h-8 text-secondary" />
                  <span className="font-medium text-white">{service.label}</span>
                  <span className="text-xs text-secondary font-medium px-2 py-0.5 bg-secondary/20 rounded-full">Available at launch</span>
                </div>
              ))}
              <div className="col-span-2 bg-white/5 border border-white/10 border-dashed p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                <Clock className="w-8 h-8 text-white/40" />
                <span className="font-medium text-white/60">More services coming</span>
                <span className="text-xs text-white/40">Car insurance, home insurance, mortgages & more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Three Steps */}
      <section className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-secondary mb-4">How it works</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">
              Three steps.<br /><em className="font-serif font-normal text-secondary">One less headache.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Add your plan",
                desc: "Tell us what plan you're on. Cell phone and internet plans — whatever you've been quietly dreading to look into.",
                tag: "Takes 2 minutes"
              },
              {
                number: "02",
                title: "We watch the market",
                desc: "PlanAlert monitors providers continuously — and cross-checks them against what thousands of real members are paying and switching to.",
                tag: "Community-powered"
              },
              {
                number: "03",
                title: "You get the alert",
                desc: "The moment a genuinely better plan for you appears, we'll ping you with the details so you can switch with confidence.",
                tag: "Switch and save"
              }
            ].map((step, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="text-4xl font-serif font-bold text-primary mb-6">{step.number}</div>
                <h3 className="text-xl font-bold mb-3 text-primary">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{step.desc}</p>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-secondary">
                  <ArrowRight className="w-4 h-4" />
                  {step.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <Bell className="w-16 h-16 text-secondary fill-secondary mx-auto mb-8" strokeWidth={2.5} />
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-white">We've got your back.</h2>
          <p className="text-xl text-white/80 mb-12">
            PlanAlert is currently in private beta, starting with cell phone and internet plans. Join the waitlist to be among the first to stop overpaying.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            {submitted ? (
              <div className="flex items-center justify-center gap-3 p-4 bg-white/10 rounded-xl text-white font-medium w-full border border-white/20 animate-in zoom-in-95">
                <CheckCircle className="w-6 h-6 text-secondary" />
                You're on the list! Talk soon.
              </div>
            ) : (
              <>
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="h-14 rounded-xl px-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary focus-visible:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" size="lg" className="h-14 rounded-xl px-8 bg-secondary hover:bg-secondary/90 text-primary font-bold text-lg">
                  Join Waitlist
                </Button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
            <Bell className="w-5 h-5 text-secondary fill-secondary" strokeWidth={2.5} />
            <span>PlanAlert</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PlanAlert. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
