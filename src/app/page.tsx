import Link from "next/link";
import {
  Zap,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DollarSign,
  Mail,
  Scan,
  Info,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── NAV ── */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-sora font-bold text-[18px] text-primary-navy tracking-[-0.3px]">
              Notary Day
            </span>
            <nav className="hidden md:flex items-center gap-6">
              {["Features", "Pricing", "How it works", "FAQ"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                  className="font-inter text-sm font-medium text-slate-secondary hover:text-primary-navy transition-colors"
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-inter text-sm font-medium text-slate-secondary hover:text-primary-navy transition-colors px-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-10 px-[18px] inline-flex items-center hover:bg-navy-active transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-white pt-[72px] pb-16 px-6 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-navy text-white rounded-full px-[14px] py-[6px] text-[11px] font-bold tracking-[0.3px] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-pro-gold" />
            Now in beta · Free plan available
          </div>
          <h1 className="font-sora font-extrabold text-[52px] lg:text-[64px] text-primary-navy leading-[1.1] tracking-[-1.5px] mb-6">
            Your signing day,
            <br />
            <em className="text-interactive-blue not-italic">
              planned for you.
            </em>
          </h1>
          <p className="font-inter text-lg text-slate-secondary leading-[1.7] max-w-xl mx-auto mb-9">
            The only scheduling tool built for how mobile notaries actually work
            — signings, mandatory scanbacks, mileage costs, and all. Know your
            real earnings before you accept any job.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary-navy text-white font-inter font-semibold text-[15px] rounded-[10px] h-[52px] px-7 hover:bg-navy-active transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Start for free — no credit card
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-navy border border-border font-inter font-semibold text-[15px] rounded-[10px] h-[52px] px-6 hover:border-primary-navy transition-colors"
            >
              <Zap className="w-4 h-4" />
              Try Can I Take This?
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
            {[
              "Free plan · unlimited jobs",
              "Pro from $19.99/month",
              "No commitment · cancel any time",
            ].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-success" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className="bg-bg py-0 pb-0 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-[12px] font-semibold text-slate-secondary uppercase tracking-[0.5px] pt-10 mb-5">
            The Smart Day Planner in action
          </p>
          <div className="border border-border rounded-[14px] overflow-hidden shadow-xl shadow-primary-navy/10">
            <div className="bg-primary-navy px-[18px] py-3 flex justify-between items-center">
              <div>
                <div className="font-sora font-bold text-[13px] text-white">
                  Tuesday, Mar 18
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">
                  4 signings · Route optimised
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-white/45">Est. net</div>
                  <div className="font-sora font-bold text-[18px] text-pro-gold">
                    $412
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-white/45">Drive time</div>
                  <div className="font-sora font-bold text-[18px] text-white">
                    1h 22m
                  </div>
                </div>
              </div>
            </div>
            {/* Job 1 */}
            <div className="bg-white px-[18px] py-3 flex justify-between border-b border-border">
              <div>
                <div className="text-[12px] font-bold text-primary-navy mb-0.5">
                  9:00 AM · 45 min
                </div>
                <div className="text-[11px] text-slate-secondary mb-1.5">
                  3847 Wilshire Blvd, Los Angeles
                </div>
                <div className="flex gap-1.5">
                  <span className="bg-blue-bg text-interactive-blue text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Loan Refi
                  </span>
                  <span className="bg-bg text-slate-secondary text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">
                    Snapdocs
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-bold text-teal-success">
                  $175
                </div>
                <div className="text-[10px] text-slate-secondary">
                  net after mileage
                </div>
              </div>
            </div>
            {/* Scanback */}
            <div className="bg-amber-bg border-l-2 border-amber-warning px-[18px] py-2.5 border-b border-border">
              <span className="text-[11px] italic text-amber-warning flex items-center gap-1.5">
                <Scan className="w-[11px] h-[11px]" />
                Scanback — Job #1 · 9:45–10:15 AM · Auto-blocked
              </span>
            </div>
            {/* Job 2 */}
            <div className="bg-white px-[18px] py-3 flex justify-between border-b border-border">
              <div>
                <div className="text-[12px] font-bold text-primary-navy mb-0.5">
                  10:28 AM · 30 min
                </div>
                <div className="text-[11px] text-slate-secondary mb-1.5">
                  917 S Olive St, Los Angeles
                </div>
                <div className="flex gap-1.5">
                  <span className="bg-teal-bg text-teal-success text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    General
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-bold text-amber-warning">
                  $95
                </div>
                <div className="text-[10px] text-slate-secondary">
                  net after mileage
                </div>
              </div>
            </div>
            {/* Gap Finder */}
            <div className="bg-gap-finder-bg border-l-2 border-violet-600 px-[18px] py-2.5">
              <div className="text-[11px] font-bold text-violet-600 flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-[10px] h-[10px]" />
                Gap opportunity · 2:00 PM · 90 min available
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-secondary">
                  1847 Crenshaw Blvd, Hawthorne · $125 offered
                </span>
                <span className="text-[11px] font-bold text-teal-success">
                  Est. $108 net →
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-[12px] text-muted mt-4 pb-12">
            Route optimised · Scanback auto-blocked · Gap opportunity surfaced —
            all automatically
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-primary-navy py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            ["4.4M", "Notaries in the US"],
            ["$150–$200", "Per signing average"],
            ["85 min", "Drive time saved daily"],
            ["$0", "To get started today"],
          ].map(([v, l]) => (
            <div
              key={l}
              className="text-center py-6 px-4 border-r border-white/10 last:border-r-0"
            >
              <span className="font-sora font-bold text-[32px] text-white block tracking-[-0.5px]">
                {v}
              </span>
              <span className="text-[12px] text-white/50 mt-1 block">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCANBACK CALLOUT ── */}
      <section className="bg-white py-[72px] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <span className="inline-block bg-blue-bg text-interactive-blue border border-blue-b rounded-full px-[14px] py-1 text-[11px] font-bold tracking-[0.3px] mb-3">
              The problem no tool solves
            </span>
            <h2 className="font-sora font-bold text-[36px] text-primary-navy tracking-[-0.5px] mb-3 leading-[1.2]">
              After every loan signing, you&apos;re locked for 30 minutes
            </h2>
            <p className="font-inter text-base text-slate-secondary leading-[1.7]">
              Every tool plans your schedule as if signings end when you walk
              out the door. But after every Loan Refi or Hybrid, you have to
              scan and send the documents — 20–45 minutes. You can&apos;t drive.
              You can&apos;t start the next job. Every tool ignores this. Notary
              Day doesn&apos;t.
            </p>
          </div>
          <div className="bg-primary-navy rounded-[16px] p-10 lg:p-12 flex flex-col lg:flex-row gap-10 items-center mx-0">
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.5px] mb-2.5">
                What no other tool does
              </div>
              <div className="font-sora font-bold text-[22px] text-white mb-3 leading-[1.3]">
                Scanback auto-blocking
              </div>
              <p className="font-inter text-sm text-white/65 leading-[1.7] mb-5">
                Notary Day inserts a time block after every loan signing
                automatically — equal to your actual scanback duration. Your day
                will never be double-booked.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "Auto-inserted after every Loan Refi or Hybrid signing",
                  "Duration based on your real scanback time (configurable per job)",
                  "CITT checks honour it — no false positives",
                  "Route engine builds around it, not through it",
                ].map((f) => (
                  <div
                    key={f}
                    className="flex items-start gap-2.5 text-[13px] text-white/75"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-success flex-shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-bg border border-amber-b rounded-[12px] p-5 shrink-0 w-full lg:w-[220px]">
              <div className="text-[11px] font-semibold text-amber-warning uppercase tracking-[0.5px] mb-2.5">
                Your calendar
              </div>
              {[
                { t: "9:00 AM", l: "Loan Refi · Wilshire Blvd", isJob: true },
                { t: "9:45 AM", l: "Scanback — Job #1 (auto)", isScan: true },
                { t: "10:15 AM", l: "12 min drive", isDrive: true },
                { t: "10:28 AM", l: "General · Olive St", isJob: true },
              ].map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] mb-1.5 ${
                    r.isScan
                      ? "border-l-[3px] border-amber-warning bg-white"
                      : r.isDrive
                        ? "opacity-60"
                        : "bg-white"
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold w-[52px] shrink-0 ${r.isScan ? "text-amber-warning" : "text-muted"}`}
                  >
                    {r.t}
                  </span>
                  <span
                    className={`text-[12px] font-medium ${r.isScan ? "text-amber-warning italic" : "text-primary-navy"}`}
                  >
                    {r.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-[72px] px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block bg-blue-bg text-interactive-blue border border-blue-b rounded-full px-[14px] py-1 text-[11px] font-bold tracking-[0.3px] mb-3">
              Everything in one place
            </span>
            <h2 className="font-sora font-bold text-[36px] text-primary-navy tracking-[-0.5px] mb-3 leading-[1.2]">
              Built for how you actually work
            </h2>
            <p className="font-inter text-base text-slate-secondary leading-[1.7]">
              Five core features. Each one solves a real daily pain.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              {
                icon: <Zap className="w-5 h-5" />,
                bg: "bg-blue-bg text-interactive-blue",
                title: "Can I Take This?",
                desc: "Paste any signing request and get an instant answer: does it fit your schedule (accounting for scanbacks), and what will you actually net after mileage? Free, unlimited, forever.",
                badge: "free",
              },
              {
                icon: <CalendarDays className="w-5 h-5" />,
                bg: "bg-bg text-primary-navy",
                title: "Smart Day Planner",
                desc: "Every morning your day is laid out for you — jobs sequenced in the most efficient geographic order, scanback windows blocked, drive times calculated. You open the app and start driving.",
                badge: "pro",
              },
              {
                icon: <Sparkles className="w-5 h-5" />,
                bg: "bg-gap-finder-bg text-violet-600",
                title: "Gap Finder",
                desc: "After your route is optimised, Notary Day scans your pending jobs and surfaces the ones that fit into free windows — based on their location, drive time, and scanback commitments.",
                badge: "pro",
              },
              {
                icon: <DollarSign className="w-5 h-5" />,
                bg: "bg-teal-bg text-teal-success",
                title: "Real earnings per signing",
                desc: "The offered fee is never the real number. Every CITT check shows you: fee minus round-trip mileage at the IRS rate. You know your actual hourly rate before you commit.",
                badge: "free",
              },
              {
                icon: <Mail className="w-5 h-5" />,
                bg: "bg-amber-bg text-amber-warning",
                title: "Email import",
                desc: "Forward your Snapdocs or SigningOrder confirmation email and the job appears in your schedule automatically — address, time, fee, signing type all extracted by AI.",
                badge: "pro",
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                bg: "bg-bg text-primary-navy",
                title: "Notarial journal",
                desc: "A legally compliant record of every notarial act you perform. Auto-populated from your jobs. Searchable, filterable, and exportable. Satisfies state requirements in CA, TX, FL and more.",
                badge: "free",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-bg border border-border rounded-[14px] p-6"
              >
                <div
                  className={`w-11 h-11 rounded-[10px] flex items-center justify-center mb-3.5 ${f.bg}`}
                >
                  {f.icon}
                </div>
                <div className="font-sora font-bold text-[16px] text-primary-navy mb-2">
                  {f.title}
                </div>
                <div className="font-inter text-[13px] text-slate-secondary leading-[1.6] mb-3">
                  {f.desc}
                </div>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                    f.badge === "free"
                      ? "bg-teal-bg text-teal-success border-teal-b"
                      : "bg-amber-bg text-amber-warning border-amber-b"
                  }`}
                >
                  {f.badge === "free" ? "Free forever" : "Pro feature"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-[72px] px-6 lg:px-12 bg-bg">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-blue-bg text-interactive-blue border border-blue-b rounded-full px-[14px] py-1 text-[11px] font-bold tracking-[0.3px] mb-3">
              Get started in minutes
            </span>
            <h2 className="font-sora font-bold text-[36px] text-primary-navy tracking-[-0.5px] mb-3 leading-[1.2]">
              Three questions. Then you&apos;re running.
            </h2>
            <p className="font-inter text-base text-slate-secondary leading-[1.7]">
              Onboarding takes under 3 minutes — and every feature that matters
              works from day one.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            {[
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
            ].map((s) => (
              <div key={s.n} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-primary-navy text-white font-sora font-bold text-[16px] flex items-center justify-center shrink-0 mt-0.5">
                  {s.n}
                </div>
                <div>
                  <div className="font-sora font-bold text-[16px] text-primary-navy mb-1.5">
                    {s.t}
                  </div>
                  <div className="font-inter text-sm text-slate-secondary leading-[1.6]">
                    {s.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-[72px] px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-9">
            <span className="inline-block bg-blue-bg text-interactive-blue border border-blue-b rounded-full px-[14px] py-1 text-[11px] font-bold tracking-[0.3px] mb-3">
              From notaries like you
            </span>
            <h2 className="font-sora font-bold text-[36px] text-primary-navy tracking-[-0.5px] mb-3 leading-[1.2]">
              They were using Google Maps and a spreadsheet
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                q: '"After mileage I sometimes made almost nothing on a signing. I had no way to know that before accepting. I needed the number before I committed."',
                name: "Carline S.",
                role: "LSA · Anaheim, CA · 8–10 signings/day",
                init: "CS",
              },
              {
                q: '"I screenshot the address, drop it in Maps, estimate the drive, multiply by 67 cents, do the subtraction in my head. Every single job. There has to be a better way."',
                name: "Sarah G.",
                role: "LSA · Houston, TX · 5–6 signings/day",
                init: "SG",
              },
              {
                q: `\"I do 14 signings on a good day. By signing 6 I have no idea if I'm even making money. I need something that tells me the route and the number at the same time.\"`,
                name: "Anonymous",
                role: "LSA · Los Angeles metro · 12–14 signings/day",
                init: "LA",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-bg border border-border rounded-[14px] p-[22px]"
              >
                <div className="font-inter text-sm text-slate-body leading-[1.7] mb-4 italic">
                  {t.q}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary-navy text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                    {t.init}
                  </div>
                  <div>
                    <div className="font-inter text-sm font-semibold text-primary-navy">
                      {t.name}
                    </div>
                    <div className="font-inter text-[11px] text-muted">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-[72px] px-6 lg:px-12 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block bg-blue-bg text-interactive-blue border border-blue-b rounded-full px-[14px] py-1 text-[11px] font-bold tracking-[0.3px] mb-3">
              Simple pricing
            </span>
            <h2 className="font-sora font-bold text-[36px] text-primary-navy tracking-[-0.5px] mb-3 leading-[1.2]">
              Start free. Upgrade when it pays for itself.
            </h2>
            <p className="font-inter text-base text-slate-secondary leading-[1.7]">
              Pro pays for itself in under one extra signing per month.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white border border-border rounded-[12px] p-[22px] flex flex-col">
              <span className="inline-block bg-border text-slate-body text-[10px] font-bold uppercase tracking-[0.2px] px-2 py-0.5 rounded mb-3 w-fit">
                Free
              </span>
              <div className="font-sora font-bold text-[28px] text-primary-navy leading-none mb-0.5">
                $0{" "}
                <span className="text-[14px] font-normal text-slate-secondary">
                  forever
                </span>
              </div>
              <p className="text-[12px] text-muted mb-4">
                No credit card. No expiry.
              </p>
              <div className="h-px bg-border mb-3.5" />
              {[
                "Unlimited job storage",
                "Can I Take This? (full accuracy, unlimited)",
                "Real earnings calculator (IRS mileage rate)",
                "Notarial journal (legally compliant)",
                "Manual mileage log",
                "Basic income summary",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-1.5 mb-2 text-[12px] text-slate-secondary"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-success shrink-0 mt-0.5" />{" "}
                  {f}
                </div>
              ))}
              <Link
                href="/signup"
                className="mt-5 h-11 inline-flex items-center justify-center font-inter font-semibold text-sm bg-white border border-primary-navy text-primary-navy rounded-button hover:bg-bg transition-colors"
              >
                Start for free
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-white border-2 border-primary-navy rounded-[12px] p-[22px] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block bg-pro-gold text-primary-navy text-[10px] font-bold uppercase tracking-[0.2px] px-2 py-0.5 rounded w-fit">
                  Pro
                </span>
                <span className="text-[11px] font-medium text-teal-success">
                  Most popular
                </span>
              </div>
              <div className="font-sora font-bold text-[28px] text-primary-navy leading-none mb-0.5">
                $19.99{" "}
                <span className="text-[14px] font-normal text-slate-secondary">
                  /month
                </span>
              </div>
              <p className="text-[12px] text-muted mb-1">
                or $199.99/year — save $40
              </p>
              <p className="text-[12px] font-medium text-teal-success mb-4">
                Less than the fee from one extra signing.
              </p>
              <div className="h-px bg-border mb-3.5" />
              {[
                "Everything in Free",
                "Route optimisation + scanback blocking",
                "Gap Finder (pending jobs that fit your day)",
                "Booking page (notaryday.app/book/you)",
                "Email import from Snapdocs + SigningOrder",
                "One-tap invoicing + payment links",
                "Auto GPS mileage tracking",
                "Tax report export (IRS Schedule C ready)",
                "Appointment reminders to clients",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-1.5 mb-2 text-[12px] text-slate-secondary"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-success shrink-0 mt-0.5" />{" "}
                  {f}
                </div>
              ))}
              <Link
                href="/signup"
                className="mt-5 h-11 inline-flex items-center justify-center gap-1.5 font-inter font-semibold text-sm bg-pro-gold text-primary-navy rounded-button hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-4 h-4" /> Start Pro — $19.99/month
              </Link>
              <p className="text-[11px] text-muted text-center mt-2">
                Cancel any time · No commitment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-[72px] px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-9">
            <span className="inline-block bg-blue-bg text-interactive-blue border border-blue-b rounded-full px-[14px] py-1 text-[11px] font-bold tracking-[0.3px] mb-3">
              Questions
            </span>
            <h2 className="font-sora font-bold text-[36px] text-primary-navy tracking-[-0.5px] leading-[1.2]">
              Things notaries ask us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              [
                "Does CITT really work on the free plan?",
                "Yes — fully and without limits. The check uses OpenRouteService for real drive times, the current IRS mileage rate, and your actual schedule including scanback windows. There is no capped or degraded version on the free plan.",
              ],
              [
                "What is a scanback and why does it matter?",
                "A scanback is the process of scanning and sending completed loan documents to the title company after a signing. It takes 20–45 minutes and ties you to a location. No other scheduling tool accounts for this.",
              ],
              [
                "Do I need to be a loan signing agent?",
                "No. General notaries, estate notaries, and hybrid signers all benefit. The scanback blocking is most valuable for LSAs, but real earnings per signing and route optimisation work for everyone who drives to clients.",
              ],
              [
                "How does the booking page work?",
                "You get a public URL at notaryday.app/book/username. Clients submit requests. The system checks your schedule in real time — including drive time and scanback windows — before confirming.",
              ],
              [
                "Is my data safe?",
                "Yes. Passwords are hashed with bcrypt and never stored in plain text. Data is hosted with automated backups. Sessions are encrypted and expire automatically.",
              ],
              [
                "What happens to my data if I cancel Pro?",
                "Nothing is deleted. You move to the Free plan and Pro features are locked, but all your jobs, journal entries, mileage log, and invoices are fully preserved.",
              ],
            ].map(([q, a]) => (
              <div
                key={q}
                className="border border-border rounded-[12px] p-5 bg-bg"
              >
                <div className="font-inter text-sm font-semibold text-primary-navy mb-2 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-interactive-blue" />
                  {q}
                </div>
                <div className="font-inter text-[13px] text-slate-secondary leading-[1.6]">
                  {a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-primary-navy py-[72px] px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-sora font-bold text-[36px] text-white mb-3.5 tracking-[-0.5px] leading-[1.2]">
            Stop leaving money on the table.
            <br />
            Start planning your day with data.
          </h2>
          <p className="font-inter text-base text-white/60 max-w-lg mx-auto mb-8 leading-[1.7]">
            Every day you drive without Notary Day, you&apos;re estimating. The
            free plan costs nothing. The CITT check takes 15 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-navy font-inter font-bold text-[15px] rounded-[10px] h-[52px] px-7 hover:opacity-90 transition-opacity"
            >
              <ArrowRight className="w-4 h-4" /> Create free account
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-pro-gold text-primary-navy font-inter font-bold text-[15px] rounded-[10px] h-[52px] px-6 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" /> Start Pro — $19.99/mo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-primary-navy border-t border-white/10 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 lg:col-span-1">
              <div className="font-sora font-bold text-[18px] text-white mb-2">
                Notary Day
              </div>
              <p className="font-inter text-[13px] text-white/50 leading-[1.6] max-w-[240px]">
                Everything you already do manually, done automatically. Smart
                scheduling for full-time mobile notaries and LSAs.
              </p>
            </div>
            <div>
              <div className="font-inter text-[11px] font-semibold text-white/40 uppercase tracking-[0.6px] mb-3">
                Product
              </div>
              {[
                "Features",
                "Pricing",
                "How it works",
                "CITT explained",
                "Booking page",
              ].map((l) => (
                <div
                  key={l}
                  className="font-inter text-[13px] text-white/60 mb-2 cursor-pointer hover:text-white transition-colors"
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="font-inter text-[11px] font-semibold text-white/40 uppercase tracking-[0.6px] mb-3">
                Resources
              </div>
              {[
                "LSA income calculator",
                "Mileage rate guide",
                "Notary journal requirements",
                "Blog",
                "Support",
              ].map((l) => (
                <div
                  key={l}
                  className="font-inter text-[13px] text-white/60 mb-2 cursor-pointer hover:text-white transition-colors"
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="font-inter text-[11px] font-semibold text-white/40 uppercase tracking-[0.6px] mb-3">
                Company
              </div>
              {["About", "Privacy policy", "Terms of service", "Contact"].map(
                (l) => (
                  <div
                    key={l}
                    className="font-inter text-[13px] text-white/60 mb-2 cursor-pointer hover:text-white transition-colors"
                  >
                    {l}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="font-inter text-[12px] text-white/35">
              © 2026 Notary Day · notaryday.app
            </span>
            <span className="font-inter text-[12px] text-white/35">
              Built for mobile notaries in the United States
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
