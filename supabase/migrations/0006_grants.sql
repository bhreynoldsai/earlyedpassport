-- 0006_grants.sql
-- Ticket T-0.2a — table privileges, stated explicitly.
--
-- PRIVILEGES ARE THE OTHER HALF OF THE SECURITY MODEL, and until this migration
-- they were not in the repo at all.
--
-- Row level security decides which ROWS a role may see. A GRANT decides whether
-- the role may touch the TABLE at all. Both have to be right:
--
--   policy without grant  -> "permission denied for table x". App is broken.
--   grant without policy  -> default deny. Safe, but sloppy and misleading.
--
-- Supabase can hand out grants for you, via the dashboard's "Automatically
-- expose new tables" setting. We deliberately turn that OFF and do it here
-- instead, for two reasons:
--
--   1. A dashboard toggle is not in version control. If this project is ever
--      recreated, or a second one is stood up for staging, the schema must
--      bring its own privileges rather than depending on someone remembering
--      to flip a switch.
--   2. The automatic version grants ALL verbs on every new table. We grant only
--      the verbs that actually have a policy — which means no table in this
--      schema carries a DELETE grant, because nothing in this product hard
--      deletes. That is a second lock on the door that migration 0004 already
--      closed by having no delete policies.
--
-- tests/rls/grants.test.ts asserts that the verbs granted here are exactly the
-- verbs that have policies, so a new table cannot be added without landing on
-- one side of that equality or the other.

-- ---------------------------------------------------------------------------
-- anon — the signed-out role. Gets nothing.
--
-- No policy in this schema is written `to anon`, so a grant here would be
-- unreachable anyway. Withholding it is defense in depth: if someone later
-- writes a policy `to public` by mistake, a signed-out visitor still cannot
-- reach the table, because the grant was never there.
--
-- usage on the schema stays, so PostgREST answers an unauthenticated request
-- with an empty result rather than a confusing schema-level error.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon;
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------------------
-- authenticated — a signed-in staff member. RLS narrows every one of these to
-- her own center; the grant only decides which verbs are reachable at all.
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;

-- Profile: reads self and colleagues, updates only self.
grant select, update         on app_user     to authenticated;

-- Org and center are administrative records. Created by us during onboarding,
-- never by the app, so neither carries an insert grant.
grant select, update         on organization to authenticated;
grant select, update         on center       to authenticated;

-- The roster tables. Insert is director-only, but that is the policy's job.
grant select, insert, update on classroom    to authenticated;
grant select, insert, update on child        to authenticated;
grant select, insert, update on enrollment   to authenticated;
grant select, insert, update on staff        to authenticated;

-- GELDS reference data is global and read-only. Only the importer writes it,
-- and it runs as the service role.
grant select                 on gelds_domain    to authenticated;
grant select                 on gelds_strand    to authenticated;
grant select                 on gelds_standard  to authenticated;
grant select                 on gelds_indicator to authenticated;

-- Append-only. No update grant and no delete grant, matching the deliberate
-- absence of those policies in 0005.
grant select, insert         on audit_log    to authenticated;
grant usage, select on sequence audit_log_id_seq to authenticated;

-- The view runs security_invoker, so it re-checks the underlying table's
-- policies as the calling user. It still needs its own grant to be selectable.
grant select on child_current_classroom to authenticated;

-- ---------------------------------------------------------------------------
-- The RLS helper functions.
--
-- Migration 0004 ends with five `revoke execute ... from anon` statements. They
-- do not do what they look like they do: Postgres grants EXECUTE on a new
-- function to PUBLIC, and anon is a member of PUBLIC, so revoking anon's own
-- grant leaves the inherited one untouched. anon could still call all five.
--
-- Nothing leaked, because every one of them resolves through auth.uid(), which
-- is null for a signed-out caller, so they return empty. But a revoke that
-- reads as a lock and isn't one is worse than no revoke at all — the next
-- person to touch this file would trust it.
--
-- Revoke from PUBLIC, then grant back to the two roles that need it.
-- ---------------------------------------------------------------------------

revoke execute on function auth_centers()                from public;
revoke execute on function auth_role(uuid)               from public;
revoke execute on function auth_is_director(uuid)        from public;
revoke execute on function auth_scoped_child_ids()       from public;
revoke execute on function auth_can_see_child(uuid, uuid) from public;

grant execute on function auth_centers()                to authenticated, service_role;
grant execute on function auth_role(uuid)               to authenticated, service_role;
grant execute on function auth_is_director(uuid)        to authenticated, service_role;
grant execute on function auth_scoped_child_ids()       to authenticated, service_role;
grant execute on function auth_can_see_child(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- service_role — the importer and the seed script, and nothing else.
--
-- It already carries bypassrls, so withholding table grants here would be
-- theatre rather than security. What actually keeps this role safe is that its
-- key never leaves the server: see lib/supabase/server.ts.
-- ---------------------------------------------------------------------------

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
