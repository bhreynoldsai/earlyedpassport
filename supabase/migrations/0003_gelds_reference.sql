-- 0003_gelds_reference.sql
-- Ticket T-0.6 — GELDS reference tables.
--
-- THE EXCEPTION TO THE UNIVERSAL COLUMN CONTRACT: these tables have no
-- center_id. They are global, read-only to all authenticated users, and
-- writable only by the service role. Application code NEVER writes here, and
-- no model ever writes here.
--
-- Standards content © Georgia Department of Early Care and Learning.

create table gelds_domain (
  id            uuid primary key default gen_random_uuid(),
  gelds_version text not null,
  domain_code   text not null check (domain_code in ('PDM', 'SED', 'APL', 'CLL', 'CD')),
  domain_name   text not null,
  sort_order    int not null default 0,
  unique (gelds_version, domain_code)
);

create table gelds_strand (
  id            uuid primary key default gen_random_uuid(),
  gelds_version text not null,
  domain_code   text not null,
  -- CD only. Null for the other four domains.
  subdomain_code text check (subdomain_code in ('MA', 'SC', 'SS', 'CR', 'CP')),
  strand_name   text not null,
  sort_order    int not null default 0
);
create index gelds_strand_domain_idx on gelds_strand (gelds_version, domain_code);

create table gelds_standard (
  id              uuid primary key default gen_random_uuid(),
  gelds_version   text not null,
  strand_id       uuid references gelds_strand (id),
  domain_code     text not null,
  subdomain_code  text,
  standard_number int not null check (standard_number between 1 and 99),
  standard_text   text not null
);
create index gelds_standard_domain_idx on gelds_standard (gelds_version, domain_code);

-- The indicator is the unit teachers actually attach to activities.
-- Everything in this product hangs off this table.
create table gelds_indicator (
  id               uuid primary key default gen_random_uuid(),
  gelds_version    text not null,
  domain_code      text not null check (domain_code in ('PDM', 'SED', 'APL', 'CLL', 'CD')),
  -- CD ONLY: MA | SC | SS | CR | CP. NULL for the other four domains.
  subdomain_code   text check (subdomain_code in ('MA', 'SC', 'SS', 'CR', 'CP')),
  strand_id        uuid references gelds_strand (id),
  standard_id      uuid references gelds_standard (id),
  -- The 6 in PDM6.3b, the 1 in CD-MA1.4a.
  standard_number  int not null check (standard_number between 1 and 99),
  -- 0 = 0-12mo … 4 = 48-60mo.
  age_band         int not null check (age_band between 0 and 4),
  -- a..f, nullable when a standard has one indicator at an age.
  indicator_letter text check (indicator_letter ~ '^[a-f]$'),
  -- 'PDM6.3b' / 'CD-MA1.4a'. Computed by the importer, never hand-entered.
  full_code        text not null,
  -- DECAL's verbatim wording. NEVER edited.
  indicator_text   text not null,
  -- Our 6th-grade paraphrase. Shown large in the chooser; nullable in v1 with
  -- a fallback to indicator_text. Writing these is a content task, not an
  -- engineering one, and is never generated at import time.
  plain_text       text,
  search_vector    tsvector,

  -- CD carries a subdomain; the other four never do. Two code shapes, one
  -- column, and this constraint is what keeps them honest.
  constraint subdomain_only_on_cd check (
    (domain_code = 'CD' and subdomain_code is not null)
    or (domain_code <> 'CD' and subdomain_code is null)
  ),
  -- Mirrors FULL_CODE_PATTERN in lib/gelds/constants.ts. Bounded standard
  -- number so a parser bug producing PDM0.3b or PDM06.3b is caught here rather
  -- than printed on a monitoring document. Uppercase only.
  constraint full_code_shape check (
    full_code ~ '^(?:(?:PDM|SED|APL|CLL)|CD-(?:MA|SC|SS|CR|CP))[1-9][0-9]?\.[0-4][a-f]?$'
  ),
  unique (gelds_version, full_code)
);

create index gelds_indicator_search_idx on gelds_indicator using gin (search_vector);
create index gelds_indicator_age_idx on gelds_indicator (gelds_version, age_band);
create index gelds_indicator_domain_idx on gelds_indicator (gelds_version, domain_code, subdomain_code, age_band);

-- Deterministic search, so the product is fully usable with zero AI.
create or replace function gelds_indicator_search_refresh()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.plain_text, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.indicator_text, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.full_code, '')), 'C');
  return new;
end;
$$;

create trigger gelds_indicator_search
  before insert or update of plain_text, indicator_text, full_code
  on gelds_indicator
  for each row execute function gelds_indicator_search_refresh();
