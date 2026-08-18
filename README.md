# Notary Day Frontend

Notary Day is a mobile-first operations platform for mobile notaries and loan signing agents. This repository contains the Next.js application used to manage daily appointments, evaluate incoming work, plan travel, track business activity, and accept public booking requests.

The primary workflow is built around the reality of field work. A notary needs to make fast decisions from a phone while moving between appointments, and loan signings often require a fixed scanback period after the signing. The interface makes those constraints visible and actionable.

## Product Experience

- **Today and day views** provide the working schedule, appointment status, summaries, and day-level operational context.
- **CITT, Can I Take This?** is available from the application navigation for rapid feasibility and profitability checks.
- **Job operations** cover manual creation, editing, status updates, details, imports, and review workflows.
- **Planner and gap workflows** surface route information, scanback blocks, and potential work that fits the remaining schedule.
- **Map view** presents confirmed jobs geographically and provides navigation links for supported map applications.
- **Public booking** gives each notary a client-facing page with server-calculated availability.
- **Business tools** include earnings, expenses, reports, invoices, journal entries, notifications, email templates, account settings, and billing.
- **Onboarding** captures the home base, scanback preferences, signing type defaults, and booking setup needed to personalize planning.
- **PWA support** allows the application to be installed and used like a focused mobile app.

## Technology

| Concern | Implementation |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI and styling | React 19 and Tailwind CSS 4 |
| Server state | TanStack Query |
| Client-only state | Zustand |
| Forms and validation | React Hook Form and Zod |
| HTTP | Axios with JWT Bearer authentication |
| Maps | Leaflet and React Leaflet with OpenStreetMap tiles |
| Icons | Lucide React |
| PWA | next-pwa |
| Utilities | date-fns and clsx |

## Frontend Architecture

The application uses the Next.js App Router and separates route-level concerns from reusable UI and data access code.

### Route Groups

- `(auth)` contains login, signup, password recovery, and password reset screens.
- `(onboarding)` contains the multi-step setup flow for new users.
- `(app)` contains the authenticated workspace, including today, day, jobs, bookings, imports, gap work, reports, invoices, expenses, journal, notifications, and settings.
- `book/[username]` contains the public booking experience.
- `offline` provides the offline state used by the PWA experience.

The authenticated workspace uses a desktop sidebar and mobile bottom navigation. The CITT action remains available from the core application shell so a notary can evaluate a job without leaving the current workflow.

### Data Access

API modules under `src/api` provide focused access to authentication, users, jobs, CITT, planning, booking, accounting, invoices, notifications, and billing endpoints. Hooks under `src/hooks` expose those operations to screens and components.

The Axios client reads `NEXT_PUBLIC_API_URL` and sends the token stored as `localStorage.auth_token` in the `Authorization` header. Requests use `withCredentials: false`, matching the backend's stateless JWT authentication model. API responses are normalized to work with the backend's standard success and error envelopes.

TanStack Query owns server state, including jobs, planner data, CITT results, bookings, invoices, and account data. Zustand is reserved for local interface state such as the CITT modal, active date, navigation status, and toast notifications. This keeps cache invalidation and loading behavior close to the data that owns it.

### Responsive and Map Rendering

The workspace is designed for small phone screens first, with touch-friendly controls and a fixed mobile navigation bar. Larger screens use a persistent sidebar and wider content layouts.

Leaflet components are dynamically loaded on the client because the map library depends on browser APIs. The map view renders job markers, route context, and navigation actions without forcing Leaflet into server rendering.

## Implemented Workflows

### Daily Operations

The Today and Day screens organize appointments and current work around the notary's active date. Job cards show core appointment and earnings context, while status controls support the operational lifecycle from pending work through completion.

### CITT

The CITT modal collects an address, appointment time, signing type, and fee details. It presents the backend verdict with travel information, mileage impact, net earnings, effective hourly rate, and scanback conflict details. A result can be used to create or continue a job workflow.

### Import Review

The import experience provides review and edit states for extracted job data. Imported information remains user-editable before it is accepted into the schedule, which is important when source emails or images are incomplete.

### Public Booking

The public route at `/book/[username]` is designed for clients rather than authenticated users. It displays the notary's service information and only the appointment slots returned as available by the backend. Internal appointment addresses, client information, and schedule details remain private.

### Financial and Administrative Tools

Authenticated users can review earnings, record expenses, maintain journal entries, generate and manage invoices, view notifications, customize email templates, and manage profile, operational, navigation, password, and billing settings.

## Project Structure

Key directories include:

- `src/app`: route segments and page composition
- `src/components`: reusable UI, layout, job, CITT, planner, booking, map, settings, and reporting components
- `src/api`: backend API clients grouped by domain
- `src/hooks`: query and mutation hooks used by screens
- `src/store`: Zustand stores for local UI state
- `src/lib`: Axios configuration and shared utilities
- `src/types`: TypeScript domain types
- `public`: static assets, PWA metadata, and service-worker output

## Requirements

- Node.js 20 or newer
- The Notary Day backend available locally or at a configured deployment URL

## Local Development

1. Install dependencies with `npm install`.
2. Create `.env.local` from `.env.local.example`.
3. Set `NEXT_PUBLIC_API_URL` to the backend API base, such as `http://localhost:4000/api/v1`.
4. Set `NEXT_PUBLIC_APP_URL` to the frontend origin, such as `http://localhost:3000`.
5. Start the development server with `npm run dev`.

The application is available at `http://localhost:3000` by default.

For a production-style run, use `npm run build` followed by `npm start`.

## Verification

- `npm run lint` runs the configured ESLint checks.
- `npm run build` validates the Next.js production build using the repository's Webpack build configuration.
- `npm start` serves the compiled application.

There is currently no test runner configured in this repository. The main verification path is linting, production builds, and end-to-end validation against the backend API.

## Engineering Highlights

- The interface separates server data from local UI state, reducing unnecessary global state and making cache behavior predictable.
- JWT authentication is implemented consistently with the backend API contract.
- Public booking and authenticated operations are represented as separate route experiences.
- Client-only map code is isolated from server rendering through dynamic loading.
- Forms use typed validation and reusable field components.
- The layout is responsive and optimized for repeated, one-handed actions in the field.
- Pro functionality is presented through feature gates and upgrade surfaces while preserving navigation and existing user data.

## Deployment

The application can be deployed to platforms that support Next.js, including Vercel and Railway. Production configuration requires `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL`, with the API configured to accept the deployed frontend origin.

## License

This project is private and not licensed for redistribution.

Built by [Yusuf Afolabi](https://github.com/Dev-folabi) for [notaryday.app](https://notaryday.app).
