import { ClipboardList, LineChart, BellRing } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { useMeta } from "@/hooks/use-meta";
import { canonicalUrl } from "@/lib/site";

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

export default function HowItWorks() {
  useMeta({
    title: "How it works — PlanAlert",
    description:
      "See how PlanAlert helps you stop overpaying: tell us your plans, we monitor the market, and we alert you when a better deal appears.",
    canonical: canonicalUrl("/how-it-works"),
    ogType: "website",
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30">
      <SiteNav variant="sticky" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#F7F9FC] border-b border-[#E5EAF2]">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#2563FF]/5 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-14 md:py-24 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#2563FF] mb-4">
            How it works
          </p>
          <h1 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl font-bold leading-[1.08] sm:leading-[1.05] tracking-tight text-primary text-balance">
            Three simple steps to start saving
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            Set it up once and let PlanAlert do the watching. Here's exactly how
            it works.
          </p>
        </div>
      </header>

      {/* Steps */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-5 text-left">
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

      {/* Walkthrough */}
      <section className="pb-20 md:pb-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
              Follow along
            </h2>
            <p className="mt-3 text-base md:text-lg text-muted-foreground">
              A step-by-step walkthrough of getting started with PlanAlert.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#E5EAF2] shadow-sm bg-white">
            <iframe
              src="https://scribehow.com/o/X_25OUPkTXa7w9SQPJ0u4w/viewer/How_to_start_monitoring_your_plans__4Wob1c6DQsaCIR5Kw_J9FA"
              title="How to start monitoring your plans"
              allow="fullscreen"
              className="w-full block"
              style={{ aspectRatio: "1 / 1", border: 0, minHeight: 480 }}
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
