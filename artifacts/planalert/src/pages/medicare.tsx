import {
  ArrowRight,
  ShieldCheck,
  Lock,
  ClipboardList,
  LineChart,
  BellRing,
  HeartHandshake,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { useMeta } from "@/hooks/use-meta";
import { SITE_ORIGIN, canonicalUrl } from "@/lib/site";

const steps = [
  {
    icon: ClipboardList,
    number: "1",
    title: "Tell us your current plan",
    body: "Enter your Medicare Advantage or Part D plan details securely. It takes just two minutes.",
  },
  {
    icon: LineChart,
    number: "2",
    title: "We monitor the market",
    body: "Our system quietly compares thousands of plans, watching for changes in benefits, premiums, and formularies.",
  },
  {
    icon: BellRing,
    number: "3",
    title: "You get plain, honest alerts",
    body: "If a genuinely better plan becomes available during enrollment periods, we tell you clearly.",
  },
];

export default function Medicare() {
  useMeta({
    title: "Medicare Plan Monitoring — PlanAlert",
    description:
      "We monitor your Medicare Advantage and Part D plans and alert you plainly when a better option exists. Secure, private, and independent.",
    canonical: canonicalUrl("/medicare"),
    ogType: "website",
    ogImage: `${SITE_ORIGIN}/opengraph.jpg`,
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30 overflow-x-hidden">
      <SiteNav variant="sticky" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#F7F9FC]">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#2563FF]/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          <div className="min-w-0 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2563FF] mb-4">
              Medicare Monitoring
            </p>
            <h1 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.07] sm:leading-[1.05] tracking-tight text-primary">
              Don't get trapped in the wrong Medicare plan.
            </h1>
            <p className="mt-6 text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
              Medicare plans change their benefits and premiums every year. We quietly watch the market and tell you plainly when a better deal exists for you.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 lg:h-16 rounded-xl px-8 bg-[#2563FF] hover:bg-[#1E55E6] text-white text-base lg:text-lg font-semibold border-0 shadow-lg shadow-[#2563FF]/25"
                data-testid="button-medicare-start"
              >
                <a href="https://app.planalert.com">
                  Start Monitoring Free
                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 ml-2" />
                </a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm lg:text-base text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-[#2563FF]" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 lg:w-5 lg:h-5 text-[#2563FF]" />
                <span>Not an insurance agent</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-6 duration-1000 fill-mode-both delay-150">
             <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl shadow-primary/5 border border-[#E5EAF2] p-6 lg:p-8">
               <div className="absolute -left-3 sm:-left-6 top-10 w-12 h-12 bg-[#2563FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#2563FF]/20 animate-in zoom-in fade-in delay-500 duration-500 fill-mode-both">
                 <BellRing className="w-6 h-6" />
               </div>
               <div className="space-y-6">
                 <div>
                   <h3 className="font-semibold text-primary text-lg lg:text-xl">Better Plan Found</h3>
                   <p className="text-sm lg:text-base text-muted-foreground mt-1">We found a plan with better coverage in your ZIP code for 2025.</p>
                 </div>
                 
                 <div className="p-4 bg-[#F7F9FC] rounded-xl border border-[#E5EAF2]">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm lg:text-base font-medium text-muted-foreground">Your Current Plan</span>
                     <span className="text-sm lg:text-base font-bold text-primary">$45/mo</span>
                   </div>
                   <div className="text-sm lg:text-base text-primary font-medium">Silver Plus Advantage</div>
                 </div>

                 <div className="p-4 bg-[#EEF2FA] rounded-xl border border-[#2563FF]/20">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm lg:text-base font-bold text-[#2563FF]">New Option Found</span>
                     <span className="text-sm lg:text-base font-bold text-primary">$0/mo</span>
                   </div>
                   <div className="text-sm lg:text-base text-primary font-medium">Gold Premium Advantage</div>
                   <div className="mt-4 text-sm lg:text-base text-[#2563FF] font-semibold flex items-center gap-1.5">
                     Save $540 yearly <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* The Loyalty Trap */}
      <section className="py-24 md:py-28 bg-white border-t border-[#E5EAF2] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-[1.1]">
              The Medicare loyalty trap is real.
            </h2>
            <div className="mt-8 space-y-5 text-lg lg:text-xl text-muted-foreground leading-relaxed">
              <p>
                Every year during the Annual Enrollment Period, insurance companies change their plans. They adjust premiums, modify deductibles, and change which medications are covered.
              </p>
              <p>
                Most people never re-shop. They stay on the same plan, assuming their loyalty is rewarded. In reality, <span className="font-semibold text-primary">staying put often means paying more for less coverage.</span>
              </p>
              <p>
                PlanAlert exists because you shouldn't have to navigate a maze of marketing mailers to know if you're overpaying. We watch your plan, compare it against the actual market, and let you know if a move makes sense.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2 bg-[#F7F9FC] rounded-3xl p-8 lg:p-12 border border-[#E5EAF2]">
            <ShieldCheck className="w-12 h-12 lg:w-14 lg:h-14 text-[#2563FF] mb-6" strokeWidth={1.5} />
            <h3 className="text-xl lg:text-2xl font-bold text-primary mb-4">Independent &amp; Unbiased</h3>
            <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed mb-6">
              We are not an insurance brokerage. We don't employ pushy sales agents, and we never sell your data to health plans. 
            </p>
            <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed">
              Our only goal is to make sure you have the best possible coverage at the lowest possible cost, without the overwhelming sales pitches.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-28 bg-[#F7F9FC] border-t border-[#E5EAF2] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2563FF] mb-4">
              How it works
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">
              Three simple steps to peace of mind
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center md:items-start md:text-left gap-5 lg:gap-6"
              >
                <div className="shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-[#EEF2FA] flex items-center justify-center text-[#2563FF]">
                  <step.icon className="w-10 h-10 lg:w-12 lg:h-12" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="flex items-start justify-center md:justify-start gap-3 text-xl lg:text-2xl font-bold text-primary tracking-tight mb-3">
                    <span className="mt-px lg:mt-0.5 shrink-0 inline-flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-[#2563FF] text-[#2563FF] text-sm lg:text-base font-bold">
                      {step.number}
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-base lg:text-lg leading-relaxed text-muted-foreground max-w-sm">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 md:py-32 bg-white scroll-mt-20 border-t border-[#E5EAF2]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <BellRing
            className="w-14 h-14 text-secondary mx-auto mb-8"
            strokeWidth={2}
          />
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-[1.1]">
            Stop worrying about missing a better Medicare plan
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            It takes two minutes to securely add your plan. We'll handle the watching.
          </p>

          <Button
            asChild
            size="lg"
            className="h-16 rounded-xl px-10 bg-[#2563FF] hover:bg-[#1E55E6] text-white font-semibold text-lg border-0 shadow-lg shadow-[#2563FF]/25"
            data-testid="button-medicare-get-started-cta"
          >
            <a href="https://app.planalert.com">Get Started Free</a>
          </Button>
          <div className="mt-8 flex items-center justify-center gap-3 text-base font-medium text-muted-foreground">
            <Lock className="w-5 h-5 text-[#2563FF]" />
            <span>Secure. Private. No spam.</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
