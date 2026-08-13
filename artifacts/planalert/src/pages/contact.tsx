import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { useMeta } from "@/hooks/use-meta";
import { canonicalUrl } from "@/lib/site";

const CONTACT_EMAIL = "support@planalert.com";

export default function Contact() {
  useMeta({
    title: "Contact — PlanAlert",
    description:
      "Questions about PlanAlert, your account, or plan monitoring? Get in touch with the PlanAlert team.",
    canonical: canonicalUrl("/contact"),
    ogType: "website",
  });

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject || "Hello PlanAlert",
  )}&body=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30">
      <SiteNav variant="sticky" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#F7F9FC] border-b border-[#E5EAF2]">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#2563FF]/5 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-14 md:py-24 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#2563FF] mb-4">
            Contact
          </p>
          <h1 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl font-bold leading-[1.08] sm:leading-[1.05] tracking-tight text-primary text-balance">
            We'd love to hear from you
          </h1>
        </div>
      </header>

      {/* Body */}
      <section className="py-14 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
          <div className="flex items-start gap-4 rounded-2xl border border-[#E5EAF2] bg-[#F7F9FC] p-6">
            <div className="shrink-0 rounded-xl bg-[#2563FF]/10 p-3">
              <Mail className="w-6 h-6 text-[#2563FF]" />
            </div>
            <div>
              <h2 className="font-semibold text-primary text-lg mb-1">Email us</h2>
              <p className="text-muted-foreground mb-2">
                Questions about PlanAlert, your account, or plan monitoring —
                we usually reply within one business day.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[#2563FF] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">
              Send a message
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = mailtoHref;
              }}
            >
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-primary mb-1.5">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="w-full rounded-lg border border-[#E5EAF2] bg-white px-4 py-2.5 text-base text-primary placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#2563FF]/40"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-primary mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  required
                  placeholder="Tell us how we can help…"
                  className="w-full rounded-lg border border-[#E5EAF2] bg-white px-4 py-2.5 text-base text-primary placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#2563FF]/40"
                />
              </div>
              <Button type="submit" className="gap-2">
                Open in your email app
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-sm text-muted-foreground">
                This opens your email app with the message pre-filled, addressed
                to {CONTACT_EMAIL}.
              </p>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
