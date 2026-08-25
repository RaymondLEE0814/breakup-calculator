-- v2: six calculators (a screener and a deep dive per life stage).
--
-- Runs safely against a live table. Old clients keep inserting successfully
-- because both new columns have defaults, and old rows keep rendering because
-- model_version tells the share page which label set to use.

-- The three deep calculators are new calc_type values. The screeners keep the
-- bare family ids, since they occupy the same URLs and answer the same search
-- intent; model_version is what separates a v1 row from a v2 one.
alter table public.shared_results
  drop constraint if exists shared_results_calc_type_check;

alter table public.shared_results
  add constraint shared_results_calc_type_check
  check (calc_type in (
    'breakup', 'divorce', 'twilight',
    'breakup-deep', 'divorce-deep', 'twilight-deep'
  ));

-- 1 = the retired model. Every existing row is one, and the default backfills
-- them without a migration pass.
alter table public.shared_results
  add column if not exists model_version smallint not null default 1;

-- The 2x2 profile type, deep calculators only.
alter table public.shared_results
  add column if not exists type_code text null;

alter table public.shared_results
  drop constraint if exists shared_results_type_code_check;

alter table public.shared_results
  add constraint shared_results_type_code_check
  check (type_code is null or type_code in (
    'companion', 'drift', 'inertia', 'crossroad',      -- 연애 심화
    'team', 'overheat', 'roommate', 'burnout',         -- 부부 심화
    'partner', 'duty', 'separate', 'formality'         -- 황혼 심화
  ));

create index if not exists shared_results_model_idx
  on public.shared_results (calc_type, model_version, created_at desc);

-- Aggregates split by model version: a v1 index and a v2 index come off
-- different instruments, and averaging them together would be meaningless.
create or replace view public.stats_summary
with (security_invoker = on) as
select
  calc_type,
  model_version,
  count(*)                                                       as n,
  round(avg(risk_index))::int                                    as avg_index,
  (percentile_cont(0.5) within group (order by risk_index))::int  as median_index
from public.shared_results
group by calc_type, model_version;
