interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-white px-6 pt-14 pb-10 text-center md:px-12 md:pt-[72px] md:pb-14">
      <div className="mx-auto max-w-[680px]">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          {eyebrow}
        </span>
        <h1 className="mb-4 font-sora text-[32px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-1px] text-navy">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto max-w-[560px] text-base leading-[1.7] text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
