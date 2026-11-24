-- CreditGuru Insurance — initial schema (001_init.sql)
-- PostgreSQL / Supabase. Idempotent where practical: run it more than
-- once safely (CREATE TABLE / INDEX IF NOT EXISTS, DROP POLICY IF EXISTS).
-- No demo or seed data: the app starts empty.

-- ---------------------------------------------------------------------------
-- Sequence + helper for lead numbers (CG-YYYY-NNNN).
-- The API calls next_lead_number() via supabase.rpc(), because the
-- supabase-js client cannot run raw SQL (no SELECT nextval() from JS).
-- ---------------------------------------------------------------------------
create sequence if not exists public.lead_seq start with 1 increment by 1;

create or replace function public.next_lead_number()
returns bigint
language sql
security definer
as $$
  select nextval('public.lead_seq');
$$;

-- Security-definer helper for admin checks. Policies must not query
-- public.profiles from inside their own expressions (that would recurse
-- through RLS); a security-definer function bypasses RLS, so it is the
-- safe way for a policy to ask "is the caller an admin?".
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  mobile text,
  role text not null default 'customer'
    check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_id text unique not null, -- e.g. CG-2026-0001
  full_name text not null,
  mobile text not null,
  email text not null,
  city text,
  state text,
  occupation text,
  annual_income text,
  insurance_type text not null,
  coverage text not null,
  policy_number text,
  existing_policy boolean not null default false,
  existing_policy_doc_name text,
  notes text,
  status text not null default 'New'
    check (status in (
      'New', 'Contacted', 'Documents Pending', 'Documents Received',
      'Quote Sent', 'Negotiation', 'Purchased', 'Lost'
    )),
  referral_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  name text not null,
  dob date,
  relationship text
    check (relationship in (
      'Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Other'
    )),
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  company_name text not null,
  policy_name text not null,
  premium_amount numeric not null,
  coverage_amount text not null,
  waiting_period text,
  benefits text,
  claim_settlement text,
  notes text,
  status text not null default 'Sent'
    check (status in (
      'Sent', 'Interested', 'Call Me', 'Need Another Quote', 'Buy Policy'
    )),
  created_at timestamptz not null default now()
);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  policy_number text not null,
  company_name text not null,
  source_website text not null,
  broker text,
  broker_other text,
  product_type text not null,
  customer_name text not null,
  customer_email text not null,
  customer_mobile text not null,
  premium_amount numeric,
  coverage_amount text,
  start_date date,
  expiry_date date,
  status text not null default 'Active'
    check (status in ('Active', 'Renewal Due', 'Expired', 'Lapsed', 'Claimed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid references public.policies (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  doc_type text
    check (doc_type in (
      'Aadhaar', 'PAN', 'Driving License', 'RC Book', 'Existing Policy',
      'Medical Report', 'Address Proof'
    )),
  file_name text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid references public.policies (id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_mobile text not null,
  description text not null,
  status text not null default 'Submitted'
    check (status in (
      'Submitted', 'Under Review', 'Additional Documents Required',
      'Approved', 'Closed'
    )),
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, -- e.g. HARI1001
  referrer_name text,
  referrer_email text,
  referred_email text,
  referred_name text,
  status text not null default 'Pending'
    check (status in ('Pending', 'Successful')),
  reward_tier text,
  created_at timestamptz not null default now()
);

create table if not exists public.renewal_reminders (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies (id) on delete cascade,
  window_days int not null check (window_days in (90, 60, 30, 15, 7)),
  channel text not null check (channel in ('Email', 'SMS', 'WhatsApp')),
  sent_at timestamptz not null default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  subject text not null,
  status text not null check (status in ('sent', 'logged', 'failed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_leads_mobile on public.leads (mobile);
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_lead_id on public.leads (lead_id);
create index if not exists idx_family_members_lead_id
  on public.family_members (lead_id);
create index if not exists idx_quotes_lead_id on public.quotes (lead_id);
create index if not exists idx_policies_customer_email
  on public.policies (customer_email);
create index if not exists idx_policies_customer_mobile
  on public.policies (customer_mobile);
create index if not exists idx_policies_expiry_date
  on public.policies (expiry_date);
create index if not exists idx_policies_policy_number
  on public.policies (policy_number);
create index if not exists idx_documents_policy_id
  on public.documents (policy_id);
create index if not exists idx_documents_lead_id
  on public.documents (lead_id);
create index if not exists idx_claims_policy_id on public.claims (policy_id);
create index if not exists idx_claims_customer_email
  on public.claims (customer_email);
create index if not exists idx_referrals_code on public.referrals (code);
create index if not exists idx_referrals_referrer_email
  on public.referrals (referrer_email);
create index if not exists idx_renewal_reminders_policy_id
  on public.renewal_reminders (policy_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Design notes (read before changing):
-- 1. All API routes use the SERVICE-ROLE client (getSupabaseAdmin()), which
--    bypasses RLS entirely. Ownership is enforced in code there (the portal
--    matches a lead by email + mobile; the admin dashboard is server-side).
--    That is why there are deliberately NO anon SELECT policies below: an
--    anon key cannot prove "this email is mine" without auth, so public
--    reads must go through the service-role API, never straight from the
--    browser.
-- 2. Public form submissions (lead form, claim form, document names) are
--    allowed as anon INSERT only, on the four tables the public site
--    writes to. Nothing else is writable by anon.
-- 3. Authenticated users may read their own profile row (matched on the
--    email in their JWT) or any row if their own profile role is 'admin'.
--    The admin check below only ever needs the caller's OWN profile row,
--    which their profile policy already lets them see, so the EXISTS
--    subquery does not recurse.
-- 4. Full auth-gated RLS (e.g. customers reading only their own leads /
--    policies by email) is completed once Supabase Auth is wired to
--    profiles (profiles.id = auth.uid()). Until then, customer reads go
--    through the service-role portal API, which enforces email + mobile.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.family_members enable row level security;
alter table public.quotes enable row level security;
alter table public.policies enable row level security;
alter table public.documents enable row level security;
alter table public.claims enable row level security;
alter table public.referrals enable row level security;
alter table public.renewal_reminders enable row level security;
alter table public.email_logs enable row level security;

-- Anon INSERT for public form submissions.
drop policy if exists "anon_insert_leads" on public.leads;
create policy "anon_insert_leads" on public.leads
  for insert to anon with check (true);

drop policy if exists "anon_insert_family_members" on public.family_members;
create policy "anon_insert_family_members" on public.family_members
  for insert to anon with check (true);

drop policy if exists "anon_insert_claims" on public.claims;
create policy "anon_insert_claims" on public.claims
  for insert to anon with check (true);

drop policy if exists "anon_insert_documents" on public.documents;
create policy "anon_insert_documents" on public.documents
  for insert to anon with check (true);

-- Authenticated users: read their own profile, or any profile if admin.
-- (The check must use is_admin(): writing `role = 'admin'` here would
-- test the ROW's role and expose every admin profile to any logged-in user.)
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (
    email = (auth.jwt() ->> 'email')
    or public.is_admin()
  );

-- Admins (profile role = 'admin') get full access on the business tables.
-- One policy per table; profiles itself is covered by the policy above.
drop policy if exists "admin_all_leads" on public.leads;
create policy "admin_all_leads" on public.leads
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_family_members" on public.family_members;
create policy "admin_all_family_members" on public.family_members
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_quotes" on public.quotes;
create policy "admin_all_quotes" on public.quotes
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_policies" on public.policies;
create policy "admin_all_policies" on public.policies
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_documents" on public.documents;
create policy "admin_all_documents" on public.documents
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_claims" on public.claims;
create policy "admin_all_claims" on public.claims
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_referrals" on public.referrals;
create policy "admin_all_referrals" on public.referrals
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_renewal_reminders" on public.renewal_reminders;
create policy "admin_all_renewal_reminders" on public.renewal_reminders
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "admin_all_email_logs" on public.email_logs;
create policy "admin_all_email_logs" on public.email_logs
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));
