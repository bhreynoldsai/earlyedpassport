-- 0002_core_schema.sql
-- Ticket T-0.3 — organization, center, classroom, child, enrollment, staff,
-- app_user, and the child_current_classroom view.
--
-- UNIVERSAL COLUMN CONTRACT (BUILD-INSTRUCTIONS §2.1)
-- Every business table carries: id, center_id, created_at, updated_at,
-- created_by, deleted_at.
--
-- center_id is NOT NULL on every business table, including deeply nested ones,
-- even though it is derivable. Denormalizing it makes every RLS policy a single
-- indexed comparison instead of a join — and joins in RLS policies are exactly
-- where tenant leaks hide.
--
-- Never DELETE. Set deleted_at. Every RLS USING clause carries
-- `deleted_at is null` so soft-deleted rows are invisible by default.

-- Exactly four roles. Do not add a fifth. Do not build custom permissions.
create type staff_role as enum ('teacher', 'lead_teacher', 'director', 'org_admin');

-- Mirrors auth.users. Application-visible profile fields only; no credentials.
create table app_user (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       citext not null unique,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- The company that owns centers. Has no center_id — it is above that scope.
create table organization (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references app_user (id),
  deleted_at  timestamptz
);

-- A physical licensed location.
create table center (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organization (id) on delete restrict,
  name              text not null,
  decal_license_no  text,
  -- Every date in the product is stored UTC and rendered in this zone.
  time_zone         text not null default 'America/New_York',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references app_user (id),
  deleted_at        timestamptz
);
create index center_org_idx on center (organization_id, deleted_at);

create table classroom (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center (id) on delete restrict,
  name          text not null,
  -- 0 = 0-12mo, 1 = 12-24mo, 2 = 24-36mo, 3 = 36-48mo, 4 = 48-60mo.
  -- Mirrors AGE_BANDS in lib/gelds/constants.ts.
  age_band      int not null check (age_band between 0 and 4),
  capacity      int check (capacity > 0),
  -- Drives the Georgia Pre-K required-components checklist and the
  -- differentiation requirement on activities.
  is_ga_prek    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references app_user (id),
  deleted_at    timestamptz
);
create index classroom_center_idx on classroom (center_id, deleted_at);

create table child (
  id               uuid primary key default gen_random_uuid(),
  center_id        uuid not null references center (id) on delete restrict,
  first_name       text not null,
  last_name        text not null,
  preferred_name   text,
  -- Written, not phonetic-spec — a teacher types what she'd say out loud.
  name_pronunciation text,
  date_of_birth    date not null,
  photo_path       text,
  home_language    text,
  -- Collected at enrollment (Phase 2), enforced in Phase 5 queries. Shipping
  -- enforcement without collection is the classic version of this bug, so the
  -- column exists from the start and defaults to the safe answer.
  photo_consent    boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       uuid references app_user (id),
  deleted_at       timestamptz
);
create index child_center_idx on child (center_id, deleted_at);

-- Enrollment is dated HISTORY, not a field.
-- There is deliberately no classroom_id column on child.
create table enrollment (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center (id) on delete restrict,
  child_id      uuid not null references child (id) on delete restrict,
  classroom_id  uuid not null references classroom (id) on delete restrict,
  started_on    date not null,
  ended_on      date,
  ended_reason  text check (ended_reason in ('promoted', 'withdrawn', 'transferred')),
  -- Program start drives every compliance deadline (lib/compliance/rules.ts).
  program_start date not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references app_user (id),
  deleted_at    timestamptz,
  constraint enrollment_dates_ordered check (ended_on is null or ended_on >= started_on)
);
create index enrollment_center_idx on enrollment (center_id, deleted_at);
create index enrollment_child_idx on enrollment (child_id, deleted_at);
create index enrollment_classroom_idx on enrollment (classroom_id, ended_on, deleted_at);

-- Authorization data. Policies read this and nothing else.
create table staff (
  id             uuid primary key default gen_random_uuid(),
  center_id      uuid not null references center (id) on delete restrict,
  user_id        uuid not null references app_user (id) on delete restrict,
  role           staff_role not null,
  -- Rooms a teacher/lead_teacher is assigned to. Ignored for director+.
  classroom_ids  uuid[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references app_user (id),
  deleted_at     timestamptz,
  unique (center_id, user_id)
);
create index staff_center_idx on staff (center_id, deleted_at);
create index staff_user_idx on staff (user_id, deleted_at);

-- "What room is Maya in" goes through this view. Always.
-- If you find yourself wanting to cache it on child, don't.
create view child_current_classroom as
  select distinct on (child_id)
    child_id,
    center_id,
    classroom_id,
    started_on
  from enrollment
  where ended_on is null
    and deleted_at is null
  order by child_id, started_on desc;

-- updated_at maintenance, applied to every business table.
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger app_user_touch    before update on app_user    for each row execute function touch_updated_at();
create trigger organization_touch before update on organization for each row execute function touch_updated_at();
create trigger center_touch      before update on center      for each row execute function touch_updated_at();
create trigger classroom_touch   before update on classroom   for each row execute function touch_updated_at();
create trigger child_touch       before update on child       for each row execute function touch_updated_at();
create trigger enrollment_touch  before update on enrollment  for each row execute function touch_updated_at();
create trigger staff_touch       before update on staff       for each row execute function touch_updated_at();
