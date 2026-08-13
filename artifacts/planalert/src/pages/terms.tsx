import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { useMeta } from "@/hooks/use-meta";
import { canonicalUrl } from "@/lib/site";

export default function Terms() {
  useMeta({
    title: "Terms of Service — PlanAlert",
    description: "The terms that govern your use of PlanAlert.",
    canonical: canonicalUrl("/terms"),
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
            Legal
          </p>
          <h1 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl font-bold leading-[1.08] sm:leading-[1.05] tracking-tight text-primary text-balance">
            Terms of Service
          </h1>
        </div>
      </header>

      {/* Body */}
      <section className="py-14 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
          <p>[PLACEHOLDER — replace with reviewed legal copy before launch]</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
