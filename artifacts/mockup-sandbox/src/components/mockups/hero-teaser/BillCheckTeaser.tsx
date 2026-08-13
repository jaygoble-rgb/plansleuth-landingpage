import { useState } from "react";
import { ArrowRight, BellRing, Sparkles, TrendingDown } from "lucide-react";

/**
 * Interactive hero teaser for the PlanAlert homepage.
 * A bill-category picker (mirrors the real signup's "Select your service"
 * step) that reveals an ILLUSTRATIVE example of what monitoring looks like.
 * No real provider pricing — all numbers are framed as examples.
 */

const CATEGORIES = [
  { value: "cell", label: "Cell phone" },
  { value: "internet", label: "Home internet" },
  { value: "medicare", label: "Medicare" },
];

const EXAMPLE_COPY: Record<string, { watching: string; alert: string }> = {
  cell: {
    watching: "your cell plan's price, data, and the plans competing with it",
    alert:
      "\u201CA comparable plan just dropped below what you're paying \u2014 same network, same data. Time to switch or negotiate.\u201D",
  },
  internet: {
    watching: "your internet plan's price, speed tier, and local competitors",
    alert:
      "\u201CA provider in your area now offers your speed for less \u2014 your loyalty pricing is above market.\u201D",
  },
  medicare: {
    watching: "your plan's premium and the plans you could switch to at enrollment",
    alert:
      "\u201COpen enrollment is coming and plans matching your coverage are available for less.\u201D",
  },
};

export function BillCheckTeaser() {
  const [category, setCategory] = useState("cell");
  const [submitted, setSubmitted] = useState(false);

  const example = EXAMPLE_COPY[category];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl border border-[#E5EAF2] shadow-[0_8px_30px_rgba(11,31,58,0.06)] p-6 md:p-8">
          {!submitted ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <p className="text-sm font-semibold text-[#0B1F3A] mb-3">
                Which bill do you want to stop overpaying?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 h-12 rounded-xl border border-[#D7DEE9] bg-white px-4 text-[15px] text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/40"
                  aria-label="Bill category"
                  data-testid="select-bill-category"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#2563FF] text-white font-semibold text-[15px] hover:bg-[#1E54E0] transition-colors inline-flex items-center justify-center gap-2"
                  data-testid="button-show-example"
                >
                  Show me <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-[#64748B]">
                Takes 2 minutes to set up real monitoring. No spam.
              </p>
            </form>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#2563FF]" />
                <p className="text-sm font-semibold text-[#0B1F3A]">
                  Here&apos;s what monitoring could look like:
                </p>
                <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-[#64748B] bg-[#F1F5F9] rounded-full px-2.5 py-1">
                  Example
                </span>
              </div>

              <div className="rounded-xl border border-[#E5EAF2] bg-[#F7F9FC] p-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2563FF]/10 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4.5 h-4.5 text-[#2563FF]" />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#64748B] mb-0.5">
                      We&apos;d keep an eye on {example.watching}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#FFD9A0] bg-[#FFF8EC] p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F5A623]/15 flex items-center justify-center shrink-0">
                    <BellRing className="w-4.5 h-4.5 text-[#B97708]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#B97708] mb-1">
                      Example alert
                    </p>
                    <p className="text-[14px] leading-snug text-[#0B1F3A]">{example.alert}</p>
                  </div>
                </div>
              </div>

              <a
                href="https://app.planalert.com"
                className="w-full h-12 rounded-xl bg-[#2563FF] text-white font-semibold text-[15px] hover:bg-[#1E54E0] transition-colors inline-flex items-center justify-center gap-2"
                data-testid="link-get-started"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </a>
              <p className="mt-3 text-center text-xs text-[#64748B]">
                Illustrative example &mdash; real alerts are based on your actual plan and market.{" "}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="underline hover:text-[#0B1F3A]"
                  data-testid="button-try-another"
                >
                  Try another bill
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
