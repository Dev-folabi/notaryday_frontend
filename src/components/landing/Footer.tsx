export function Footer() {
  return (
    <div className="bg-navy p-12 md:px-12 md:py-12">
      <div className="mb-10 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-2 font-sora text-lg font-bold text-white">
            Notary Day
          </div>
          <p className="max-w-[240px] text-[13px] leading-[1.6] text-white/50">
            Everything you already do manually, done automatically. Smart
            scheduling for full-time mobile notaries and loan signing agents.
          </p>
        </div>
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-white/40">
            Product
          </div>
          <div className="flex flex-col gap-2">
            {[
              "Features",
              "Pricing",
              "How it works",
              "CITT explained",
              "Booking page",
            ].map((l) => (
              <span
                key={l}
                className="cursor-pointer text-[13px] text-white/60 transition-colors duration-150 hover:text-white"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-white/40">
            Resources
          </div>
          <div className="flex flex-col gap-2">
            {[
              "LSA income calculator",
              "Mileage rate guide",
              "Notary journal requirements",
              "Blog",
              "Support",
            ].map((l) => (
              <span
                key={l}
                className="cursor-pointer text-[13px] text-white/60 transition-colors duration-150 hover:text-white"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-white/40">
            Company
          </div>
          <div className="flex flex-col gap-2">
            {["About", "Privacy policy", "Terms of service", "Contact"].map(
              (l) => (
                <span
                  key={l}
                  className="cursor-pointer text-[13px] text-white/60 transition-colors duration-150 hover:text-white"
                >
                  {l}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between border-t border-white/10 pt-6 md:flex-row">
        <span className="text-[12px] text-white/35">
          © 2026 Notary Day · notaryday.app
        </span>
        <span className="mt-2 text-[12px] text-white/35 md:mt-0">
          Built for mobile notaries in the United States
        </span>
      </div>
    </div>
  );
}
