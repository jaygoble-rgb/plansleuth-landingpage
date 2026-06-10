import { ArrowRight, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { useMeta } from "@/hooks/use-meta";

const BASE = import.meta.env.BASE_URL;

export default function About() {
  useMeta({
    title: "About PlanAlert — Built to close the loyalty gap",
    description:
      "PlanAlert exists to close the loyalty gap. We watch the market so households stop absorbing the loyalty tax on cellular, internet, and other everyday plans.",
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30">
      <SiteNav variant="sticky" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#F7F9FC] border-b border-[#E5EAF2]">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#2563FF]/5 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2563FF] mb-4">
            About
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-primary">
            Built to close
            <br />
            the loyalty gap
          </h1>
        </div>
      </header>

      {/* Story body */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Somewhere along the way, most of us just accepted that we're probably
            paying more than we should for things like our phone plan or internet
            service. It's not that we don't care — it's that keeping up with it
            feels like another job, and life is already full enough.
          </p>
          <p>
            The thing is, service plans change constantly. Providers update their
            offerings, new options come to market, rates shift — and none of that
            gets communicated back to existing customers in any useful way. So the
            plan you signed up for two years ago might look pretty different
            compared to what's available today, and you'd have no way of knowing
            unless you went looking.{" "}
            <span className="font-semibold text-primary">
              That gap has a name — the loyalty tax — and most households are
              absorbing it without realizing it.
            </span>
          </p>
          <p>
            We built PlanAlert because we think that's a solvable problem. You
            shouldn't have to become a semi-professional comparison shopper just
            to stay on a reasonably good plan.
          </p>
          <p>
            The way it works is pretty simple: you tell us what plans you're on,
            and we watch the market for you. When something meaningfully better
            comes along, we let you know — not a generic list of options, but a
            real comparison against what you're actually paying right now. You can
            act on it or ignore it, but at least you'll know.
          </p>
          <p>
            We're starting with cellular and internet, where plan changes are
            frequent and the savings opportunities tend to be significant. Over
            time, we'll be expanding into insurance, loans, and other household
            services — the goal is eventually having one place that's quietly
            watching all of it for you.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 md:py-28 bg-[#F7F9FC] border-t border-[#E5EAF2]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <BellRing
            className="w-14 h-14 text-secondary mx-auto mb-8"
            strokeWidth={2}
          />
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-5">
            Stop absorbing the loyalty tax
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            It takes two minutes to set up. We'll handle the watching.
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 rounded-xl px-8 bg-[#2563FF] hover:bg-[#1E55E6] text-white font-semibold text-base border-0"
            data-testid="button-about-get-started"
          >
            <a href={`${BASE}#get-started`}>
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
