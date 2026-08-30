interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="bg-white px-6 py-14 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[720px]">
        <h1 className="mb-2 font-sora text-[32px] font-extrabold leading-[1.1] tracking-[-1px] text-navy">
          {title}
        </h1>
        <p className="mb-6 text-xs font-medium text-slate-400">{updated}</p>
        <p className="mb-10 text-sm leading-[1.8] text-slate-600">{intro}</p>
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-2 font-sora text-base font-bold text-navy">
                {section.heading}
              </h2>
              <p className="text-sm leading-[1.8] text-slate-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
