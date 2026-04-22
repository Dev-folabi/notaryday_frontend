# Notary Day — Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

**Production-grade Next.js application — a smart scheduling and business OS for mobile loan signing agents in the United States.**

[Architecture](#architecture) · [Design System](#design-system) · [Key Screens](#key-screens) · [Getting Started](#getting-started) · [Performance](#performance)

</div>

---

## What Is This?

This is the frontend for **Notary Day** — a SaaS product that replaces three manual workflows for full-time mobile notaries: route planning in Google Maps, accounting in NotaryGadget, and scattered invoicing. The UI is built mobile-first as an installable PWA because notaries use this application on the road between signings on a phone.

The interface is anchored around a single daily screen — the **Today View** — that shows a notary's confirmed signings in optimised geographic order, with scanback time blocks automatically inserted after qualifying signing types, and gap opportunities surfaced below. Every interaction is designed for one-handed operation on a phone while standing in a parking lot.

**The core design problem:** How do you give a time-pressured professional — who makes 6–14 routing and financial decisions per day — an interface so clear and fast that the right decision is obvious in under 3 seconds?

---

## Architecture

### Application Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: fonts, providers, PWA meta
│   ├── page.tsx                      # Landing page (SSG, public)
│   │
│   ├── (auth)/                       # Auth group — no nav chrome
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── (onboarding)/                 # Onboarding group — wizard chrome
│   │   └── onboarding/
│   │       ├── home/                 # Step 1: home base + username slug
│   │       ├── mileage/              # Step 2: IRS rate + vehicle type
│   │       ├── durations/            # Step 3: signing type duration defaults
│   │       └── booking/             # Step 4: booking page setup (skippable)
│   │
│   ├── (app)/                        # Main app group — sidebar + bottom nav
│   │   ├── layout.tsx                # Navigation chrome
│   │   ├── page.tsx                  # Today view (/)
│   │   ├── map/                      # Geographic day overview
│   │   ├── jobs/                     # Job pipeline
│   │   ├── bookings/                 # Client booking reviews (Pro)
│   │   ├── earnings/                 # Business performance dashboard
│   │   ├── expenses/                 # Expense tracking
│   │   ├── reports/                  # Tax reports + exports
│   │   ├── journal/                  # Notarial journal
│   │   └── settings/                 # Account + billing + notifications
│   │
│   └── book/
│       └── [username]/               # Public booking page (SSR, no auth)
│
├── components/
│   ├── ui/                           # Base design system components
│   ├── layout/                       # Navigation, CITT floating button
│   ├── jobs/                         # Job cards, forms, status badges
│   ├── citt/                         # CITT modal + verdict cards
│   ├── planner/                      # Calendar, scanback blocks, gap finder
│   ├── booking/                      # Booking setup + public booking form
│   ├── map/                          # Leaflet map (dynamic import, no SSR)
│   └── reports/                      # Charts, mileage log
│
├── hooks/                            # React Query data hooks
├── lib/                              # axios client, query config, utilities
├── store/                            # Zustand UI state
├── styles/                           # Tailwind + CSS variables
└── types/                            # Shared TypeScript interfaces
```

### Data Fetching Architecture

**React Query** manages all server state. No Redux, no Context API for data — React Query handles caching, refetching, optimistic updates, and error boundaries.

**Zustand** manages client-only UI state: modal open/close, active date selection, toast queue, CITT pre-fill data.

```typescript
// Query key conventions — consistent across the entire app
["jobs", { date, status }][("job", id)][("planner", "today", date)][ // Job list // Single job // Optimised day view
  ("planner", "gaps", date)
][("citt", { address, time, type })][("booking-page", username, date)][ // Gap finder candidates // CITT result (5min stale) // Public slot availability
  ("user", "me")
][("reports", "earnings", { from, to })]; // Authenticated user profile
```

**Stale time strategy** — Jobs: 30s (change frequently during a working day). CITT results: 2 min (schedule changes). Reports: 5 min. User settings: 10 min.

**Optimistic updates** — Job status changes (start signing, complete, etc.) update the UI immediately before the API confirms. On error, React Query automatically rolls back to the previous state and shows a toast.

### Routing Architecture

Three route groups with distinct layouts:

- `(auth)` — Minimal layout, no navigation chrome. Full-viewport centred forms.
- `(onboarding)` — Wizard layout with step indicator. Enforced sequential flow (steps 1–3 required, step 4 skippable).
- `(app)` — Full application layout. Mobile: bottom navigation (60px, fixed). Desktop: sidebar (240px) + content area at ≥1024px breakpoint.

**Route protection:** Middleware checks for a valid JWT in every `(app)` route. Unauthenticated → `/login`. Authenticated but onboarding incomplete → `/onboarding/home`. Pro-gated routes show an overlay, never redirect.

---

## Design System

The design system is implemented as a combination of Tailwind config extensions and CSS custom properties. All tokens are defined once and referenced everywhere — no raw hex values in component files.

### Colour Palette

| Token              | Hex       | Usage                                                      |
| ------------------ | --------- | ---------------------------------------------------------- |
| `primary-navy`     | `#0F2C4E` | Nav bar, headings, primary buttons, CITT button gradient   |
| `navy-active`      | `#1A3D6B` | Hover and active states on navy elements                   |
| `interactive-blue` | `#2563EB` | Links, checkboxes, focus rings                             |
| `teal-success`     | `#0E7B6C` | CITT "Take It" verdict, positive earnings, complete status |
| `amber-warning`    | `#D97706` | CITT "Risky" verdict, scanback blocks, conflict flags      |
| `red-danger`       | `#C0392B` | CITT "Decline" verdict, destructive actions                |
| `slate-body`       | `#475569` | Primary body text                                          |
| `slate-secondary`  | `#64748B` | Labels, metadata, helper text                              |
| `border`           | `#E2E8F0` | Card borders, dividers, input strokes                      |
| `bg`               | `#F8FAFC` | Page canvas                                                |
| `scanback-bg`      | `#FEF3C7` | Scanback time-block calendar background                    |
| `gap-finder-bg`    | `#EDE9FE` | Gap opportunity card background                            |
| `pro-gold`         | `#F59E0B` | Pro badge, upgrade prompts, annual plan highlight          |

### Typography

Two font families, three weights each. Loaded from Google Fonts CDN.

- **Sora** (600, 700) — Headings. Confident and modern without feeling clinical.
- **Inter** (400, 500, 600) — Body, labels, data values. Most legible UI font at 12–14px.
- **JetBrains Mono** (400) — Import addresses, API keys, IDs, code snippets.

```
Display       Sora 700  32–48px   Landing page hero only
H1 / Page     Sora 700  28px      One per screen
H2 / Section  Sora 600  22px      Section headings, card titles
H3 / Sub      Sora 600  18px      Modal titles, sub-sections
Body          Inter 400 14px      All body copy
Body Medium   Inter 500 14px      Form labels, emphasised copy
Body Bold     Inter 600 14px      Fees, times, key data values
Caption       Inter 400 12px      Metadata, timestamps, helper text
Mono          JBM  400  13px      Addresses, IDs, import data
Button        Inter 600 14px      Sentence case, never all-caps
Nav Label     Inter 500 12px      Bottom nav, breadcrumbs
Badge         Inter 600 11px      Status chips — ALL CAPS
```

### Component Patterns

**Input pattern (strict — never use placeholders as labels):**

```tsx
<div className="flex flex-col gap-1.5">
  <label className="font-medium text-xs text-slate-body">{label}</label>
  <input
    className="bg-white border border-border rounded-input h-10 px-3
                    text-sm focus:border-interactive-blue focus:ring-2
                    focus:ring-blue-100 outline-none"
  />
  {error && <span className="text-red-danger text-xs mt-1">{error}</span>}
</div>
```

**Pro feature gate (overlay, never redirect):**

```tsx
<div className="relative">
  {children}
  {!isPro && (
    <div
      className="absolute inset-0 bg-white/80 backdrop-blur-sm
                    rounded-card flex flex-col items-center justify-center gap-3"
    >
      <LockIcon className="text-slate-secondary w-6 h-6" />
      <p className="text-sm text-slate-body text-center max-w-[200px]">
        {benefitText}
      </p>
      <Button variant="pro">Upgrade to Pro</Button>
    </div>
  )}
</div>
```

**CITT floating button (fixed, always visible on all app screens):**

```tsx
// 56px circle, gradient navy→blue, elevated 8px above bottom nav
// Shadow: 0 4px 16px rgba(15,44,78,0.4)
// Centred at bottom of viewport regardless of screen content
```

---

## Key Screens

### Today View — The Primary Daily Screen (`/`)

The most complex screen in the application. Renders differently based on plan tier and time of day.

**Free tier:** Chronological job list with profitability indicators on each card. CITT button prominent. Optimise Day CTA locked behind Pro gate overlay.

**Pro tier (before optimisation):** Same list + "Optimise Day" button at top. Gap between the first and last job shown with "Find work in this gap" prompt.

**Pro tier (after optimisation):** Timeline calendar view. Jobs rendered as cards at their time positions. Scanback blocks rendered immediately after qualifying jobs — amber background, non-interactive, "Scanback — Job #N" label. Drive time labels between each job. Gap Finder cards below the calendar when pending jobs fit open windows.

**Day Summary Strip:** Full-width navy header. Four data points: total signings, estimated net earnings, total drive time, first signing time. "Start Day" button right-aligned in amber-gold.

### CITT Modal — The Core Feature

Accessible from every screen via the floating button. Slides up from the bottom on mobile, centred modal on desktop.

**Entry state:** Three fields — address (with geocode preview on blur), appointment time, signing type (segmented control not a dropdown — one tap).

**Result state:** Verdict card fills the modal. Colour-coded by verdict (green/amber/red). Three columns: Offered Fee → Mileage Cost → Net Earnings. Effective hourly rate below. Scanback conflict detail if applicable. "Add as pending" and "Dismiss" actions.

**Performance:** The modal pre-connects to the ORS API on first app load. Geocoding fires on address field blur (not on submit), so drive time calculation starts while the user is still filling the time field. Target: result visible < 3 seconds from form submission.

### Public Booking Page (`/book/[username]`)

Server-side rendered. No authentication required. Designed to be the notary's professional face to direct clients.

Renders the notary's name, credentials, bio, and service menu. Client selects service type and preferred date, enters their address, and sees a list of genuinely available time slots (computed server-side by the availability engine). Travel fee estimate shown per slot. Standard booking form on slot selection.

**Privacy:** The notary's confirmed schedule is never exposed. The availability engine returns only `available: boolean` per slot. No job addresses, client names, or schedule details are rendered to the client.

### Map View (`/map`)

Dynamic import with `ssr: false` (Leaflet cannot run on the server). Loading state renders a skeleton card at the map dimensions.

Numbered pins for each confirmed job in optimised sequence. Route polyline connecting jobs. Drive time label on each leg. Navigate button per pin — opens the notary's preferred navigation app (Google Maps / Apple Maps / Waze) with the job address pre-filled via URL scheme. No API key needed for navigation deep links.

---

## Getting Started

### Prerequisites

- Node.js 20+
- The backend API running at `localhost:4000` (see backend README)

### Installation

```bash
npm install
```

### Environment Variables

```bash
cp .env.local.example .env.local
```

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Type check
npm run type-check

# Lint
npm run lint
```

The application runs on `http://localhost:3000` by default.

---

## Performance

### Core Web Vitals Targets

| Metric    | Target  | Strategy                                             |
| --------- | ------- | ---------------------------------------------------- |
| LCP       | < 2.5s  | SSG landing page, SSR booking page, lazy-loaded map  |
| FID / INP | < 100ms | Optimistic updates, no blocking renders              |
| CLS       | < 0.1   | Explicit dimensions on all images and map containers |

### PWA & Mobile Performance

The application is configured as an installable PWA with `next-pwa`. Notaries add it to their home screen and use it like a native app. Service worker caches the app shell for offline loading.

```json
{
  "name": "Notary Day",
  "short_name": "Notary Day",
  "display": "standalone",
  "theme_color": "#0F2C4E",
  "background_color": "#F8FAFC",
  "start_url": "/"
}
```

### Code Splitting Strategy

- The Leaflet map is dynamically imported (`ssr: false`) — adds ~40KB only when the map screen is visited
- Heavy chart components (earnings dashboard) are dynamically imported
- The public booking page is SSR — fully rendered on the server for client-facing performance
- The landing page is SSG — built at compile time, served from CDN edge

### Bundle Optimisation

- No component library dependency — all UI built from scratch against the design system. Zero bloat from unused components.
- Lucide React icons imported individually, not as a barrel import
- React Query's `staleTime` configuration prevents waterfall refetches — data is fresh for the expected usage window before being quietly revalidated in the background

---

## Mobile-First Implementation

Primary use is a PWA on iPhone or Android, used between signings in a parking lot. Every design and interaction decision reflects this.

**Touch targets** — Minimum 44×44px on all interactive elements. Padding added invisibly where visual size would be smaller.

**Bottom navigation** — Fixed 60px bar. Five items: Today, Jobs, CITT (floating centre, elevated), Reports, Account. Active state: navy icon + navy label + indicator dot. iOS safe area respected via `env(safe-area-inset-bottom)`.

**CITT floating button** — Fixed position, always visible across all app screens regardless of scroll position. 56px circle with gradient. Elevated 8px above the bottom nav. The single most important interaction in the product must always be one tap away.

**Form inputs** — 40px height minimum. Numeric inputs use `inputmode="decimal"` to show the correct keyboard on mobile. Address inputs use `autocomplete` attributes.

**Navigation deep links** — The "Navigate" button on each job card opens the notary's preferred navigation app directly with the address pre-filled. No copying and pasting. Implementation uses URL schemes with no API key requirement:

```typescript
const NAV_URLS = {
  GOOGLE_MAPS: (addr: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}&travelmode=driving`,
  APPLE_MAPS: (addr: string) =>
    `maps://maps.apple.com/?daddr=${encodeURIComponent(addr)}&dirflg=d`,
  WAZE: (addr: string) =>
    `https://waze.com/ul?q=${encodeURIComponent(addr)}&navigate=yes`,
};
```

---

## State Management Philosophy

**No Redux.** The application uses two state tools, each with a clear domain:

**React Query** — All data that lives on the server. Handles: caching, background refetching, loading states, error states, optimistic mutations. The query key conventions are strict and documented. Cache invalidation is intentional — adding or editing a job invalidates the planner cache for that date.

**Zustand** — All state that is purely UI and never needs to be persisted. The store is small and flat:

```typescript
interface UIStore {
  // CITT modal
  isCITTOpen: boolean;
  cITTPrefill: CITTPrefill | null;
  openCITT: (prefill?: CITTPrefill) => void;
  closeCITT: () => void;

  // Date navigation
  activeDate: string; // ISO date string
  setActiveDate: (date: string) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}
```

---

## Accessibility

- Semantic HTML throughout — `<nav>`, `<main>`, `<section>`, `<article>` used correctly
- ARIA labels on icon-only buttons
- Focus management in modals — focus trapped inside open modals, returned to trigger on close
- Keyboard navigation for all interactive elements
- Colour is never the only differentiator for status information — icons and text accompany all colour-coded states
- CITT verdict cards use both colour and icon (✓ / ⚠ / ✕) for the verdict

---

## Tech Stack

| Concern        | Technology                                       |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 15 (App Router)                          |
| Language       | TypeScript 5                                     |
| Styling        | Tailwind CSS                                     |
| Server State   | React Query (@tanstack/react-query)              |
| Client State   | Zustand                                          |
| Forms          | React Hook Form + Zod                            |
| Maps           | Leaflet.js (react-leaflet) — OpenStreetMap tiles |
| Icons          | Lucide React                                     |
| HTTP Client    | axios (with JWT + auth interceptors)             |
| Date Utilities | date-fns                                         |
| PDF            | Handled by backend (pdfkit)                      |
| PWA            | next-pwa                                         |
| Testing        | Jest + React Testing Library                     |

---

## Deployment

Designed for deployment on **Vercel** (ideal for Next.js) or **Railway**.

The public booking page (`/book/[username]`) uses SSR — runs server-side rendering at request time to compute live slot availability. All other app screens are client-side rendered after initial auth check.

```bash
# Environment variables required in production
NEXT_PUBLIC_API_URL=https://api.notaryday.app/api/v1
NEXT_PUBLIC_APP_URL=https://notaryday.app
```

---

<div align="center">
  <sub>Built by <a href="https://github.com/Dev-folabi">Yusuf Afolabi</a> · notaryday.app</sub>
</div>
