-- 헤어질 확률 계산기 — shared result summaries.
--
-- Nothing here identifies a person. There is no account, no IP, no email, and
-- deliberately no copy of the individual answers: a share link is meant to
-- show the shape of a result, not a transcript of what someone confessed to a
-- form. Rows are written only when a visitor presses "결과 링크 만들기".

create table if not exists public.shared_results (
  id          uuid primary key default gen_random_uuid(),
  -- 10 chars from a lookalike-free alphabet, generated in the browser.
  slug        text        not null unique,
  calc_type   text        not null check (calc_type in ('breakup', 'divorce', 'twilight')),
  -- Wording only: the score is identical whichever side answers.
  perspective text        not null check (perspective in ('m', 'f', 'na')),
  -- {"behavior": 63, "structure": 25, ...}, each 0–100.
  axis_scores jsonb       not null,
  -- The logistic mapping is clamped to 5–85, so anything outside is a bug.
  risk_index  smallint    not null check (risk_index between 5 and 85),
  grade       text        not null check (grade in ('stable', 'check', 'caution', 'warning')),
  -- Question ids such as {'A6','A7','A15'} — ids, never the chosen answers.
  top_factors text[]      not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists shared_results_created_at_idx
  on public.shared_results (created_at desc);

create index if not exists shared_results_calc_type_idx
  on public.shared_results (calc_type, created_at desc);

alter table public.shared_results enable row level security;

-- Anyone may create a share link.
drop policy if exists "anon insert" on public.shared_results;
create policy "anon insert"
  on public.shared_results
  for insert
  to anon
  with check (true);

-- Reads are open, but the client only ever queries a single row by slug, and a
-- slug is 10 random characters. If enumeration ever becomes a concern, replace
-- this with a security-definer RPC that takes the slug as an argument.
drop policy if exists "anon select" on public.shared_results;
create policy "anon select"
  on public.shared_results
  for select
  to anon
  using (true);

-- No update or delete policy: shared results are immutable.

-- Aggregate view for the "함께 본 사람들의 중앙값" line. Kept behind the
-- caller's own permissions, and only meaningful once n is large enough — the
-- rows here come from people who chose to share, which is not a random sample.
create or replace view public.stats_summary
with (security_invoker = on) as
select
  calc_type,
  count(*)                                                        as n,
  round(avg(risk_index))::int                                     as avg_index,
  (percentile_cont(0.5) within group (order by risk_index))::int   as median_index
from public.shared_results
group by calc_type;
