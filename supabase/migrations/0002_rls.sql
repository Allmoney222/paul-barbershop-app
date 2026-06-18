-- =====================================================================
-- 2Gether Hair Studio — Row Level Security
-- =====================================================================

alter table staff enable row level security;
alter table services enable row level security;
alter table staff_services enable row level security;
alter table availability enable row level security;
alter table blocked_times enable row level security;
alter table appointments enable row level security;
alter table settings enable row level security;

-- ---------------------------------------------------------------------
-- Helper functions (security definer to avoid recursive RLS lookups)
-- ---------------------------------------------------------------------

-- Returns the staff.id row linked to the currently authenticated user
create or replace function auth_staff_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from staff where auth_user_id = auth.uid();
$$;

-- Returns true if the current user is an active admin
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from staff
    where auth_user_id = auth.uid() and role = 'admin' and active = true
  );
$$;

-- ---------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------
drop policy if exists "staff_public_read_active" on staff;
create policy "staff_public_read_active" on staff
  for select using (active = true or is_admin() or auth_user_id = auth.uid());

drop policy if exists "staff_self_update" on staff;
create policy "staff_self_update" on staff
  for update using (auth_user_id = auth.uid() or is_admin());

drop policy if exists "staff_admin_write" on staff;
create policy "staff_admin_write" on staff
  for insert with check (is_admin());

drop policy if exists "staff_admin_delete" on staff;
create policy "staff_admin_delete" on staff
  for delete using (is_admin());

-- ---------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------
drop policy if exists "services_public_read_active" on services;
create policy "services_public_read_active" on services
  for select using (active = true or is_admin());

drop policy if exists "services_admin_write" on services;
create policy "services_admin_write" on services
  for insert with check (is_admin());

drop policy if exists "services_admin_update" on services;
create policy "services_admin_update" on services
  for update using (is_admin());

drop policy if exists "services_admin_delete" on services;
create policy "services_admin_delete" on services
  for delete using (is_admin());

-- ---------------------------------------------------------------------
-- staff_services
-- ---------------------------------------------------------------------
drop policy if exists "staff_services_public_read" on staff_services;
create policy "staff_services_public_read" on staff_services
  for select using (true);

drop policy if exists "staff_services_admin_write" on staff_services;
create policy "staff_services_admin_write" on staff_services
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- availability
-- ---------------------------------------------------------------------
drop policy if exists "availability_public_read" on availability;
create policy "availability_public_read" on availability
  for select using (true);

drop policy if exists "availability_staff_write_own" on availability;
create policy "availability_staff_write_own" on availability
  for all using (staff_id = auth_staff_id() or is_admin())
  with check (staff_id = auth_staff_id() or is_admin());

-- ---------------------------------------------------------------------
-- blocked_times
-- ---------------------------------------------------------------------
drop policy if exists "blocked_times_public_read" on blocked_times;
create policy "blocked_times_public_read" on blocked_times
  for select using (true);

drop policy if exists "blocked_times_staff_write_own" on blocked_times;
create policy "blocked_times_staff_write_own" on blocked_times
  for all using (staff_id = auth_staff_id() or staff_id is null and is_admin() or is_admin())
  with check (staff_id = auth_staff_id() or is_admin());

-- ---------------------------------------------------------------------
-- appointments
-- Public can INSERT new bookings, but cannot read appointment data
-- directly (slot availability + cancellation flow go through the
-- security-definer RPC functions defined in 0003_functions.sql).
-- ---------------------------------------------------------------------
drop policy if exists "appointments_public_insert" on appointments;
create policy "appointments_public_insert" on appointments
  for insert with check (
    status = 'booked'
    and stripe_payment_intent_id is null
    and internal_notes is null
  );

drop policy if exists "appointments_staff_read_own" on appointments;
create policy "appointments_staff_read_own" on appointments
  for select using (staff_id = auth_staff_id() or is_admin());

drop policy if exists "appointments_staff_update_own" on appointments;
create policy "appointments_staff_update_own" on appointments
  for update using (staff_id = auth_staff_id() or is_admin());

drop policy if exists "appointments_admin_delete" on appointments;
create policy "appointments_admin_delete" on appointments
  for delete using (is_admin());

-- ---------------------------------------------------------------------
-- settings
-- ---------------------------------------------------------------------
drop policy if exists "settings_public_read" on settings;
create policy "settings_public_read" on settings
  for select using (true);

drop policy if exists "settings_admin_write" on settings;
create policy "settings_admin_write" on settings
  for all using (is_admin()) with check (is_admin());
