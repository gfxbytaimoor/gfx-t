"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, findNavItem } from "@/data/navigation";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { usePageTransition } from "@/components/transitions/TransitionProvider";
import { Logo } from "@/components/brand/Logo";
import { ActionLink } from "@/components/buttons/ActionLink";
import { MenuOverlay } from "./MenuOverlay";
import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger, useGSAP, registerGsap } from "@/lib/motion";

registerGsap();

export function Header() {
  const pathname = usePathname();
  const current = findNavItem(pathname);
  // The menu belongs to the route it was opened on, so any navigation (incl. back/forward) closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { navigate } = usePageTransition();
  // The header persists across routes, so it can count in-site page views: go back when there is
  // an in-site page to return to, otherwise (landed here directly) go to Home.
  const views = useRef(0);
  useEffect(() => {
    views.current += 1;
  }, [pathname]);
  const goBack = () => (views.current > 1 ? router.back() : navigate("/"));
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          gsap.set(progressRef.current, { scaleX: self.progress });
          setScrolled(self.scroll() > 24);
        },
      });
      return () => st.kill();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-signal focus:px-4 focus:py-2 focus:text-ink-950"
      >
        Skip to content
      </a>
      <header
        className={cn(
          // Always present. Transparent over the hero; frosted glass once the page scrolls.
          // While the menu is open the header sits above it, so the ✕ replaces the hamburger in place.
          "fixed inset-x-0 top-0 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          menuOpen ? "z-[calc(var(--z-menu)+1)]" : "z-[var(--z-header)]",
          scrolled && !menuOpen
            ? "border-paper/10 bg-ink-950/75 backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
          <div className="relative z-10 flex shrink-0 items-center gap-3">
            {/* Phones: a back arrow on every page except Home. */}
            {pathname !== "/" && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Go back"
                className="grid size-11 place-items-center border border-paper/20 text-paper transition-colors hover:border-signal hover:text-signal lg:hidden"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M14 8H3M7 4 3 8l4 4" />
                </svg>
              </button>
            )}
            <TransitionLink href="/" aria-label="GFX-T — home">
              <Logo tone="paper" priority className="w-[104px] md:w-[132px]" />
            </TransitionLink>
          </div>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-2">
              {navigation.slice(1).map((item) => {
                const active = item.href === current.href;
                return (
                  <li key={item.href}>
                    <TransitionLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2 px-3 py-2.5 text-[0.9375rem] font-medium tracking-[-0.01em]",
                        active ? "text-paper" : "text-paper/75",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-1.5 transition-transform duration-300",
                          active ? "scale-100 bg-signal" : "scale-0 bg-signal group-hover:scale-100",
                        )}
                      />
                      {/* Label rolls up to a signal-yellow copy. */}
                      <span className="relative block overflow-hidden">
                        <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
                          {item.label}
                        </span>
                        <span aria-hidden className="absolute inset-0 block translate-y-full text-signal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
                          {item.label}
                        </span>
                      </span>
                      {/* Underline draws from the centre. */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-3 bottom-1 h-px origin-center bg-signal transition-transform duration-500 ease-[var(--ease-out-expo)]",
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                        )}
                      />
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden xl:block">
            <ActionLink href="/contact" variant="primary">
              Let&apos;s talk
            </ActionLink>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="relative z-10 grid size-11 place-items-center border border-paper/20 text-paper transition-colors hover:border-signal lg:hidden"
          >
            {/* Hamburger: three lines that fold into an X. */}
            <span aria-hidden className="relative block h-3.5 w-5">
              <span
                className={cn(
                  "absolute left-0 top-0 h-0.5 w-full bg-current transition-transform duration-500",
                  menuOpen && "translate-y-[6px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current transition-opacity duration-300",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-full bg-current transition-transform duration-500",
                  menuOpen && "-translate-y-[6px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
        {/* Reading progress: a single hairline path. */}
        <div
          ref={progressRef}
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-signal/70"
        />
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} currentHref={current.href} />
    </>
  );
}
