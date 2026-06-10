import {
  ArrowRight,
  Play,
  Lock,
  ClipboardList,
  LineChart,
  BellRing,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import DashboardMockup from "@/components/dashboard-mockup";
import { useMeta } from "@/hooks/use-meta";

const steps = [
  {
    icon: ClipboardList,
    number: "1",
    title: "Identify your plans",
    body: "Tell us about your current household plans.",
  },
  {
    icon: LineChart,
    number: "2",
    title: "We analyze the market",
    body: "Our system compares thousands of plans to find better options.",
  },
  {
    icon: BellRing,
    number: "3",
    title: "Get alerts & start saving",
    body: "We notify you when better plans become available.",
  },
];

export default function Home() {
  useMeta({
    title: "PlanAlert — Never overpay for household plans again",
    description:
      "Tell us about your current plan and we'll compare it against the market - then monitor it continuously so you always know when a better plan becomes available.",
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30 overflow-x-hidden">
      <SiteNav variant="sticky" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#F7F9FC]">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#2563FF]/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          <div className="min-w-0 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
            <h1 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.07] sm:leading-[1.05] tracking-tight text-primary">
              Never overpay for household plans again.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Tell us about your current plan and we'll compare it against the
              market - then monitor it continuously so you always know when a
              better plan becomes available.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-xl px-7 bg-[#2563FF] hover:bg-[#1E55E6] text-white text-base font-semibold border-0 shadow-lg shadow-[#2563FF]/25"
                data-testid="button-start-monitoring"
              >
                <a href="https://app.planalert.com">
                  Start Monitoring
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-xl px-7 bg-white text-primary text-base font-semibold border border-[#E5EAF2] gap-3"
                data-testid="button-see-how"
              >
                <Link href="/how-it-works">
                  <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-primary text-white">
                    <Play className="w-2.5 h-2.5 fill-white" />
                  </span>
                  See How It Works
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Secure. Private. No spam.
            </div>
          </div>

          <div className="min-w-0 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-6 duration-1000 fill-mode-both delay-150">
            <DashboardMockup />
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 md:py-28 bg-white border-t border-[#E5EAF2] scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2563FF] mb-4">
              How it works
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">
              Three simple steps to start saving
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-5 text-left"
              >
                <div className="shrink-0 w-20 h-20 rounded-full bg-[#EEF2FA] flex items-center justify-center text-[#2563FF]">
                  <step.icon className="w-9 h-9" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-primary tracking-tight">
                    <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full border-[1.5px] border-[#2563FF] text-[#2563FF] text-xs font-bold">
                      {step.number}
                    </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground max-w-[270px]">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section id="get-started" className="py-24 md:py-28 scroll-mt-20 bg-[#F7F9FC]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <BellRing
            className="w-14 h-14 text-secondary mx-auto mb-8"
            strokeWidth={2}
          />
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-5">
            Get alerts &amp; start saving
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            It takes two minutes to set up. We'll handle the watching.
          </p>

          <Button
            asChild
            size="lg"
            className="h-14 rounded-xl px-8 bg-[#2563FF] hover:bg-[#1E55E6] text-white font-semibold text-base border-0"
            data-testid="button-get-started-cta"
          >
            <a href="https://app.planalert.com">Get Started Free</a>
          </Button>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            Secure. Private. No spam.
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
