import React, { useState } from "react";
import { Search, Shield, Bell, CheckCircle, Wifi, Smartphone, ArrowRight, Users, Clock } from "lucide-react";
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
          <Search className="w-6 h-6 text-secondary" strokeWidth={3} />
          <span>PlanSleuth</span>
        </div>
        <Button variant="outline" className="hidden md:flex rounded-full border-primary/20 hover:bg-primary/5 text-primary">
          Join Waitlist
        </Button>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Now investigating
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-primary">
              The Case of the<br /><em className="font-serif italic text-secondary">Overpriced Plan</em>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              We all know it. Providers count on us not paying attention — and quietly raise prices while we're busy with everything else. Enough!
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              PlanSleuth continuously monitors cell phone and internet plans — ours, yours, everyone's — and alerts you the moment a better deal appears. The more members, the smarter we get.
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
                    Get Early Access
                  </Button>
                </>
              )}
            </form>
          </div>
          
          <div className="relative animate-in slide-in-from-right-8 duration-1000 fade-in fill-mode-both delay-300">
            <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/20 to-transparent blur-2xl rounded-full opacity-50"></div>
            <img 
              src="/hero-illustration.png" 
              alt="A warm, inviting desk scene with a magnifying glass" 
              className="w-full h-auto rounded-2xl shadow-2xl object-cover border border-primary/5 relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </header>

      {/* The Problem Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
          <Search className="w-96 h-96" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">A $400 Billion Heist</h2>
              <p className="text-xl text-primary-foreground/80 leading-relaxed mb-8">
                US consumers lose approximately $400B every year on household services. That's about <strong className="text-secondary">$4,500 per household</strong> vanishing into thin air, month after month.
              </p>
              <p className="text-lg text-primary-foreground/70 leading-relaxed">
                Providers rely on you setting it and forgetting it. They raise prices quietly. They introduce better plans for "new customers only." It's not an accident—it's their business model.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Cell Phone", icon: Smartphone, active: true },
                { label: "Internet & TV", icon: Wifi, active: true },
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
            <p className="text-sm font-semibold uppercase tracking-widest text-secondary mb-4">Method of investigation</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">
              Three steps.<br /><em className="font-serif font-normal text-secondary">One less headache.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "File your plan",
                desc: "Tell us what you're paying now. Cell plan, internet bill — whatever you've been quietly dreading to look at.",
                tag: "Takes 2 minutes"
              },
              {
                number: "02",
                title: "We investigate",
                desc: "PlanSleuth monitors the market continuously — and cross-checks it against what thousands of real members are paying and switching to.",
                tag: "Community-powered"
              },
              {
                number: "03",
                title: "Case closed.",
                desc: "You get an alert the moment a genuinely better plan exists. Make the switch. Case closed.",
                tag: "Switch to a better plan"
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

      {/* Solution / Value Props */}
      <section className="py-24 md:py-32 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-12">
                {[
                  {
                    title: "Known Savings Opportunities",
                    desc: "We do the digging. When a better rate for your specific usage appears, you're the first to know.",
                    icon: Bell
                  },
                  {
                    title: "Short-List Recommendations",
                    desc: "Powered by the wisdom of the community. See exactly what your neighbors are actually paying and saving.",
                    icon: Users
                  },
                  {
                    title: "Hassle-Free Updates",
                    desc: "Make the switch with a click. We guide you through the process, minus the hours on hold.",
                    icon: ArrowRight
                  },
                  {
                    title: "Peace of Mind",
                    desc: "Rest easy knowing someone smart is looking out for your wallet. You'll never overpay again.",
                    icon: Shield
                  }
                ].map((prop, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-primary/10">
                      <prop.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-primary">{prop.title}</h3>
                      <p className="text-muted-foreground text-lg">{prop.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 md:order-2 bg-white rounded-3xl p-8 shadow-xl border border-primary/5 relative">
              <div className="absolute -top-6 -right-6 bg-secondary text-primary font-bold py-2 px-6 rounded-full transform rotate-3 shadow-lg">
                Your personal plan detective
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-primary">We've got your back.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Think of PlanSleuth as your trusted private investigator who quietly watches the market. We do the research, crunch the numbers, and bring you the evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <Search className="w-16 h-16 text-secondary mx-auto mb-8" />
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-white">Join the Investigation.</h2>
          <p className="text-xl text-white/80 mb-12">
            PlanSleuth is currently in private beta, starting with cell phone and internet plans. Join the waitlist to be among the first to stop overpaying.
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
            <Search className="w-5 h-5 text-secondary" strokeWidth={3} />
            <span>PlanSleuth</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PlanSleuth. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
