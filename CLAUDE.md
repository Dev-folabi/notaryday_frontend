@AGENTS.md
# Notary Day — Frontend Intelligence File
> Next.js (App Router) | TypeScript | Tailwind CSS | React Query + Zustand
> Read the root CLAUDE.md first. This file adds frontend-specific detail only.

---

## 1. Project Bootstrap

```bash
npx create-next-app@latest notaryday_frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd notaryday_frontend

npm install @tanstack/react-query axios zustand
npm install react-hook-form @hookform/resolvers zod
npm install react-leaflet leaflet
npm install lucide-react
npm install next-pwa
npm install @types/leaflet
npm install date-fns           # Date formatting + manipulation
npm install clsx               # Conditional classNames
```

---

## 2. Project Structure

```
src/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    ← Root layout (fonts, providers)
│   ├── page.tsx                      ← Landing page (public, SSG)
│   ├── (auth)/                       ← Auth route group (no sidebar)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (onboarding)/                 ← Onboarding route group
│   │   └── onboarding/
│   │       ├── home/page.tsx         ← Step 1: home base + username
│   │       ├── scanback/page.tsx      ← Step 2: scanback
│   │       ├── signing-types/page.tsx    ← Step 3: signing type defaults
│   │       └── booking/page.tsx      ← Step 4: booking page setup (skippable)
│   ├── (app)/                        ← Main app route group (sidebar layout)
│   │   ├── layout.tsx                ← Sidebar + bottom nav
│   │   ├── page.tsx                  ← Today view (/) — primary daily screen
│   │   ├── map/page.tsx              ← Map view (/map)
│   │   ├── jobs/
│   │   │   ├── page.tsx              ← Jobs list (/jobs)
│   │   │   ├── new/page.tsx          ← Add job (/jobs/new)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          ← Job detail (/jobs/:id)
│   │   │       └── edit/page.tsx     ← Edit job (/jobs/:id/edit)
│   │   ├── bookings/
│   │   │   ├── page.tsx              ← Booking review list
│   │   │   └── [id]/page.tsx         ← Booking detail
│   │   ├── earnings/page.tsx         ← Earnings dashboard
│   │   ├── expenses/page.tsx         ← Expense tracking
│   │   ├── reports/page.tsx          ← Tax reports
│   │   ├── journal/page.tsx          ← Notarial journal
│   │   └── settings/
│   │       ├── page.tsx              ← Account settings
│   │       ├── notifications/page.tsx
│   │       └── billing/page.tsx      ← Plan & billing
│   └── book/
│       └── [username]/
│           └── page.tsx              ← Public booking page (no auth, SSR)
│
├── components/
│   ├── ui/                           ← Base design system components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   └── ProGate.tsx               ← Locked overlay for Pro-only features
│   ├── layout/
│   │   ├── BottomNav.tsx             ← Mobile bottom navigation and Desktop sidebar
│   │   ├── TopNav.tsx
│   │   └── CITTButton.tsx            ← Floating CITT button (always visible)
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobForm.tsx
│   │   ├── JobStatusBadge.tsx
│   │   └── ProfitabilityRow.tsx
│   ├── citt/
│   │   ├── CITTModal.tsx
│   │   └── CITTVerdictCard.tsx
│   ├── planner/
│   │   ├── DaySummaryStrip.tsx
│   │   ├── ScanbackBlock.tsx
│   │   ├── GapFinderCard.tsx
│   │   └── RouteCalendar.tsx
│   ├── booking/
│   │   ├── BookingPageSetup.tsx
│   │   └── PublicBookingForm.tsx
│   ├── map/
│   │   └── DayMap.tsx                ← Leaflet map (dynamic import, no SSR)
│   └── reports/
│       ├── EarningsChart.tsx
│       └── MileageLog.tsx
│
├── hooks/
│   ├── useJobs.ts
│   ├── useCITT.ts
│   ├── usePlanner.ts
│   ├── useBooking.ts
│   ├── useAuth.ts
│   └── useReports.ts
│
├── lib/
│   ├── api.ts                        ← axios instance with interceptors
│   ├── queryClient.ts                ← React Query client config
│   └── utils.ts                      ← clsx helper, date formatting, currency formatting
│
├── store/
│   └── uiStore.ts                    ← Zustand: modal states, active date, CITT open state
│
├── styles/
│   └── globals.css                   ← Tailwind directives + CSS variables
│
└── types/
    ├── job.ts
    ├── user.ts
    ├── citt.ts
    └── booking.ts
```

---

## 3. Design System Tokens (Implement as CSS Variables + Tailwind Config)

```css
/* styles/globals.css */
:root {
  --color-primary-navy: #0F2C4E;
  --color-navy-active: #1A3D6B;
  --color-interactive-blue: #2563EB;
  --color-blue-hover: #3B82F6;
  --color-teal-success: #0E7B6C;
  --color-amber-warning: #D97706;
  --color-red-danger: #C0392B;
  --color-slate-body: #475569;
  --color-slate-secondary: #64748B;
  --color-border: #E2E8F0;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-scanback-bg: #FEF3C7;
  --color-gap-finder-bg: #EDE9FE;
  --color-pro-gold: #F59E0B;
}
```

```typescript
// tailwind.config.ts — extend theme with design tokens
extend: {
  colors: {
    'primary-navy': '#0F2C4E',
    'navy-active': '#1A3D6B',
    'interactive-blue': '#2563EB',
    'teal-success': '#0E7B6C',
    'amber-warning': '#D97706',
    'red-danger': '#C0392B',
    'slate-body': '#475569',
    'slate-secondary': '#64748B',
    'pro-gold': '#F59E0B',
  },
  fontFamily: {
    sora: ['Sora', 'sans-serif'],
    inter: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  borderRadius: {
    'card': '12px',
    'button': '8px',
    'input': '6px',
  }
}
```

### Typography Rules
| Use | Font | Weight | Size |
|---|---|---|---|
| Page titles (one per screen) | Sora | 700 | 28px |
| Section headings | Sora | 600 | 22px |
| Sub-section / modal titles | Sora | 600 | 18px |
| Body text | Inter | 400 | 14px |
| Emphasised body / labels | Inter | 500 | 14px |
| Key values (fees, times) | Inter | 600 | 14px |
| Metadata / helper text | Inter | 400 | 12px |
| Import addresses / IDs | JetBrains Mono | 400 | 13px |
| Button text | Inter | 600 | 14px (sentence case) |
| Nav labels | Inter | 500 | 12px |
| Badges / chips | Inter | 600 | 11px (ALL CAPS) |

---

## 4. Component Specifications

### Button Variants
```tsx
// Primary — navy bg, white text
<button className="bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-11 px-4 w-full hover:bg-navy-active">

// Secondary — white bg, navy border + text
<button className="bg-white border border-primary-navy text-primary-navy font-inter font-semibold text-sm rounded-button h-11 px-4">

// Destructive — red bg, white text
<button className="bg-red-danger text-white font-inter font-semibold text-sm rounded-button h-11 px-4">

// Ghost — transparent, blue text
<button className="bg-transparent text-interactive-blue font-inter font-semibold text-sm">

// Pro CTA — amber-gold bg, navy text
<button className="bg-pro-gold text-primary-navy font-inter font-semibold text-sm rounded-button h-11 px-4">
```

### Input Pattern
```tsx
// ALWAYS use this pattern — label above input, 6px gap
<div className="flex flex-col gap-1.5">
  <label className="font-inter font-medium text-xs text-slate-body">{label}</label>
  <input className="bg-white border border-border rounded-input h-10 px-3 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none" />
  {error && <span className="text-red-danger text-xs">{error}</span>}
</div>
```

### ProGate Component (locked overlay for Pro features)
```tsx
// Semi-transparent overlay — never block navigation
<div className="relative">
  {children}
  {!isPro && (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-card flex flex-col items-center justify-center gap-3 z-10">
      <LockIcon className="text-slate-secondary w-6 h-6" />
      <p className="font-inter font-medium text-sm text-slate-body text-center">{benefitText}</p>
      <button className="bg-pro-gold text-primary-navy font-semibold text-sm rounded-button h-9 px-4">
        Upgrade to Pro
      </button>
    </div>
  )}
</div>
```

### Job Card
```tsx
// Time top-left | Fee top-right (colour-coded) | Address | Type chip + Platform chip | Navigate button
// Fee colour: teal if net >= $30, amber if $10-$29, red if < $10
```

### CITT Floating Button (always visible on app screens)
```tsx
// 56px circle, gradient navy→blue, white icon, centred above bottom nav, elevated 8px
// Shadow: 0 4px 16px rgba(15,44,78,0.4)
// Position: fixed bottom (60px bottom-nav + 8px gap + half button height)
```

### Scanback Block (calendar only)
```tsx
<div className="bg-scanback-bg border-l-4 border-amber-warning rounded-sm p-2">
  <span className="font-inter text-xs italic text-amber-warning">Scanback — Job #N</span>
</div>
// Not clickable. Cannot be moved or deleted.
```

### Gap Finder Card
```tsx
<div className="bg-gap-finder-bg border-l-4 border-violet-600 rounded-card p-4">
  <span className="font-inter font-semibold text-xs text-violet-600 uppercase">Gap opportunity</span>
  {/* address, offered fee, estimated net */}
  <button className="text-violet-600 font-semibold text-sm">Run CITT check →</button>
</div>
```

---

## 5. Routing Reference (All App Routes)

| Route | Screen | Auth Required | Plan |
|---|---|---|---|
| `/` (marketing) | Landing page | No | Public |
| `/signup` | Sign up | No | Public |
| `/login` | Sign in | No | Public |
| `/forgot-password` | Forgot password | No | Public |
| `/reset-password` | Reset password | No | Public |
| `/onboarding/home` | Onboarding step 1 | Yes (new user) | Any |
| `/onboarding/mileage` | Onboarding step 2 | Yes | Any |
| `/onboarding/durations` | Onboarding step 3 | Yes | Any |
| `/onboarding/booking` | Onboarding step 4 (skippable) | Yes | Any |
| `/` (app, post-login) | Today view | Yes | Any |
| `/map` | Map view | Yes | Pro |
| `/jobs` | Jobs list | Yes | Any |
| `/jobs/new` | Add job | Yes | Any (feature-gated, not data-gated) |
| `/jobs/:id` | Job detail | Yes | Any |
| `/jobs/:id/edit` | Edit job | Yes | Any |
| `/bookings` | Booking review | Yes | Pro |
| `/bookings/:id` | Booking detail | Yes | Pro |
| `/earnings` | Earnings dashboard | Yes | Any (basic) / Pro (full) |
| `/expenses` | Expense tracking | Yes | Any |
| `/reports` | Tax reports | Yes | Pro |
| `/journal` | Notarial journal | Yes | Any |
| `/settings` | Account settings | Yes | Any |
| `/settings/notifications` | Notification settings | Yes | Any |
| `/settings/billing` | Plan & billing | Yes | Any |
| `/book/[username]` | Public booking page | **No** | Public |

**Routing rules:**
- Unauthenticated users hitting any `(app)` route → redirect to `/login`
- Users who have not completed onboarding (steps 1–3) → redirect to `/onboarding/home`
- Free users hitting Pro-only routes → show ProGate overlay, do NOT redirect

---

## 6. API Client Setup

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  withCredentials: true,          // Send cookies with every request
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach CSRF token if available
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  if (csrfToken) config.headers['X-XSRF-TOKEN'] = csrfToken;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response.data.data, // Unwrap response envelope
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data?.error ?? error);
  }
);

export default api;
```

---

## 7. State Management Strategy

**React Query** — all server data (jobs, CITT results, planner, bookings, reports). Manages loading/error/stale states.

```typescript
// Query key conventions
['jobs', { date, status }]
['job', id]
['planner', 'today', date]
['planner', 'gaps', date]
['citt', { address, time, type }]
['bookings', { status }]
['reports', 'earnings', { from, to }]
['user', 'me']
['booking-page', username, date]

// Stale time defaults
// Jobs: 30s (changes frequently during a day)
// CITT results: 2min (short — schedule changes)
// Reports: 5min
// User settings: 10min
```

**Zustand** — client-only UI state:
```typescript
// store/uiStore.ts
interface UIStore {
  // CITT modal
  isCITTOpen: boolean;
  cITTPreFill: { address?: string; time?: string; type?: string } | null;
  openCITT: (preFill?: ...) => void;
  closeCITT: () => void;

  // Active date (Today view date selector)
  activeDate: string; // ISO date string
  setActiveDate: (date: string) => void;

  // Toast
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}
```

---

## 8. Map Integration (Leaflet)

Leaflet cannot run on the server. Always dynamic import with `ssr: false`.

```typescript
// components/map/DayMap.tsx
import dynamic from 'next/dynamic';

const DayMapClient = dynamic(
  () => import('./DayMapClient'),
  { ssr: false, loading: () => <div className="bg-border animate-pulse rounded-card h-64" /> }
);
```

Map features:
- Numbered pins for each confirmed job (numbered by optimised sequence)
- Route polyline connecting jobs in sequence
- Drive time labels on each leg
- Navigate button per pin (opens Google Maps / Apple Maps / Waze deep link)
- Radius circle on home base (set by `service_area_miles` in booking settings)

---

## 9. PWA Configuration

Notaries use this on their phones on the road. PWA installability is required for MVP.

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
```

```json
// public/manifest.json
{
  "name": "Notary Day",
  "short_name": "Notary Day",
  "description": "Everything you already do manually, done automatically.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#0F2C4E",
  "icons": [...]
}
```

---

## 10. Screen Design References

Each screen has an HTML prototype in `docs/prototypes/`. Before implementing any screen, check the corresponding prototype file. The prototypes are the ground truth for layout, component placement, and data display.

| Screen | Route | Prototype File |
|---|---|---|
| Landing | `/` | `B1_auth_onboarding/S-01.html` |
| Sign Up | `/signup` | `B1_auth_onboarding/S-02.html` |
| Onboarding (all steps) | `/onboarding/*` | `B1_auth_onboarding/S-03 to S-06.html` |
| Today View — empty | `/` | `B2_dashboard/S-09.html` |
| Today View — with jobs | `/` | `B2_dashboard/S-10.html` |
| Today View — Free | `/` | `B2_dashboard/S-11.html` |
| Today View — Pro (calendar) | `/` | `B2_dashboard/S-12.html` |
| CITT Modal | overlay | `B3_citt/S-14.html` |
| CITT Verdicts | overlay | `B3_citt/S-15 to S-17.html` |
| Add Job | `/jobs/new` | `B4_jobs/S-19.html` |
| Job Detail | `/jobs/:id` | `B4_jobs/S-20.html` |
| Smart Day Planner | `/` (Pro) | `B5_planner/S-23 to S-25.html` |
| Booking Page Setup | `/settings/booking` | `B6_email_booking/S-29.html` |
| Public Booking Page | `/book/:username` | `B6_email_booking/S-30.html` |
| Invoice Preview | `/jobs/:id` | `B7_invoicing/S-32.html` |
| Earnings Dashboard | `/earnings` | `B7_invoicing/S-34.html` |
| Account Settings | `/settings` | `B8_settings/S-37.html` |
| Plan & Billing | `/settings/billing` | `B8_settings/S-39.html` |

---

## 11. Navigation Deep Links (for Navigate button per job)

```typescript
const openNavigation = (address: string, app: 'google' | 'apple' | 'waze') => {
  const encoded = encodeURIComponent(address);
  const urls = {
    google: `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`,
    apple: `maps://maps.apple.com/?daddr=${encoded}&dirflg=d`,
    waze: `https://waze.com/ul?q=${encoded}&navigate=yes`,
  };
  window.open(urls[app], '_blank');
};
```

The notary's preferred navigation app is stored in `user.preferred_nav_app`. Show that app's button prominently; others as alternatives.

---

## 12. Mobile-First Rules

- Design at 375px (iPhone SE baseline). All layouts must work at 375px.
- Minimum touch target: 44px × 44px.
- Bottom nav is fixed, 60px height. Respect iOS safe area: `padding-bottom: env(safe-area-inset-bottom)`.
- CITT floating button: fixed, centred, 56px circle, 8px above bottom nav, always visible on all app screens.
- Never put primary actions only at the top of the screen — notaries scroll on small phones.
- Desktop layout: sidebar (240px) + content area. Sidebar appears at ≥ 1024px breakpoint.
