-- 0004_rls.sql
-- Ticket T-0.4 — THE MOST IMPORTANT MIGRATION IN THE REPO.
--
-- Tenant isolation is enforced HERE, at the database, not in the app. If you
-- write a query that would be wrong without an app-layer filter, the policy is
-- wrong — fix the policy.
--
-- Every table gets BOTH `enable row level security` and `force row level
-- security`. The second one matters: without it the table owner bypasses
-- policies entirely.
--
-- No table is reachable without a policy. Default deny.
-- There are NO delete policies anywhere. Nothing hard-deletes; set deleted_at.

-- ---------------------------------------------------------------------------
-- Helpers. security definer so policies stay one-line comparisons.
-- `set search_path = public` is not optional — without it a caller can shadow
-- the tables these functions read.
-- ---------------------------------------------------------------------------

create or replace function auth_centers()
returns setof uuid language sql stable security definer set search_path = public as $$
  select center_id from staff
  where user_id = auth.uid() and deleted_at is null;
$$;

create or replace function auth_role(c uuid)
returns text language sql stable security definer set search_path = public as $$
  select role::text from staff
  where user_id = auth.uid() and center_id = c and deleted_at is null
  limit 1;
$$;

create or replace function auth_is_director(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth_role(c) in ('director', 'org_admin'), false);
$$;

-- Children a classroom-scoped user (teacher / lead_teacher) may touch.
--
-- Includes the 14-DAY HANDOFF GRACE WINDOW: a teacher keeps access to a child
-- for 14 days after that child leaves her room, so she can complete the
-- passport sign-off the promotion flow assigns her. Without this, promotion
-- silently locks her out of her own task.
create or replace function auth_scoped_child_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select distinct e.child_id
  from enrollment e
  join staff s
    on s.center_id = e.center_id
   and s.user_id = auth.uid()
   and s.deleted_at is null
  where e.deleted_at is null
    and e.classroom_id = any (s.classroom_ids)
    and (e.ended_on is null or e.ended_on >= current_date - interval '14 days');
$$;

-- A child is visible if you run the center, or the child is in (or just left)
-- one of your rooms.
create or replace function auth_can_see_child(child uuid, c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select auth_is_director(c) or child in (select auth_scoped_child_ids());
$$;

revoke execute on function auth_centers() from anon;
revoke execute on function auth_role(uuid) from anon;
revoke execute on function auth_is_director(uuid) from anon;
revoke execute on function auth_scoped_child_ids() from anon;
revoke execute on function auth_can_see_child(uuid, uuid) from anon;

-- ---------------------------------------------------------------------------
-- Turn it on everywhere, then hand out access one policy at a time.
-- ---------------------------------------------------------------------------

alter table app_user     enable row level security;
alter table app_user     force  row level security;
alter table organization enable row level security;
alter table organization force  row level security;
alter table center       enable row level security;
alter table center       force  row level security;
alter table classroom    enable row level security;
alter table classroom    force  row level security;
alter table child        enable row level security;
alter table child        force  row level security;
alter table enrollment   enable row level security;
alter table enrollment   force  row level security;
alter table staff        enable row level security;
alter table staff        force  row level security;

alter table gelds_domain    enable row level security;
alter table gelds_domain    force  row level security;
alter table gelds_strand    enable row level security;
alter table gelds_strand    force  row level security;
alter table gelds_standard  enable row level security;
alter table gelds_standard  force  row level security;
alter table gelds_indicator enable row level security;
alter table gelds_indicator force  row level security;

-- ---------------------------------------------------------------------------
-- app_user
-- ---------------------------------------------------------------------------

create policy app_user_read_self on app_user for select to authenticated
  using (id = auth.uid() and deleted_at is null);

-- Colleagues at a shared center, so a director sees who her teachers are.
create policy app_user_read_colleagues on app_user for select to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from staff s
      where s.user_id = app_user.id
        and s.deleted_at is null
        and s.center_id in (select auth_centers())
    )
  );

create policy app_user_update_self on app_user for update to authenticated
  using (id = auth.uid() and deleted_at is null)
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- organization
-- ---------------------------------------------------------------------------

create policy organization_read on organization for select to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from center c
      where c.organization_id = organization.id
        and c.deleted_at is null
        and c.id in (select auth_centers())
    )
  );

create policy organization_update on organization for update to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from center c
      where c.organization_id = organization.id
        and c.id in (select auth_centers())
        and auth_role(c.id) = 'org_admin'
    )
  )
  with check (true);

-- ---------------------------------------------------------------------------
-- center
-- ---------------------------------------------------------------------------

create policy center_read on center for select to authenticated
  using (id in (select auth_centers()) and deleted_at is null);

create policy center_update on center for update to authenticated
  using (id in (select auth_centers()) and auth_is_director(id) and deleted_at is null)
  with check (id in (select auth_centers()));

-- ---------------------------------------------------------------------------
-- classroom — every user at a center can see the room list (the planner needs
-- it); only director+ can change it.
-- ---------------------------------------------------------------------------

create policy classroom_read on classroom for select to authenticated
  using (center_id in (select auth_centers()) and deleted_at is null);

create policy classroom_insert on classroom for insert to authenticated
  with check (center_id in (select auth_centers()) and auth_is_director(center_id));

create policy classroom_update on classroom for update to authenticated
  using (center_id in (select auth_centers()) and auth_is_director(center_id) and deleted_at is null)
  with check (center_id in (select auth_centers()));

-- ---------------------------------------------------------------------------
-- child
--
-- All four roles can see allergies and health flags for children in their
-- rooms — that is a SAFETY requirement, not a privilege. Scoping here is about
-- which children, never about hiding a flag from the adult in the room.
-- ---------------------------------------------------------------------------

create policy child_read on child for select to authenticated
  using (
    deleted_at is null
    and center_id in (select auth_centers())
    and auth_can_see_child(id, center_id)
  );

-- Only director+ enrolls a child.
create policy child_insert on child for insert to authenticated
  with check (center_id in (select auth_centers()) and auth_is_director(center_id));

-- lead_teacher+ may edit a child in their scope (health data lives on the
-- child page); plain teacher may not.
create policy child_update on child for update to authenticated
  using (
    deleted_at is null
    and center_id in (select auth_centers())
    and auth_role(center_id) in ('lead_teacher', 'director', 'org_admin')
    and auth_can_see_child(id, center_id)
  )
  with check (center_id in (select auth_centers()));

-- ---------------------------------------------------------------------------
-- enrollment — the history table. Only director+ writes it.
-- ---------------------------------------------------------------------------

create policy enrollment_read on enrollment for select to authenticated
  using (
    deleted_at is null
    and center_id in (select auth_centers())
    and (
      auth_is_director(center_id)
      or classroom_id in (
        select unnest(s.classroom_ids) from staff s
        where s.user_id = auth.uid() and s.center_id = enrollment.center_id and s.deleted_at is null
      )
    )
  );

create policy enrollment_insert on enrollment for insert to authenticated
  with check (center_id in (select auth_centers()) and auth_is_director(center_id));

create policy enrollment_update on enrollment for update to authenticated
  using (center_id in (select auth_centers()) and auth_is_director(center_id) and deleted_at is null)
  with check (center_id in (select auth_centers()));

-- ---------------------------------------------------------------------------
-- staff — everyone can see who works at their center; director+ manages.
-- ---------------------------------------------------------------------------

create policy staff_read on staff for select to authenticated
  using (center_id in (select auth_centers()) and deleted_at is null);

create policy staff_insert on staff for insert to authenticated
  with check (center_id in (select auth_centers()) and auth_is_director(center_id));

create policy staff_update on staff for update to authenticated
  using (center_id in (select auth_centers()) and auth_is_director(center_id) and deleted_at is null)
  with check (center_id in (select auth_centers()));

-- ---------------------------------------------------------------------------
-- GELDS reference — global, read-only to every authenticated user.
-- No insert/update/delete policy exists. Only the service role (which carries
-- bypassrls) may load these, and only through the import pipeline.
-- ---------------------------------------------------------------------------

create policy gelds_domain_read    on gelds_domain    for select to authenticated using (true);
create policy gelds_strand_read    on gelds_strand    for select to authenticated using (true);
create policy gelds_standard_read  on gelds_standard  for select to authenticated using (true);
create policy gelds_indicator_read on gelds_indicator for select to authenticated using (true);

-- The view inherits the policies of the table it reads.
alter view child_current_classroom set (security_invoker = true);
