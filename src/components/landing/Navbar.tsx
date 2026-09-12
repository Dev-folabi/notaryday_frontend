"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/routes";
import { LOGO_URL } from "@/lib/logo";
import { navLinks } from "@/config/marketing";

export function Navbar() {
  const { isAuthenticated, user, isLoadingUser } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardRoute = () => {
    if (!user) return ROUTES.AUTH.LOGIN;
    if (user.onboarding_completed) return ROUTES.APP.TODAY;
    if (user.onboarding_step === 2) return ROUTES.ONBOARDING.SCANBACK;
    if (user.onboarding_step === 3) return ROUTES.ONBOARDING.SIGNING_TYPES;
    if (user.onboarding_step === 4) return ROUTES.ONBOARDING.PLAN;
    return ROUTES.ONBOARDING.HOME;
  };

  const isActive = (href: string) =>
    href === ROUTES.MARKETING.HOME ? pathname === href : pathname.startsWith(href);

  return (
    <div
      className={`sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b px-6 md:px-12 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg border-border/60 shadow-sm"
          : "bg-white border-border"
      }`}
    >
      <div className="flex items-center gap-8">
        <Link href={ROUTES.MARKETING.HOME} className="flex items-center gap-2.5 group">
          <div className="transition-transform duration-200 group-hover:scale-105">
            <Image
              src={LOGO_URL}
              alt="Notary Day"
              width={28}
              height={28}
              unoptimized
            />
          </div>
          <div className="font-sora text-lg font-bold tracking-[-0.3px] text-navy">
            Notary Day
          </div>
        </Link>
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative cursor-pointer text-sm font-medium transition-colors duration-200 ${
                isActive(link.href)
                  ? "text-navy"
                  : "text-slate-500 hover:text-navy"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue to-transparent" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="hidden md:flex items-center gap-5">
        {!isLoadingUser && isAuthenticated ? (
          <Link href={getDashboardRoute()}>
            <Button className="h-10 px-4 text-[13px] shadow-md hover:shadow-lg transition-all duration-200">
              Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="cursor-pointer text-sm font-medium text-slate-500 hover:text-navy transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link href={ROUTES.AUTH.SIGNUP}>
              <Button className="h-10 px-4 text-[13px] shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                Get started free
              </Button>
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-navy md:hidden transition-transform duration-200 hover:scale-105"
      >
        {menuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 z-20 border-b border-border bg-white/95 backdrop-blur-lg px-6 py-5 shadow-dropdown md:hidden animate-in slide-in-from-top duration-200">
          <nav className="mb-5 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-blue-bg text-navy"
                    : "text-slate-600 hover:bg-background hover:text-navy"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            {!isLoadingUser && isAuthenticated ? (
              <Link href={getDashboardRoute()} onClick={() => setMenuOpen(false)}>
                <Button className="h-11 w-full" fullWidth>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md border border-border px-4 py-3 text-center text-sm font-semibold text-navy transition-all duration-200 hover:bg-background"
                >
                  Sign in
                </Link>
                <Link href={ROUTES.AUTH.SIGNUP} onClick={() => setMenuOpen(false)}>
                  <Button className="h-11 w-full" fullWidth>
                    Get started free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
