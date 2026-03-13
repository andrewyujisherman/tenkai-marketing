# Tenkai Marketing

Queue-driven AI SEO agency built on Next.js, Supabase, Stripe, and Gemini. Clients request SEO work from the portal, requests are queued in Supabase, the worker claims and processes them, and deliverables are written back for review inside the app.

Production: [https://tenkai-marketing.vercel.app](https://tenkai-marketing.vercel.app)

## Core Areas

- Marketing site for positioning, pricing, and conversion
- Authenticated client portal for audits, content, reports, settings, and onboarding
- Admin area for users, invites, content review, and client management
- Background queue worker for agent execution and deliverable persistence
- External integrations for PageSpeed, SERP data, Google Search Console, and GA4

## Stack

- Next.js 14 App Router
- React 18
- Supabase for auth, data, and queue storage
- Stripe for subscriptions and billing
- Gemini for agent generation
- Tailwind CSS + shadcn/ui for the UI layer

## Repository Layout

```text
src/
  app/
    (marketing)/      Public-facing site
    (portal)/         Client portal
    (admin)/          Internal admin
    api/              Route handlers
  components/
    landing/          Marketing components
    portal/           Portal UI
    ui/               Shared primitives
  lib/
    agents/           Agent registry and prompts
    integrations/     External data connectors
    deliverables.ts   Deliverable titles, summaries, and score extraction
  workers/
    queue-worker.ts   Queue polling and request execution
supabase/
  migrations/         Database migrations
scripts/
  setup-admin.mjs
  setup-google-auth.ts
```

## Environment

Copy `.env.local.example` to `.env.local` and populate the required values.

Minimum required for app and worker startup:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=
```

Additional integrations used by the full product:

```bash
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_GROWTH=
STRIPE_PRICE_PRO=
ADMIN_MASTER_PASSWORD=
ADMIN_EMAILS=
PAGESPEED_API_KEY=
SERPER_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Start the queue worker in a separate shell after loading environment variables:

```bash
cd tenkai-marketing
set -a && source .env.local && set +a
npm run worker
```

Before starting the worker, check for stale processes:

```bash
ps aux | grep queue-worker | grep -v grep
```

## Scripts

- `npm run dev` starts the Next.js app
- `npm run worker` starts the queue worker
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files
- `npm test` runs the deliverable helper unit tests
- `npm run build` creates a production build
- `npm run quality` runs lint, typecheck, tests, and build

## Queue Flow

1. Client submits a service request.
2. Request is inserted into `service_requests` with status `queued`.
3. The worker claims one queued request at a time and marks it `processing`.
4. The worker enriches the request with scrape and integration data when available.
5. Gemini generates JSON output using the mapped specialist agent prompt.
6. The worker stores the deliverable, summary, and score in `deliverables`.
7. The request is marked `completed` or retried/failed based on outcome.

## Quality Baseline

Current repo guardrails:

- Production build succeeds
- ESLint passes cleanly
- TypeScript passes cleanly
- Deliverable title, summary, and score helpers are unit tested

Run the full verification pass with:

```bash
npm run quality
```

## Notes

- The operational reference for the agent system lives in `codex-tenkai-seo.md`.
- Supabase credentials are sourced from the shared vault documented in that reference file.
- Keep runtime-only secrets out of git; `.env.local` and OAuth token files are already ignored.
