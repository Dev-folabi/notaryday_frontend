export const site = {
  name: "Notary Day",
  domain: "notaryday.app",
  tagline: "Everything you already do manually, done automatically.",
  description:
    "The scheduling tool built for how mobile notaries actually work: signings, mandatory scanbacks, mileage costs, and all. Know your real earnings before you accept any job.",
  supportEmail: "support@notaryday.app",
};

export const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
] as const;

export const hero = {
  badge: "Now in beta · Free plan available",
  titleA: "Your signing day,",
  titleB: "planned for you.",
  subtitle:
    "The only scheduling tool built for how mobile notaries actually work: signings, mandatory scanbacks, mileage costs, and all. Know your real earnings before you accept any job.",
  primaryCta: { label: "Start for free, no credit card", href: "/signup" },
  secondaryCta: { label: "See how it works", href: "/how-it-works" },
  trust: [
    "Free plan · unlimited jobs",
    "Pro from $19/month",
    "No commitment · cancel any time",
  ],
};

export const productPreview = {
  eyebrow: "The Smart Day Planner in action",
  headerDay: "Tuesday, Mar 18",
  headerMeta: "4 signings · Route optimised",
  netLabel: "Est. net",
  netValue: "$412",
  driveLabel: "Drive time",
  driveValue: "1h 22m",
  footer:
    "Route optimised, scanback auto-blocked, gap opportunity surfaced, all automatically",
  jobs: [
    {
      time: "9:00 AM · 45 min",
      address: "3847 Wilshire Blvd, Los Angeles",
      type: "Loan Refi",
      typeClass: "bg-blue-100 text-blue-700",
      platform: "Snapdocs",
      fee: "$175",
      note: "net after mileage",
      feeClass: "text-teal-600",
    },
    {
      time: "10:28 AM · 30 min",
      address: "917 S Olive St, Los Angeles",
      type: "General",
      typeClass: "bg-teal-100 text-teal-800",
      platform: null,
      fee: "$95",
      note: "net after mileage",
      feeClass: "text-amber-600",
    },
  ],
  scanback: "Scanback · Job #1 · 9:45–10:15 AM · Auto-blocked",
  gap: {
    title: "Gap opportunity · 2:00 PM · 90 min available",
    detail: "1847 Crenshaw Blvd, Hawthorne · $125 offered",
    net: "Est. $108 net →",
  },
};

export const stats = [
  { value: "4.4M", label: "Notaries in the US" },
  { value: "$150–$200", label: "Per signing average" },
  { value: "85 min", label: "Drive time saved daily" },
  { value: "$0", label: "To get started today" },
];

export const featureHighlights = [
  {
    icon: "zap",
    title: "Can I Take This?",
    desc: "Paste any signing request and get an instant verdict: schedule fit, scanback conflicts, and what you'll actually net after mileage. Free and unlimited, forever.",
    href: "/features#citt",
  },
  {
    icon: "calendar",
    title: "Smart Day Planner",
    desc: "Every morning your day is laid out: jobs in the most efficient geographic order, scanback windows blocked, drive times calculated. Open the app and drive.",
    href: "/features#planner",
  },
  {
    icon: "dollar",
    title: "Real earnings per signing",
    desc: "The offered fee is never the real number. Every check shows fee minus round-trip mileage at the IRS rate, so you know your actual hourly rate before you commit.",
    href: "/features#earnings",
  },
];

export const features = [
  {
    icon: "zap",
    id: "citt",
    title: "Can I Take This?",
    desc: "Paste any signing request and get an instant answer: does it fit your schedule (accounting for scanbacks), and what will you actually net after mileage? Free, unlimited, forever. This is the feature notaries tell other notaries about.",
    badge: "free",
  },
  {
    icon: "calendar",
    id: "planner",
    title: "Smart Day Planner",
    desc: "Every morning your day is laid out for you: jobs sequenced in the most efficient geographic order, scanback windows blocked, drive times calculated. You open the app and start driving.",
    badge: "pro",
  },
  {
    icon: "sparkles",
    id: "gap-finder",
    title: "Gap Finder",
    desc: "After your route is optimised, Notary Day scans your pending jobs and surfaces the ones that fit into free windows, based on their location, your drive time, and your scanback commitments.",
    badge: "pro",
  },
  {
    icon: "dollar",
    id: "earnings",
    title: "Real earnings per signing",
    desc: "The offered fee is never the real number. Every CITT check shows you: fee minus round-trip mileage at the IRS rate. You know your actual hourly rate before you commit.",
    badge: "free",
  },
  {
    icon: "mail",
    id: "email-import",
    title: "Email import",
    desc: "Forward your Snapdocs or SigningOrder confirmation email and the job appears in your schedule automatically: address, time, fee, signing type all extracted by AI. A CITT check runs immediately.",
    badge: "pro",
  },
  {
    icon: "book",
    id: "journal",
    title: "Notarial journal",
    desc: "A legally compliant record of every notarial act you perform. Auto-populated from your jobs. Searchable, filterable, and exportable. Satisfies state requirements in California, Texas, Florida, and more.",
    badge: "free",
  },
];

export const featuresPage = {
  eyebrow: "Everything in one place",
  title: "Built for how you actually work",
  subtitle:
    "Six core features. Each one solves a real daily pain. None of them exist in any other notary tool.",
  moreTitle: "Everything else you do by hand",
  moreSubtitle:
    "The Pro toolkit that replaces your invoicing, mileage log, tax prep, and reminder texts.",
};

export const moreFeatures = [
  {
    icon: "globe",
    title: "Booking page",
    desc: "A public URL that only shows times you can actually accept. Drive time, scanback windows, and existing jobs are all checked before a slot is offered.",
  },
  {
    icon: "receipt",
    title: "One-tap invoicing",
    desc: "Generate a professional PDF invoice in one tap. Your payment details (Zelle, Venmo, PayPal) are printed right on it, and you track paid vs. unpaid.",
  },
  {
    icon: "car",
    title: "Auto GPS mileage tracking",
    desc: "Mileage logged automatically as you drive, at the IRS rate you choose. No more manual logbook at the end of the week.",
  },
  {
    icon: "chart",
    title: "Tax report export",
    desc: "An IRS Schedule C-ready summary of your income, mileage, and expenses. Export it and hand it to your accountant in minutes.",
  },
  {
    icon: "sync",
    title: "Calendar sync",
    desc: "Your day stays in sync with Google Calendar and a private .ics feed, so your schedule is where you already look.",
  },
  {
    icon: "bell",
    title: "Appointment reminders",
    desc: "Reminders go out to your clients automatically, so fewer no-shows and fewer wasted drives across town.",
  },
];

export const citt = {
  eyebrow: "The acquisition feature",
  title: "Can I Take This?",
  subtitle:
    "The instant feasibility, profitability, and conflict check that notaries tell other notaries about. Free, unlimited, and full accuracy, with no cap or degraded mode.",
  checks: [
    {
      icon: "route",
      title: "Real drive times",
      desc: "OpenRouteService calculates the actual drive from your last signing (or home base), not a straight-line guess.",
    },
    {
      icon: "timer",
      title: "Scanback-aware schedule fit",
      desc: "Your scanback blocks are real commitments. CITT never tells you a job fits when it collides with a scanback.",
    },
    {
      icon: "dollar",
      title: "Net earnings after mileage",
      desc: "Fee minus round-trip mileage at the IRS rate, minus the platform fee. The number you actually keep.",
    },
    {
      icon: "clock",
      title: "Effective hourly rate",
      desc: "Your true dollar-per-hour including drive, signing, and scanback time. This is the number that decides if a job is worth it.",
    },
  ],
  verdicts: [
    {
      label: "Take it",
      tone: "good",
      desc: "It fits your schedule cleanly and nets you $20+ after mileage.",
    },
    {
      label: "Risky",
      tone: "warn",
      desc: "Borderline: the gap is tight or the net is $10–$19. Your call, but you'll know the risk up front.",
    },
    {
      label: "Decline",
      tone: "bad",
      desc: "A schedule conflict (including scanbacks) or the net is under $10 after costs.",
    },
  ],
  freeNote:
    "Every single CITT check is free and unlimited, with full accuracy. There is no capped or degraded version. It's the feature we want every notary in the country using.",
};

export const bookingPage = {
  eyebrow: "Bookings without double-booking",
  title: "A booking page that never overbooks you",
  subtitle:
    "Give clients a public URL where they pick a time. Before any slot is confirmed, Notary Day checks your real schedule, including drive time, scanback windows, and existing jobs, so you never accept a booking you can't honour.",
  urlSample: "notaryday.app/book/your-name",
  bullets: [
    "Slots are offered in your timezone, on days you actually work",
    "Drive time and scanback windows are accounted for before a slot is shown",
    "Requests land in your queue for quick approval or decline",
    "No card, no commitment. Your clients just pick a time",
  ],
};

export const scanback = {
  eyebrow: "The problem no tool solves",
  title: "After every loan signing, you're locked for 30 minutes",
  intro:
    "Every tool plans your schedule as if signings end when you walk out the door. But you know that's not true. After every Loan Refi or Hybrid, you have to scan and send the documents, and that takes 20–45 minutes. You can't drive. You can't start the next job. Every tool ignores this. Notary Day doesn't.",
  sectionLabel: "What no other tool does",
  sectionTitle: "Scanback auto-blocking",
  sectionDesc:
    "Notary Day inserts a time block after every loan signing automatically, equal to your actual scanback duration. Your day will never be double-booked. Route optimisation accounts for it. CITT checks against it. It's the scheduling moat no competitor has.",
  points: [
    "Auto-inserted after every Loan Refi or Hybrid signing",
    "Duration based on your real scanback time (configurable per job)",
    "CITT checks honour it, with no false positives",
    "Route engine builds around it, not through it",
  ],
  events: [
    { time: "9:00 AM", label: "Loan Refi · Wilshire Blvd", kind: "job" },
    { time: "9:45 AM", label: "Scanback · Job #1 (auto)", kind: "scanback" },
    { time: "10:15 AM", label: "12 min drive", kind: "drive" },
    { time: "10:28 AM", label: "General · Olive St", kind: "job" },
  ],
};

export const howItWorks = {
  eyebrow: "Get started in minutes",
  title: "Three questions. Then you're running.",
  subtitle:
    "Onboarding takes under 3 minutes. Three questions, and every feature that matters works from day one.",
  steps: [
    {
      n: 1,
      title: "Set your home base",
      desc: "The address you start your day from. Used to calculate your first and last drive of the day. Never shown to clients.",
    },
    {
      n: 2,
      title: "Set your scanback duration",
      desc: "How long your typical scanback takes. Notary Day blocks this time after every Loan Refi or Hybrid automatically.",
    },
    {
      n: 3,
      title: "Choose your signing types",
      desc: "Loan Refi, General, Hybrid, Estate. Your booking page and Gap Finder will only surface the jobs that match what you do.",
    },
    {
      n: 4,
      title: "Start using Can I Take This?",
      desc: "The first time you get a new signing request, tap the CITT button. You'll see why notaries tell their colleagues about this one.",
    },
  ],
  nextSteps: {
    title: "Then Notary Day does the rest",
    desc: "No more Google Maps tabs, no more mental math, no more spreadsheet at the end of the week.",
    bullets: [
      "Paste a request → CITT verdicts instantly, with your real numbers",
      "Each morning → your day is planned, sequenced, and scanback-safe",
      "Forward an email → the job is on your calendar, parsed by AI",
      "At the end of the week → invoices, mileage, and tax-ready reports",
    ],
  },
};

export const testimonials = {
  eyebrow: "From notaries like you",
  title: "They were using Google Maps and a spreadsheet",
  subtitle:
    "Real notaries, real problems. This is what they told us before we built a single line of code.",
  items: [
    {
      quote:
        "\"After mileage I sometimes made almost nothing on a signing. I had no way to know that before accepting. I needed the number before I committed.\"",
      name: "Carline S.",
      role: "LSA · Anaheim, CA · 8–10 signings/day",
      init: "CS",
    },
    {
      quote:
        "\"I screenshot the address, drop it in Maps, estimate the drive, multiply by 67 cents, do the subtraction in my head. Every single job. There has to be a better way.\"",
      name: "Sarah G.",
      role: "LSA · Houston, TX · 5–6 signings/day",
      init: "SG",
    },
    {
      quote:
        "\"I do 14 signings on a good day. By signing 6 I have no idea if I'm even making money. I need something that tells me the route and the number at the same time.\"",
      name: "Anonymous",
      role: "LSA · Los Angeles metro · 12–14 signings/day",
      init: "LA",
    },
  ],
};

export const pricing = {
  eyebrow: "Simple pricing",
  title: "Start free. Upgrade when it pays for itself.",
  subtitle:
    "Pro pays for itself in under one extra signing per month. Most notaries upgrade after their first CITT check.",
  plans: [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      tagline: "No credit card. No expiry.",
      features: [
        "Unlimited job storage",
        "Can I Take This? (full accuracy, unlimited)",
        "Real earnings calculator (IRS mileage rate)",
        "Notarial journal (legally compliant)",
        "Manual mileage log",
        "Basic income summary",
      ],
      cta: { label: "Start for free", href: "/signup", variant: "secondary" },
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      cadence: "/month",
      tagline: "or $208/year, save $20",
      note: "Less than the fee from one extra signing.",
      features: [
        "Everything in Free",
        "Route optimisation + scanback blocking",
        "Gap Finder (pending jobs that fit your day)",
        "Booking page (notaryday.app/book/you)",
        "Email import from Snapdocs + SigningOrder",
        "One-tap invoicing + Stripe payment links",
        "Auto GPS mileage tracking",
        "Tax report export (IRS Schedule C ready)",
        "Appointment reminders to clients",
      ],
      cta: { label: "Start Pro at $19/month", href: "/signup", variant: "pro" },
      footnote: "Cancel any time · No commitment",
      popular: true,
    },
  ],
  faq: [
    {
      q: "What happens to my data if I cancel Pro?",
      a: "Nothing is deleted. You move to the Free plan and Pro features are locked, but all your jobs, journal entries, mileage log, and invoices are fully preserved. Reactivate at any time and everything is exactly as you left it.",
    },
    {
      q: "Does CITT work on the free plan?",
      a: "Yes, fully and without limits, with the same accuracy, drive-time engine, and IRS mileage rate. CITT is the acquisition feature; we want every notary using it, so it is never gated or degraded.",
    },
    {
      q: "Can I pay annually?",
      a: "Yes. Pro is $19/month, or $208/year (effective $17.33/month, saving you $20). You can switch between billing periods any time from Settings.",
    },
    {
      q: "Is there a team plan?",
      a: "Not yet. Notary Day is built for the individual notary first. A Team plan is on the roadmap for notary offices that coordinate multiple signers.",
    },
  ],
};

export const faq = {
  eyebrow: "Questions",
  title: "Things notaries ask us",
  items: [
    {
      q: "Does CITT really work on the free plan?",
      a: "Yes, fully and without limits. The check uses OpenRouteService for real drive times, the current IRS mileage rate, and your actual schedule including scanback windows. There is no capped or degraded version on the free plan. It is the acquisition feature; we want every notary to use it.",
    },
    {
      q: "What is a scanback and why does it matter?",
      a: "A scanback is the process of scanning and sending completed loan documents to the title company after a signing. It takes 20–45 minutes and ties you to a location. No other scheduling tool accounts for this. It is why notaries get double-booked and why routes break down.",
    },
    {
      q: "Do I need to be a loan signing agent?",
      a: "No. General notaries, estate notaries, and hybrid signers all benefit. The scanback blocking is most valuable for LSAs, but real earnings per signing and route optimisation work for everyone who drives to clients.",
    },
    {
      q: "How does the booking page work?",
      a: "You get a public URL at notaryday.app/book/username. Clients submit requests. The system checks your schedule in real time, including drive time and scanback windows, before confirming. You never get a booking that conflicts with an existing commitment.",
    },
    {
      q: "Is my data safe?",
      a: "Yes. Passwords are hashed with bcrypt and never stored in plain text. Payment details are handled entirely by Stripe. Notary Day never stores card numbers. Data is hosted on Railway/Render with automated backups.",
    },
    {
      q: "What happens to my data if I cancel Pro?",
      a: "Nothing is deleted. You move to the Free plan and Pro features are locked, but all your jobs, journal entries, mileage log, and invoices are fully preserved. Reactivate at any time and everything is exactly as you left it.",
    },
  ],
};

export const cta = {
  titleA: "Stop leaving money on the table.",
  titleB: "Start planning your day with data.",
  subtitle:
    "Every day you drive without Notary Day, you're estimating. That's fine. But you're also leaving $100–$200 on the table. The free plan costs nothing. The CITT check takes 15 seconds.",
  primary: { label: "Create free account", href: "/signup" },
  secondary: { label: "Start Pro at $19/mo", href: "/signup" },
};

export const about = {
  eyebrow: "About Notary Day",
  title: "Built for the notary who lives in their car",
  subtitle:
    "Notary Day exists because the most common tool in a notary's day is still a spreadsheet. We think that's absurd.",
  story: [
    "Every day, thousands of mobile notaries and loan signing agents do the same manual dance: screenshot the signing request, drop it in Google Maps, estimate the drive, multiply by the IRS mileage rate, subtract it from the fee in their head, and guess whether it fits between the last scanback and the next appointment.",
    "That works until the day is packed. And a packed day is exactly when mistakes cost real money. Double-booked signings, routes that zig-zag across the city, signings you accept that net less than minimum wage once mileage is counted.",
    "We built Notary Day around the one thing every other tool ignores: the scanback. After a loan signing you're locked to your location for 20–45 minutes scanning and sending documents. Account for that, and every scheduling decision gets honest.",
    "Our goal is simple: every notary should know, before they commit, whether a signing is worth their time, and every morning should start with a day already planned around the way the job actually works.",
  ],
  values: [
    {
      title: "Honest numbers",
      desc: "The fee on the request is never the number you keep. We show you the number after mileage, platform fees, and your time.",
    },
    {
      title: "Built for real days",
      desc: "Scanbacks, drive time, and gaps between jobs are the messy parts of a notary's day. They are the whole point, not an afterthought.",
    },
    {
      title: "Free where it matters",
      desc: "The feature notaries tell each other about (CITT) is free, unlimited, and full-accuracy. Always.",
    },
  ],
};

export const contact = {
  eyebrow: "Contact",
  title: "We read every message",
  subtitle:
    "Whether you're a notary with a question, an LSA with a feature idea, or a title company that wants to partner, we'd love to hear from you.",
  email: site.supportEmail,
  responseTime: "We typically reply within one business day.",
  channels: [
    {
      title: "Support & billing",
      desc: "Questions about your account, plan, or a bug you hit. Email us and we'll take it from there.",
    },
    {
      title: "Feedback & feature ideas",
      desc: "The roadmap is shaped by notaries. Tell us what would save you an hour a day.",
    },
    {
      title: "Partnerships & press",
      desc: "Title companies, signing services, and writers: let's talk about working together.",
    },
  ],
};

export const footer = {
  description:
    "Everything you already do manually, done automatically. Smart scheduling for full-time mobile notaries and loan signing agents.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "How it works", href: "/how-it-works" },
        { label: "CITT explained", href: "/features#citt" },
        { label: "Booking page", href: "/features#booking-page" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "Terms of service", href: "/terms" },
      ],
    },
  ],
  bottomLeft: `© ${new Date().getFullYear()} Notary Day · notaryday.app`,
  bottomRight: "Built for mobile notaries in the United States",
};

export const legal = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: August 2026",
    intro:
      "Notary Day (\"we\", \"our\", \"us\") operates notaryday.app and its companion apps. This policy explains what information we collect when you use the service, how we use it, and the choices you have.",
    sections: [
      {
        heading: "Information we collect",
        body: "Account information you provide when signing up, such as your name and email address. Scheduling information you enter, such as your home base, jobs, appointments, mileage, and expenses. Usage information such as device type and browser, collected for reliability and analytics. Payment information is processed by our payment provider (Stripe) and is never stored on our servers.",
      },
      {
        heading: "How we use your information",
        body: "To provide and improve the service: scheduling your day, running CITT checks, generating invoices and reports, and delivering reminders. We use your data only for the purposes you would reasonably expect when using the product.",
      },
      {
        heading: "What we share",
        body: "We do not sell your personal information. We share data only with the service providers required to run the product (hosting, email delivery, geocoding and routing, AI parsing, payment processing), and only to the extent needed to provide those services.",
      },
      {
        heading: "Booking page privacy",
        body: "Public booking pages never expose your confirmed job addresses, client names, or full schedule. Clients only see whether a time slot is available.",
      },
      {
        heading: "Data security",
        body: "Passwords are hashed with bcrypt and never stored in plain text. Connections are encrypted in transit. Data is hosted with automated backups. While no system is perfectly secure, we apply industry-standard safeguards to protect your information.",
      },
      {
        heading: "Data retention & deletion",
        body: "You may delete your account at any time, which removes your personal data from our systems. Where we must retain data to comply with legal obligations, we do so in line with those requirements.",
      },
      {
        heading: "Your rights",
        body: "You may access, correct, export, or delete your personal information at any time from your account settings, or by emailing us at the address below.",
      },
      {
        heading: "Contact",
        body: `Questions about this policy? Email ${site.supportEmail}.`,
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "Last updated: August 2026",
    intro:
      "These Terms of Service (\"Terms\") govern your use of the Notary Day service operated by Notary Day at notaryday.app. By creating an account or using the service, you agree to these Terms.",
    sections: [
      {
        heading: "1. The service",
        body: "Notary Day is a scheduling and record-keeping tool for mobile notaries and loan signing agents. It provides job scheduling, profitability checks, route planning, invoicing, and reporting features.",
      },
      {
        heading: "2. Your account",
        body: "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must provide accurate information and keep it current.",
      },
      {
        heading: "3. Acceptable use",
        body: "You agree not to misuse the service: no reselling the service, no unlawful activity, no attempts to interfere with the service or its data, and no use that violates the rights of others.",
      },
      {
        heading: "4. Professional responsibility",
        body: "Notary Day is a tool. You remain responsible for complying with the laws and regulations that apply to notaries and loan signing agents in your state, including notarial journal requirements and the performance of your notarial duties.",
      },
      {
        heading: "5. Subscriptions & billing",
        body: "The Free plan has no charge. Pro is billed monthly or annually as selected at checkout, payable to our payment provider. You may cancel at any time and access continues until the end of the paid period. Fees are non-refundable except where required by law.",
      },
      {
        heading: "6. Cancellation & data",
        body: "When you cancel, your data remains intact and you move to the Free plan. You may export or delete your data at any time.",
      },
      {
        heading: "7. Intellectual property",
        body: "The service, including its software, design, and content, is owned by Notary Day. You may not copy or reproduce it except as permitted by these Terms.",
      },
      {
        heading: "8. Limitation of liability",
        body: "The service is provided \"as is\" and \"as available\". To the maximum extent permitted by law, Notary Day is not liable for indirect, incidental, or consequential damages, or for any decisions you make based on information in the service.",
      },
      {
        heading: "9. Changes to the service or Terms",
        body: "We may update the service and these Terms over time. Material changes will be reflected here, and continued use of the service after changes take effect constitutes acceptance.",
      },
      {
        heading: "10. Contact",
        body: `Questions about these Terms? Email ${site.supportEmail}.`,
      },
    ],
  },
};
