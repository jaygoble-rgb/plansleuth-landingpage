import { Bell, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const services = [
  { label: "Medicare", href: "/medicare" },
  { label: "Cellular", href: "/cellular" },
  { label: "Internet", href: "/internet" },
];

export type SiteNavVariant = "default" | "overlay" | "sticky";

interface SiteNavProps {
  /**
   * Layout variant.
   *  - "default": in-flow nav.
   *  - "overlay": absolutely positioned over the hero (transparent).
   *  - "sticky": pinned to the top with a translucent background and bottom border.
   */
  variant?: SiteNavVariant;
  /** @deprecated use `variant="overlay"` instead. */
  overlay?: boolean;
}

export function SiteNav({ variant, overlay = false }: SiteNavProps) {
  const resolved: SiteNavVariant = variant ?? (overlay ? "overlay" : "default");
  const [open, setOpen] = useState(false);

  const wrapperClass =
    resolved === "sticky"
      ? "sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-primary/8"
      : "";

  const innerClass = [
    "relative flex items-center justify-between p-6 md:px-12 max-w-7xl mx-auto w-full",
    resolved === "overlay" ? "absolute top-0 left-0 right-0 z-50" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const nav = (
    <nav className={innerClass}>
      <Link
        href="/"
        className="flex items-center gap-2 font-serif text-2xl font-bold text-primary hover:opacity-90 transition-opacity"
      >
        <Bell className="w-6 h-6 text-secondary fill-secondary" strokeWidth={2.5} />
        <span>PlanAlert</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        <Link
          href="/about"
          className="text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          About
        </Link>
        <Link
          href="/how-it-works"
          className="text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          How it Works
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="group flex items-center gap-1 rounded-md text-base font-medium text-primary/80 hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:text-primary"
            data-testid="button-nav-services"
          >
            Services
            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[10rem]">
            {services.map((s) => (
              <DropdownMenuItem key={s.href} asChild>
                <Link
                  href={s.href}
                  className="w-full cursor-pointer text-base font-medium text-primary/80"
                >
                  {s.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          href="/blog"
          className="text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          Blog
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <a
          href="https://app.planalert.com/getstarted"
          className="hidden sm:inline-block text-base font-medium text-primary/80 hover:text-primary transition-colors"
        >
          Sign in
        </a>
        <a
          href="https://app.planalert.com"
          className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#2563FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#2563FF]/20 hover:bg-[#1E55E6] transition-colors"
        >
          Get Started Free
        </a>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-primary hover:bg-primary/5 transition-colors"
            aria-label="Open menu"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-6 h-6" strokeWidth={2.25} />
          </SheetTrigger>
          <SheetContent side="right" className="flex w-72 flex-col sm:w-80">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
                <Bell
                  className="w-5 h-5 text-secondary fill-secondary"
                  strokeWidth={2.5}
                />
                PlanAlert
              </SheetTitle>
            </SheetHeader>

            <div className="mt-2 flex flex-col px-1">
              <SheetClose asChild>
                <Link
                  href="/about"
                  className="rounded-lg px-3 py-3 text-lg font-medium text-primary/90 hover:bg-primary/5 transition-colors"
                >
                  About
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/how-it-works"
                  className="rounded-lg px-3 py-3 text-lg font-medium text-primary/90 hover:bg-primary/5 transition-colors"
                >
                  How it Works
                </Link>
              </SheetClose>
              <div className="px-3 pt-3 pb-1 text-sm font-semibold uppercase tracking-wide text-primary/50">
                Services
              </div>
              {services.map((s) => (
                <SheetClose asChild key={s.href}>
                  <Link
                    href={s.href}
                    className="rounded-lg px-3 py-3 pl-6 text-lg font-medium text-primary/90 hover:bg-primary/5 transition-colors"
                  >
                    {s.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link
                  href="/blog"
                  className="rounded-lg px-3 py-3 text-lg font-medium text-primary/90 hover:bg-primary/5 transition-colors"
                >
                  Blog
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <a
                  href="https://app.planalert.com/getstarted"
                  className="rounded-lg px-3 py-3 text-lg font-medium text-primary/90 hover:bg-primary/5 transition-colors"
                >
                  Sign in
                </a>
              </SheetClose>
            </div>

            <div className="mt-auto px-1 pb-2">
              <SheetClose asChild>
                <a
                  href="https://app.planalert.com"
                  className="flex items-center justify-center rounded-lg bg-[#2563FF] px-5 py-3 text-base font-semibold text-white shadow-sm shadow-[#2563FF]/20 hover:bg-[#1E55E6] transition-colors"
                >
                  Get Started Free
                </a>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );

  if (resolved === "sticky") {
    return <div className={wrapperClass}>{nav}</div>;
  }
  return nav;
}

export default SiteNav;
