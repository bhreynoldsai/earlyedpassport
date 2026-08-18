-- 0007_compass_reference.sql
-- The Compass — our own developmental framework, replacing gelds_*.
--
-- This product no longer references Georgia's GELDS standards or DECAL.
-- See docs/FRAMEWORK.md for the six Pathways and docs/PROJECT-INSTRUCTIONS.md
-- for why. Everything below is original content: our own names, our own
-- groupings, our own wording, written from scratch.
--
-- Same exception to the universal column contract as gelds_* carried: these
-- tables have no center_id. They are global, read-only to all authenticated
-- users, and writable only by the service role (the seed script).
--
-- The gelds_* tables from 0003_gelds_reference.sql are left in place for now
-- rather than dropped here — migrations are forward-only, and dropping them
-- is a separate, deliberate step once nothing depends on them. See
-- docs/OPEN-ITEMS.md.

create table compass_pathway (
  id                  uuid primary key default gen_random_uuid(),
  framework_version   text not null,
  pathway_code        text not null check (pathway_code in ('CM', 'GS', 'FW', 'BF', 'TD', 'WM')),
  pathway_name        text not null,
  summary             text not null,
  sort_order          int not null default 0,
  unique (framework_version, pathway_code)
);

create table compass_milestone_group (
  id                  uuid primary key default gen_random_uuid(),
  framework_version   text not null,
  pathway_code        text not null,
  group_number        int not null check (group_number between 1 and 99),
  group_name          text not null,
  group_description   text not null,
  sort_order          int not null default 0,
  unique (framework_version, pathway_code, group_number)
);
create index compass_milestone_group_pathway_idx on compass_milestone_group (framework_version, pathway_code);

-- The skill marker is the unit teachers actually attach to activities.
-- Everything in this product hangs off this table, same as gelds_indicator
-- did before it.
create table compass_skill_marker (
  id                  uuid primary key default gen_random_uuid(),
  framework_version   text not null,
  pathway_code        text not null check (pathway_code in ('CM', 'GS', 'FW', 'BF', 'TD', 'WM')),
  milestone_group_id  uuid references compass_milestone_group (id),
  -- The 1 in CM-1.3.
  group_number        int not null check (group_number between 1 and 99),
  -- The 3 in CM-1.3.
  marker_number        int not null check (marker_number between 1 and 99),
  -- 0 = 0-12mo … 4 = 48-60mo.
  age_band            int not null check (age_band between 0 and 4),
  -- 'CM-1.3'. Computed by the seed script, never hand-entered.
  full_code           text not null,
  -- Written in plain language from the start — no separate verbatim/plain
  -- split. This is our own writing, so there is nothing else to paraphrase.
  skill_text          text not null,
  search_vector       tsvector,

  -- Mirrors SKILL_MARKER_CODE_PATTERN in lib/framework/constants.ts.
  constraint full_code_shape check (
    full_code ~ '^(CM|GS|FW|BF|TD|WM)-[1-9][0-9]?\.[1-9][0-9]?$'
  ),
  unique (framework_version, full_code)
);

create index compass_skill_marker_search_idx on compass_skill_marker using gin (search_vector);
create index compass_skill_marker_age_idx on compass_skill_marker (framework_version, age_band);
create index compass_skill_marker_pathway_idx on compass_skill_marker (framework_version, pathway_code, age_band);

-- Deterministic search, so the product is fully usable with zero AI.
create or replace function compass_skill_marker_search_refresh()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.skill_text, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.full_code, '')), 'B');
  return new;
end;
$$;

create trigger compass_skill_marker_search
  before insert or update of skill_text, full_code
  on compass_skill_marker
  for each row execute function compass_skill_marker_search_refresh();

-- Row level security: global reference data, read-only to every
-- authenticated user, exactly like gelds_* before it.
alter table compass_pathway         enable row level security;
alter table compass_pathway         force  row level security;
alter table compass_milestone_group enable row level security;
alter table compass_milestone_group force  row level security;
alter table compass_skill_marker    enable row level security;
alter table compass_skill_marker    force  row level security;

create policy compass_pathway_read         on compass_pathway         for select to authenticated using (true);
create policy compass_milestone_group_read on compass_milestone_group for select to authenticated using (true);
create policy compass_skill_marker_read    on compass_skill_marker    for select to authenticated using (true);

-- No table here carries a DELETE grant — nothing in this product hard
-- deletes, same rule the rest of the schema lives under. Only the seed
-- script writes these tables, and it runs as the service role, which needs
-- no explicit grant here — same as gelds_* before it.
grant select on compass_pathway         to authenticated;
grant select on compass_milestone_group to authenticated;
grant select on compass_skill_marker    to authenticated;
