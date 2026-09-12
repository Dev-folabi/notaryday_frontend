"use client";

import Link from "next/link";
import Image from "next/image";
import { FOOTER_LOGO_URL } from "@/lib/logo";
import { footer, site } from "@/config/marketing";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";

export function Footer() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-active to-navy p-12 md:px-12 md:py-12">
      {/* Subtle gradient orbs */}
      <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <AnimateIn variant="fade">
          <div className="mb-10 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Image
                src={FOOTER_LOGO_URL}
                alt={site.name}
                width={128}
                height={40}
                unoptimized
                className="mb-2 transition-opacity hover:opacity-80"
              />
              <p className="max-w-[240px] text-[13px] leading-[1.6] text-white/50">
                {footer.description}
              </p>
            </div>
            {footer.columns.map((column, index) => (
              <div key={column.title}>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-white/40">
                  {column.title}
                </div>
                <div className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group cursor-pointer text-[13px] text-white/60 transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 h-[1px] bg-blue group-hover:w-2 transition-all duration-200" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>

        <div className="flex flex-col items-center justify-between border-t border-white/10 pt-6 md:flex-row">
          <span className="text-[12px] text-white/35">{footer.bottomLeft}</span>
          <span className="mt-2 text-[12px] text-white/35 md:mt-0">
            {footer.bottomRight}
          </span>
        </div>
      </div>
    </div>
  );
}
