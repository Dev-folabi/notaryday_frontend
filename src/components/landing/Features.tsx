import { features, featuresPage, moreFeatures } from "@/config/marketing";
import { iconMap } from "@/components/landing/icons";

export function Features({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      {showHeader && (
        <div className="mx-auto max-w-[600px] text-center">
          <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
            {featuresPage.eyebrow}
          </span>
          <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
            {featuresPage.title}
          </h2>
          <p className="text-base leading-[1.7] text-slate-500">
            {featuresPage.subtitle}
          </p>
        </div>
      )}
      <div className={`${showHeader ? "mt-10" : ""} grid grid-cols-1 gap-7 md:grid-cols-3`}>
        {features.map((f) => {
          const Icon = iconMap[f.icon];
          return (
            <div
              key={f.title}
              id={f.id}
              className="scroll-mt-24 rounded-[14px] border border-border bg-slate-50 p-6"
            >
              <div className="mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-blue-50 text-blue-600">
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              <div className="mb-2 font-sora text-base font-bold text-navy">
                {f.title}
              </div>
              <div className="text-[13px] leading-[1.6] text-slate-500">
                {f.desc}
              </div>
              <span
                className={`mt-2.5 inline-block rounded md:rounded-md px-2 py-[3px] text-[10px] font-semibold ${
                  f.badge === "free"
                    ? "border border-teal-200 bg-teal-50 text-teal-700"
                    : "border border-amber-200 bg-amber-50 text-amber-600"
                }`}
              >
                {f.badge === "free" ? "Free forever" : "Pro feature"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-20 max-w-[600px] text-center">
        <h3 className="mb-3 font-sora text-2xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
          {featuresPage.moreTitle}
        </h3>
        <p className="text-base leading-[1.7] text-slate-500">
          {featuresPage.moreSubtitle}
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-3">
        {moreFeatures.map((f) => {
          const Icon = iconMap[f.icon];
          return (
            <div
              key={f.title}
              className="rounded-[14px] border border-border bg-slate-50 p-6"
            >
              <div className="mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-navy text-white">
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              <div className="mb-2 font-sora text-base font-bold text-navy">
                {f.title}
              </div>
              <div className="text-[13px] leading-[1.6] text-slate-500">
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
