export function HowItWorks() {
  const steps = [
    {
      n: 1,
      t: "Set your home base",
      d: "The address you start your day from. Used to calculate your first and last drive of the day. Never shown to clients.",
    },
    {
      n: 2,
      t: "Set your scanback duration",
      d: "How long your typical scanback takes. Notary Day blocks this time after every Loan Refi or Hybrid automatically.",
    },
    {
      n: 3,
      t: "Choose your signing types",
      d: "Loan Refi, General, Hybrid, Estate. Your booking page and Gap Finder will only surface the jobs that match what you do.",
    },
    {
      n: 4,
      t: "Start using Can I Take This?",
      d: "The first time you get a new signing request, tap the CITT button. You'll see why notaries tell their colleagues about this one.",
    },
  ];

  return (
    <div
      id="how-it-works"
      className="bg-slate-50 px-6 py-12 md:px-12 md:py-[72px]"
    >
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          Get started in minutes
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
          Three questions. Then you&apos;re running.
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          Onboarding takes under 3 minutes. Three questions — and every feature
          that matters works from day one.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-[600px]">
        {steps.map((s, i) => (
          <div key={i} className="mb-8 flex items-start gap-6">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-sora text-base font-bold text-white">
              {s.n}
            </div>
            <div>
              <div className="mb-1.5 font-sora text-base font-bold text-navy">
                {s.t}
              </div>
              <div className="text-sm leading-[1.6] text-slate-500">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
