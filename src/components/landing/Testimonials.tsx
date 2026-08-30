import { testimonials } from "@/config/marketing";

export function Testimonials() {
  return (
    <div className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          {testimonials.eyebrow}
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
          {testimonials.title}
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          {testimonials.subtitle}
        </p>
      </div>
      <div className="mt-[36px] grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.items.map((t) => (
          <div
            key={t.name}
            className="rounded-[14px] border border-border bg-slate-50 p-[22px]"
          >
            <div className="mb-4 text-sm italic leading-[1.7] text-slate-600">
              {t.quote}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {t.init}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-navy">
                  {t.name}
                </div>
                <div className="text-[11px] text-slate-400">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
