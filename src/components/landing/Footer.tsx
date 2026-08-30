import Link from "next/link";
import Image from "next/image";
import { FOOTER_LOGO_URL } from "@/lib/logo";
import { footer, site } from "@/config/marketing";

export function Footer() {
  return (
    <div className="bg-navy p-12 md:px-12 md:py-12">
      <div className="mb-10 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Image
            src={FOOTER_LOGO_URL}
            alt={site.name}
            width={128}
            height={40}
            unoptimized
            className="mb-2"
          />
          <p className="max-w-[240px] text-[13px] leading-[1.6] text-white/50">
            {footer.description}
          </p>
        </div>
        {footer.columns.map((column) => (
          <div key={column.title}>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-white/40">
              {column.title}
            </div>
            <div className="flex flex-col gap-2">
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="cursor-pointer text-[13px] text-white/60 transition-colors duration-150 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-between border-t border-white/10 pt-6 md:flex-row">
        <span className="text-[12px] text-white/35">{footer.bottomLeft}</span>
        <span className="mt-2 text-[12px] text-white/35 md:mt-0">
          {footer.bottomRight}
        </span>
      </div>
    </div>
  );
}
