-- 상담 신청서.
--
-- This is the first table in the project that holds a way to reach a real
-- person, and its policies are the mirror image of shared_results: anonymous
-- visitors may insert and nothing else. There is no select policy, no update
-- policy and no delete policy, so a phone number cannot be read back from a
-- browser under any circumstances. Operations read this table through the
-- dashboard or a service-role key.
--
-- Answers to the questionnaires are never written here. What may be attached,
-- and only when the visitor ticks the box, is the summary: an index, a grade,
-- a type code, or for the fault calculator a banded ratio and which grounds
-- carried it.

create table if not exists public.consult_requests (
  id             uuid primary key default gen_random_uuid(),
  -- Generated once per rendered form, so a retry after a failed send cannot
  -- create a second row.
  client_token   uuid        not null unique,
  kind           text        not null check (kind in ('counseling', 'legal')),
  -- Where the visitor came from. A label, never a score.
  source         text        not null default 'direct'
                 check (source in ('direct', 'divorce', 'divorce-deep',
                                   'twilight', 'twilight-deep', 'fault')),

  nickname       text        not null check (char_length(nickname) between 1 and 20),
  phone          text        not null check (phone ~ '^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$'),
  contact_hours  text        not null
                 check (contact_hours in ('weekday_day', 'weekday_evening',
                                          'weekend', 'text_first')),

  -- counseling only
  method         text        null check (method in ('inperson', 'video', 'phone')),
  region         text        null check (char_length(region) <= 20),

  -- legal only
  topics         text[]      null,
  marriage_band  text        null check (marriage_band in ('lt5', 'y5_15', 'y15_30', 'gte30')),
  minor_children text        null check (minor_children in ('yes', 'no', 'na')),

  message        text        null check (char_length(message) <= 500),

  -- Opt-in result summary. Nothing here can reconstruct an answer.
  result_attached boolean    not null default false,
  risk_index     smallint    null check (risk_index between 5 and 85),
  grade          text        null check (grade in ('stable', 'check', 'caution', 'warning')),
  type_code      text        null,
  fault_band     text        null check (char_length(fault_band) <= 16),
  fault_top_dims text[]      null,

  agreed_privacy_at    timestamptz not null,
  agreed_thirdparty_at timestamptz not null,

  status         text        not null default 'new'
                 check (status in ('new', 'contacted', 'closed', 'spam')),
  created_at     timestamptz not null default now()
);

create index if not exists consult_requests_created_idx
  on public.consult_requests (created_at desc);

create index if not exists consult_requests_status_idx
  on public.consult_requests (status, created_at desc);

alter table public.consult_requests enable row level security;

-- Insert only. Deliberately no select/update/delete policy for anon.
drop policy if exists "anon insert only" on public.consult_requests;
create policy "anon insert only"
  on public.consult_requests
  for insert
  to anon
  with check (
    -- Summary fields may only be present when the visitor ticked the box.
    result_attached
    or (risk_index is null and grade is null and type_code is null
        and fault_band is null and fault_top_dims is null)
  );

-- Retention. Ninety days, matching what the consent notice promises.
-- Run daily if pg_cron is available on this plan:
--   select cron.schedule('purge-consult-requests', '0 4 * * *', $$
--     delete from public.consult_requests where created_at < now() - interval '90 days';
--   $$);
-- Otherwise run the delete manually once a month — the notice says "90일 후
-- 지체 없이", which leaves room for a monthly sweep.
