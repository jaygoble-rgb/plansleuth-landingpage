import React, { useState } from "react";
import { Search, CheckCircle, Wifi, Smartphone, ArrowRight, Clock } from "lucide-react";
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
      <header className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both">
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
            <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
              We all know it. Providers count on us not paying attention — quietly offering cheaper plans without telling us. Enough!
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
              We built <strong className="text-xl md:text-2xl text-primary">PlanSleuth</strong> to continuously monitor <strong className="text-xl md:text-2xl text-primary">cell phone</strong> and <strong className="text-xl md:text-2xl text-primary">internet plans</strong> — ours, yours, everyone's — and alert you the moment a better deal appears. The more members, the smarter we all get.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              PlanSleuth is currently in private beta. Join the waitlist for early access — we're opening spots in small batches.
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
            {/* Magnifying glass + bills visual */}
            <div className="relative w-80 h-96 md:w-96 md:h-[440px]">
              <svg viewBox="0 0 340 390" className="absolute inset-0 w-full h-full" style={{ animation: "float 5s ease-in-out infinite" }}>
                <defs>
                  <clipPath id="lensClip">
                    <circle cx="152" cy="152" r="112" />
                  </clipPath>
                  <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="25%" stopColor="hsla(21,73%,43%,0.65)" />
                    <stop offset="75%" stopColor="hsla(21,73%,43%,0.65)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>

                {/* Bill stack — back sheets for depth */}
                <rect x="84" y="78" width="172" height="226" rx="8" fill="#e8e4dc" stroke="#ccc8c0" strokeWidth="1" />
                <rect x="72" y="65" width="172" height="226" rx="8" fill="#f0ede7" stroke="#d4d0c8" strokeWidth="1.2" />

                {/* Front bill */}
                <rect x="60" y="52" width="172" height="226" rx="8" fill="white" stroke="#c8c4bc" strokeWidth="1.5" />

                {/* Bill header bar */}
                <rect x="60" y="52" width="172" height="34" rx="8" fill="hsl(221,47%,18%)" />
                <rect x="60" y="70" width="172" height="16" fill="hsl(221,47%,18%)" />

                {/* Header text */}
                <text x="72" y="66" fontFamily="sans-serif" fontSize="8" fontWeight="700" letterSpacing="1.5" fill="rgba(255,255,255,0.9)">WIRELESS BILL</text>
                <text x="72" y="77" fontFamily="sans-serif" fontSize="6.5" fill="rgba(255,255,255,0.5)">April 2026</text>
                <text x="224" y="66" fontFamily="sans-serif" fontSize="6.5" fill="rgba(255,255,255,0.45)" textAnchor="end">Acct #8847</text>

                {/* Account / amount due */}
                <text x="72" y="100" fontFamily="sans-serif" fontSize="7" fill="#a8a49c">J. Smith — Unlimited Plus</text>
                <text x="72" y="113" fontFamily="sans-serif" fontSize="7" fill="#b0aba2">Amount Due</text>
                <text x="72" y="128" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="#6b665e">$89.99</text>

                {/* Divider */}
                <line x1="72" y1="144" x2="218" y2="144" stroke="#ece8e2" strokeWidth="1" />

                {/* Line items */}
                <text x="72" y="157" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f">Base Plan</text>
                <text x="224" y="157" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f" textAnchor="end">$45.00</text>

                <text x="72" y="171" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f">Unlimited Data</text>
                <text x="224" y="171" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f" textAnchor="end">$25.00</text>

                <text x="72" y="185" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f">Device Payment</text>
                <text x="224" y="185" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f" textAnchor="end">$12.50</text>

                <text x="72" y="199" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f">Taxes &amp; Fees</text>
                <text x="224" y="199" fontFamily="sans-serif" fontSize="7.5" fill="#8c887f" textAnchor="end">$7.49</text>

                {/* Divider */}
                <line x1="72" y1="212" x2="218" y2="212" stroke="#d8d4cc" strokeWidth="1" />

                {/* Total */}
                <text x="72" y="225" fontFamily="sans-serif" fontSize="7.5" fontWeight="700" fill="#6b665e">Total Due</text>
                <text x="224" y="225" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#6b665e" textAnchor="end">$89.99</text>

                {/* Magnifying glass handle */}
                <line x1="242" y1="242" x2="314" y2="322" stroke="hsl(221,47%,18%)" strokeWidth="22" strokeLinecap="round" />

                {/* Lens ring */}
                <circle cx="152" cy="152" r="112" fill="rgba(210,228,255,0.10)" stroke="hsl(221,47%,18%)" strokeWidth="14" />

                {/* Glass shine */}
                <ellipse cx="112" cy="106" rx="26" ry="18" fill="rgba(255,255,255,0.13)" />

                {/* Animated scan line clipped to lens */}
                <g clipPath="url(#lensClip)" style={{ animation: "scanlineSVG 2.8s ease-in-out infinite" }}>
                  <rect x="40" y="148" width="224" height="7" rx="3" fill="url(#scanGrad)" />
                  <rect x="40" y="153" width="224" height="2" rx="1" fill="rgba(192,82,31,0.15)" />
                </g>
              </svg>

              {/* "Case Open" stamp */}
              <div className="absolute flex items-center justify-center text-center"
                style={{
                  top: 16, right: -10, width: 76, height: 76,
                  border: "2.5px solid hsl(var(--secondary))",
                  borderRadius: "50%",
                  fontFamily: "serif",
                  fontSize: 11,
                  color: "hsl(var(--secondary))",
                  transform: "rotate(6deg)",
                  background: "hsl(var(--background))",
                  lineHeight: 1.2,
                  fontWeight: 700,
                }}>
                Case<br />Open
              </div>
            </div>

            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
              @keyframes scanlineSVG {
                0%   { transform: translateY(-108px); }
                50%  { transform: translateY(108px); }
                100% { transform: translateY(-108px); }
              }
            `}</style>
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
                Case file: US consumers lose approximately $400B every year on household services. That's about <strong className="text-secondary">$4,500 per household</strong> taken from your pocket.
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
                desc: "Tell us what plan you're on. Cell phone and internet plans - whatever you've been quietly dreading to look into.",
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
                desc: "You get an alert the moment a genuinely better plan for you exists. Be better informed to make a switch. Case closed.",
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
