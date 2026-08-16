-- 0005_audit_log.sql
-- Ticket T-0.10 — append-only audit log.
--
-- Write an audit row on: any read of a child health record, any change to
-- health data, any document download, any delete, any unlock, any permission
-- change.
--
-- APPEND-ONLY means exactly that: no UPDATE policy and no DELETE policy exist
-- for this table at all, so no role short of the service role can rewrite
-- history.

create table audit_log (
  id           bigserial primary key,
  center_id    uuid not null references center (id) on delete restrict,
  actor_id     uuid references app_user (id),
  action       text not null check (
    action in ('view', 'create', 'update', 'delete', 'unlock', 'download', 'permission_change')
  ),
  entity_type  text not null,
  entity_id    uuid,
  detail       jsonb,
  occurred_at  timestamptz not null default now()
);

create index audit_log_center_idx on audit_log (center_id, occurred_at desc);
create index audit_log_entity_idx on audit_log (entity_type, entity_id);

alter table audit_log enable row level security;
alter table audit_log force  row level security;

-- Anyone at the center may append, and only as themselves.
create policy audit_log_insert on audit_log for insert to authenticated
  with check (center_id in (select auth_centers()) and actor_id = auth.uid());

-- Only director+ may read the log.
create policy audit_log_read on audit_log for select to authenticated
  using (center_id in (select auth_centers()) and auth_is_director(center_id));

-- Deliberately absent: audit_log_update, audit_log_delete.
