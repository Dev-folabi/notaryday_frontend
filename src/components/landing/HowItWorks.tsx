import { howItWorks } from "@/config/marketing";

export function HowItWorks({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div
      id="how-it-works"
      className="bg-slate-50 px-6 py-12 md:px-12 md:py-[72px]"
    >
      {showHeader && (
        <div className="mx-auto max-w-[600px] text-center">
          <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
            {howItWorks.eyebrow}
          </span>
          <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
            {howItWorks.title}
          </h2>
          <p className="text-base leading-[1.7] text-slate-500">
            {howItWorks.subtitle}
          </p>
        </div>
      )}
      <div className={`${showHeader ? "mt-10" : ""} mx-auto max-w-[600px]`}>
        {howItWorks.steps.map((step) => (
          <div key={step.n} className="mb-8 flex items-start gap-6">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-sora text-base font-bold text-white">
              {step.n}
            </div>
            <div>
              <div className="mb-1.5 font-sora text-base font-bold text-navy">
                {step.title}
              </div>
              <div className="text-sm leading-[1.6] text-slate-500">
                {step.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-[600px] rounded-[14px] border border-border bg-white p-7 text-center md:p-9">
        <div className="mb-2 font-sora text-xl font-bold text-navy">
          {howItWorks.nextSteps.title}
        </div>
        <p className="mb-5 text-sm leading-[1.7] text-slate-500">
          {howItWorks.nextSteps.desc}
        </p>
        <div className="flex flex-col gap-2 text-left">
          {howItWorks.nextSteps.bullets.map((bullet) => (
            <div
              key={bullet}
              className="flex items-start gap-[9px] rounded-[8px] bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-600"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"></span>
              {bullet}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
