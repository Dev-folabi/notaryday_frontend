import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <div className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6 md:px-12">
      <div className="flex items-center gap-8">
        <div>
          <div className="font-sora text-lg font-bold tracking-[-0.3px] text-navy">
            Notary Day
          </div>
        </div>
        <div className="hidden md:flex gap-6">
          <Link
            href="#features"
            className="cursor-pointer text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-navy"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="cursor-pointer text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-navy"
          >
            Pricing
          </Link>
          <Link
            href="#how-it-works"
            className="cursor-pointer text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-navy"
          >
            How it works
          </Link>
          <Link
            href="#faq"
            className="cursor-pointer text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-navy"
          >
            FAQ
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <Link
          href="/login"
          className="cursor-pointer text-sm font-medium text-slate-500 hover:text-navy"
        >
          Sign in
        </Link>
        <Link href="/signup">
          <Button className="h-10 px-4 text-[13px]">Get started free</Button>
        </Link>
      </div>
    </div>
  );
}
