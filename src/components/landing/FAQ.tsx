import { Info } from "lucide-react";

export function FAQ() {
  const faqs = [
    [
      "Does CITT really work on the free plan?",
      "Yes — fully and without limits. The check uses OpenRouteService for real drive times, the current IRS mileage rate, and your actual schedule including scanback windows. There is no capped or degraded version on the free plan. It is the acquisition feature — we want every notary to use it.",
    ],
    [
      "What is a scanback and why does it matter?",
      "A scanback is the process of scanning and sending completed loan documents to the title company after a signing. It takes 20–45 minutes and ties you to a location. No other scheduling tool accounts for this. It is why notaries get double-booked and why routes break down.",
    ],
    [
      "Do I need to be a loan signing agent?",
      "No. General notaries, estate notaries, and hybrid signers all benefit. The scanback blocking is most valuable for LSAs, but real earnings per signing and route optimisation work for everyone who drives to clients.",
    ],
    [
      "How does the booking page work?",
      "You get a public URL at notaryday.app/book/username. Clients submit requests. The system checks your schedule in real time — including drive time and scanback windows — before confirming. You never get a booking that conflicts with an existing commitment.",
    ],
    [
      "Is my data safe?",
      "Yes. Passwords are hashed with bcrypt and never stored in plain text. Payment details are handled entirely by Stripe — Notary Day never stores card numbers. Data is hosted on Railway/Render with automated backups.",
    ],
    [
      "What happens to my data if I cancel Pro?",
      "Nothing is deleted. You move to the Free plan and Pro features are locked, but all your jobs, journal entries, mileage log, and invoices are fully preserved. Reactivate at any time and everything is exactly as you left it.",
    ],
  ];

  return (
    <div id="faq" className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          Questions
        </span>
        <h2 className="font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
          Things notaries ask us
        </h2>
      </div>
      <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2">
        {faqs.map(([q, a], i) => (
          <div
            key={i}
            className="rounded-[12px] border border-border bg-slate-50 p-5"
          >
            <div className="mb-2 flex items-start gap-2 text-sm font-semibold text-navy">
              <Info
                className="mt-0.5 h-[13px] w-[13px] shrink-0"
                strokeWidth={2}
              />
              <span>{q}</span>
            </div>
            <div className="text-[13px] leading-[1.6] text-slate-500">{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
