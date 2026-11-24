# CreditGuru Insurance

Insurance lead generation and customer management platform for
**CreditGuru Insurance** — hariteja's insurance advisory in Hyderabad.

- **Brand:** CreditGuru Insurance (the PRD working name "InsureWithHariteja"
  is intentionally not used anywhere in the site)
- **Domain shown in the site:** creditguruinsurances.com (e.g. referral
  links `creditguruinsurances.com/ref/HARI1001`). The owner has no domain
  registered yet; the site runs on its free Vercel link and the domain name
  is used in content/links.
- **Contact:** +91 9392961261 · creditguruservices@gmail.com · WhatsApp on
  the same mobile number · Service area: Hyderabad, Telangana
- **Experience:** more than 7 years · **Social proof:** 1000+ policies sold,
  10,000+ families guided (real figures — no other counts are invented)

## Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth) via `@supabase/supabase-js` /
  `@supabase/ssr` — no separate backend server
- **Email:** Resend-ready (`lib/email.ts` sends via Resend when
  `RESEND_API_KEY` is set; otherwise the email is recorded in the
  `email_logs` table and the flow never crashes)
- **Hosting:** Vercel Hobby (no card needed)

## What is built

| Area | Route | Covers |
|---|---|---|
| Home | `/` | Hero ("Health, Life, Savings & Vehicle Insurance in One Place"), Get Free Quote / Compare Plans / Talk To Advisor, Same Day Purchase Surprise Gift + Refer Friends highlights, products grid, "BUY TODAY. GET REWARDED." campaign, social proof (1000+ / 10,000+), testimonials empty state (no invented testimonials), WhatsApp buttons |
| Products | `/products/health`, `/life`, `/term`, `/savings`, `/motor`, `/commercial` | Benefits, why buy, FAQs, CTA — Health (Individual, Family Floater, Senior Citizen, Critical Illness), Life (Whole Life, Child, Wealth Protection), Term (Pure Protection, Income Protection), Savings (ULIP, Endowment, Pension, Retirement), Motor (Car, Bike, Commercial Vehicle), Commercial (Employee Health, Group Insurance) |
| About | `/about` | Advisor intro, 7+ years, services, claims support, customer-centric approach, principle: "We work on the relationship with you, not for high commission." |
| Contact | `/contact` | Contact form (POSTs to `/api/contact`), phone, email, WhatsApp, Hyderabad service area |
| Lead form | `/quote` | Full name, mobile (required), email (required), city, state, occupation, annual income, insurance type, coverage (₹5L–₹2Cr+), **policy number**, family members (name, DOB, relationship), existing policy Yes/No + document upload, notes. On submit: saves the lead, generates referral code, shows acknowledgement. Accepts `?ref=CODE`. |
| Admin dashboard | `/admin` | Metrics: Total Leads, New Leads, Quotes Sent, Policies Issued, Pending Follow-Ups, Renewals Due, Referral Conversions, Revenue Generated. Lead management with all 8 statuses (New, Contacted, Documents Pending, Documents Received, Quote Sent, Negotiation, Purchased, Lost); lead detail with family, quotes and quote creation |
| Quote management | (in `/admin`, via `/api/quotes`) | Multiple quote options per lead (company, policy, premium, coverage, waiting period, benefits, claim settlement, notes); customer responses: Interested / Call Me / Need Another Quote / Buy Policy |
| Policy tracker | `/admin/policies` + portal | Policies done from different websites: policy number, company, **source website**, **broker** (QuickInsure, PolicyBazaar, InsuranceDekho, Other — with a free-text broker name when Other is chosen), product type, customer name/email/mobile, premium, coverage, start/expiry dates, status (Active / Renewal Due / Expired / Lapsed / Claimed), notes, document upload; search + filters by company, source website, broker, product, status |
| Renewal Reminder Centre | `/admin/renewals` | Clients grouped by 90/60/30/15/7 days before expiry, with the **broker shown on every row** so the admin can see at a glance which broker a pending renewal belongs to; send to one client or all due in a window (Email / SMS / WhatsApp); sent log (also shows broker); automatic-reminder sweep (`POST /api/renewals/sweep`). Driven only by real tracked policies |
| Customer portal | `/portal` | Sign in with email + mobile from the inquiry; profile (with policy number + notes), family, quotes (+ respond), tracked policies, documents, claims (raise + track), referrals, rewards |
| Referrals | `/ref/[code]` + portal | Every customer gets a code (`HARI` + 4 digits) and link `creditguruinsurances.com/ref/[code]`; tiers: 1 policy → Surprise Gift, 3 → Premium Gift, 5 → Gold Member Reward, 10 → VIP Reward Package; dashboard shows count, pending, successful, reward status |
| Email workflows | `lib/email-templates.ts` + `email_logs` | Customer: Lead Confirmation, Quote Sent, Policy Issued, Renewal Reminder, Referral Reward Earned. Admin: New Lead, New Referral, Policy Purchased, Claim Request, Renewal Due |
| SEO | `app/layout.tsx` | Title/meta using the PRD keywords (Health Insurance Hyderabad, Term Insurance Advisor, Life Insurance Advisor, Vehicle Insurance Hyderabad, Best Insurance Consultant, Insurance Comparison Services, Family Health Insurance, Commercial Insurance Services) |

## Database

`supabase/migrations/001_init.sql` — 10 tables (`profiles`, `leads`,
`family_members`, `quotes`, `policies`, `documents`, `claims`,
`referrals`, `renewal_reminders`, `email_logs`), `lead_seq` sequence with
a `next_lead_number()` RPC (lead numbers `CG-YYYY-NNNN`), indexes, and
RLS on every table. RLS design (documented in the migration): anon may
INSERT leads/family_members/claims/documents only; all reads go through
the service-role API routes, which enforce ownership in code (portal
matches email + mobile); authenticated users read their own profile row
or any row if their profile role is `admin` (via a security-definer
`is_admin()` helper, so policies never recurse). Full auth-gated RLS is
completed once Supabase Auth is wired to `profiles`.

## Setup

### 1. Install and run locally

```bash
cd creditguru-insurance
npm install
cp .env.example .env.local   # fill in the real values (never commit .env.local)
npm run dev                  # http://localhost:3000
```

### 2. Supabase project

1. Create a project at https://supabase.com/dashboard (free tier, region
   closest to your users — e.g. South Asia / Mumbai).
2. In the Supabase SQL Editor, run the whole of
   `supabase/migrations/001_init.sql`.
3. Copy the project URL + anon key (Settings → API) into `.env.local`
   as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copy the **service role key** (Settings → API, keep it secret) into
   `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`. It is server-only.
5. Create the first admin user (see "Admin access" below): add the user
   in Supabase Dashboard → Authentication → Users, then link their
   profile row to role `admin` in the SQL Editor.

### 3. Admin access

The admin dashboard (`/admin`, `/admin/policies`, `/admin/renewals`)
is protected by Supabase Auth. The login page is `/admin/login`
(email + password). A visitor is let in only when they are signed in
**and** their row in `public.profiles` has `role = 'admin'` — the check
runs in `middleware.ts` and again in the protected admin layout, and
the Sign out button is in the admin header. Unauthenticated or
non-admin visitors are sent to `/admin/login`.

**Create the first admin user** (do this once, in the Supabase
Dashboard — never put a password in the repo or in chat):

1. Supabase Dashboard → Authentication → Users → Add user. Enter the
   email `creditguruservices@gmail.com` and a password you choose
   yourself, and confirm the user (tick "Auto Confirm User" if the
   project requires email confirmation and you cannot receive the
   confirmation email).
2. Supabase Dashboard → SQL Editor → run this, which creates the
   profile row linked to that Auth user (the `id` **must** be the Auth
   user's id, so the `is_admin()` check works) and sets the role:

```sql
insert into public.profiles (id, email, full_name, role)
select id, email, 'Hariteja Chintakunta', 'admin'
from auth.users
where email = 'creditguruservices@gmail.com'
on conflict (id) do update set role = 'admin';
```

3. Check it worked:

```sql
select id, email, full_name, role
from public.profiles
where email = 'creditguruservices@gmail.com';
-- role must read 'admin'
```

4. Open `/admin/login`, sign in with that email and password — you
   should land on the Advisor Dashboard.

To make another user an admin later, repeat step 1 for their email
and run the same SQL with their email (or, if their profile row
already exists: `update public.profiles set role = 'admin' where
email = '<their email>';`). To remove admin access, set the role back
to `'customer'`. Customer accounts do not use Supabase Auth — the
customer portal signs in with the email + mobile from the inquiry, as
before.

### 4. Email (optional, for real sending)

Set `RESEND_API_KEY` in `.env.local` (get a key at https://resend.com,
free tier). Without it, every workflow email is recorded in the
`email_logs` table with status `logged` and the app keeps working.

### 5. Deploy on Vercel (Hobby, no card)

```bash
# 1. Push this folder to a new GitHub repo (see below).
# 2. In Vercel (vercel.com, signed in with GitHub): Add New → Project →
#    import the repo. Framework preset: Next.js. Root directory: repo root.
# 3. Add the same environment variables as .env.local
#    (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#    SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY (optional),
#    NEXT_PUBLIC_SITE_URL=https://creditguruinsurances.com).
# 4. Deploy. The live URL will be https://<project>.vercel.app.
```

GitHub repo (push from your machine — the workspace has no push
credentials; the browser is signed in as Hariteja-Chintakunta):

```bash
git init
git add .
git commit -m "CreditGuru Insurance — initial build (Next.js + Supabase)"
git branch -M main
git remote add origin https://github.com/Hariteja-Chintakunta/creditguru-insurance.git
git push -u origin main
```

## Verification (done locally, 2026-11-24)

- `npm install` — clean (133 packages).
- `npx tsc --noEmit` — clean, zero errors.
- `npm run build` — succeeds on Next.js 14.2.35: 17 static pages,
  12 dynamic API routes (see route table above).
- `supabase/migrations/001_init.sql` — parses cleanly (pglast, 68
  statements); **not yet run against a real Supabase database** — the
  migration must be applied in the Supabase SQL Editor, then the
  end-to-end flow exercised (lead → quote → policy → renewal → portal).
- Smoke test of the production build (`next start`): `/`, `/quote`,
  `/admin`, `/portal` all return 200; the home page contains the brand
  and hero headline; API routes without Supabase configured return a
  fast, clean JSON error (`{"ok":false,"error":"Supabase is not
  configured..."}`) instead of hanging.
- Greps: 0 mentions of "InsureWithHariteja", 0 secrets/keys, 0 demo or
  fake data markers anywhere in the repo.

## Honest limits

- **No demo data.** The app starts completely empty. Leads, policies,
  quotes and reminders only appear once real records are added.
- **Resend needs a key** for real emails; without it, emails are only
  logged in `email_logs` (visible in the admin email log).
- **SMS / WhatsApp need provider setup.** Reminder sends on those
  channels are recorded in `renewal_reminders`; WhatsApp sends return
  a pre-filled `wa.me` link to open a chat with the client. There is no
  live SMS gateway wired in.
- **Document upload records file names** (and `storage_path` when a
  storage upload is wired); files themselves are not yet uploaded to
  Supabase Storage — that is a follow-up step.
- **Admin login is wired in.** `/admin/*` requires a Supabase Auth
  session and a `profiles` row with role `admin` (see "Admin access"
  above). The customer portal still signs in with email + mobile, not
  Supabase Auth. Every admin API operation also requires a signed-in
  admin (401 when not signed in, 403 when signed in but not admin):
  `GET /api/leads`, `GET/PATCH /api/leads/[id]`, `POST/GET /api/policies`,
  `POST/GET /api/quotes`, `GET /api/claims`, `GET /api/referrals`,
  `GET /api/renewals`, `POST /api/renewals/send`,
  `POST /api/renewals/sweep`. Deliberately public: `POST /api/leads`
  (lead form), `POST /api/portal` (customer portal sign-in),
  `POST /api/contact` (contact form), `POST /api/claims` (customer
  raises a claim) and `PATCH /api/quotes/[id]` (the customer's own
  quote response from the portal). The renewal sweep needs a signed-in
  admin session, so a daily cron calling it must hold admin credentials
  — adding a `CRON_SECRET` for unauthenticated schedulers is a
  follow-up if needed.
- **Domain:** the public link will be a Vercel `*.vercel.app` URL, not
  `creditguruinsurances.com`, until that domain is registered and
  connected in Vercel.
