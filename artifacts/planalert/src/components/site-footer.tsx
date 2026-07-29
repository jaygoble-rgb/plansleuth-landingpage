import { Linkedin, Instagram, Facebook } from "lucide-react";
import { BellLogo } from "@/components/bell-logo";
import { Link } from "wouter";

const socials = [
  {
    label: "Twitter / X",
    href: "https://twitter.com/getplanalert",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/planalert",
    icon: <Linkedin className="w-[18px] h-[18px]" />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/getplanalert",
    icon: <Instagram className="w-[18px] h-[18px]" />,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@getplanalert",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.5 2h-3v13.5a2.5 2.5 0 1 1-2.5-2.5c.17 0 .34.02.5.05V9.97a5.5 5.5 0 1 0 5 5.48V8.6a6.9 6.9 0 0 0 4 1.28V6.8a3.9 3.9 0 0 1-2.83-1.2A3.9 3.9 0 0 1 16.5 2z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/planalert",
    icon: <Facebook className="w-[18px] h-[18px]" />,
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0B1B3D] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity"
        >
          <BellLogo className="h-6 w-auto" />
          <span>PlanAlert</span>
        </Link>

        <div className="text-sm text-[#8A94A8]">
          &copy; {new Date().getFullYear()} PlanAlert. All rights reserved.
        </div>

        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-[#8A94A8] hover:text-white transition-colors"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
