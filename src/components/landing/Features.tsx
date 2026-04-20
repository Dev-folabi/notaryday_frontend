import {
  Zap,
  CalendarDays,
  Sparkles,
  DollarSign,
  Mail,
  BookOpen,
} from "lucide-react";

export function Features() {
  const features = [
    {
      ic: "bg-blue-50",
      icColor: "text-blue-600",
      icon: <Zap className="h-5 w-5" />,
      title: "Can I Take This?",
      desc: "Paste any signing request and get an instant answer: does it fit your schedule (accounting for scanbacks), and what will you actually net after mileage? Free, unlimited, forever. This is the feature notaries tell other notaries about.",
      badge: "free",
    },
    {
      ic: "bg-slate-50",
      icColor: "text-navy",
      icon: <CalendarDays className="h-5 w-5" />,
      title: "Smart Day Planner",
      desc: "Every morning your day is laid out for you — jobs sequenced in the most efficient geographic order, scanback windows blocked, drive times calculated. You open the app and start driving.",
      badge: "pro",
    },
    {
      ic: "bg-violet-100",
      icColor: "text-violet-600",
      icon: <Sparkles className="h-5 w-5" />,
      title: "Gap Finder",
      desc: "After your route is optimised, Notary Day scans your pending jobs and surfaces the ones that fit into free windows — based on their location, your drive time, and your scanback commitments.",
      badge: "pro",
    },
    {
      ic: "bg-teal-50",
      icColor: "text-teal-600",
      icon: <DollarSign className="h-5 w-5" />,
      title: "Real earnings per signing",
      desc: "The offered fee is never the real number. Every CITT check shows you: fee minus round-trip mileage at the IRS rate. You know your actual hourly rate before you commit.",
      badge: "free",
    },
    {
      ic: "bg-amber-50",
      icColor: "text-amber-600",
      icon: <Mail className="h-5 w-5" />,
      title: "Email import",
      desc: "Forward your Snapdocs or SigningOrder confirmation email and the job appears in your schedule automatically — address, time, fee, signing type all extracted by AI. A CITT check runs immediately.",
      badge: "pro",
    },
    {
      ic: "bg-slate-50",
      icColor: "text-navy",
      icon: <BookOpen className="h-5 w-5" />,
      title: "Notarial journal",
      desc: "A legally compliant record of every notarial act you perform. Auto-populated from your jobs. Searchable, filterable, and exportable. Satisfies state requirements in California, Texas, Florida, and more.",
      badge: "free",
    },
  ];

  return (
    <div id="features" className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          Everything in one place
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
          Built for how you actually work
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          Five core features. Each one solves a real daily pain. None of them
          exist in any other notary tool.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={i}
            className="rounded-[14px] border border-border bg-slate-50 p-6"
          >
            <div
              className={`mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] ${f.ic} ${f.icColor}`}
            >
              {f.icon}
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
        ))}
      </div>
    </div>
  );
}
