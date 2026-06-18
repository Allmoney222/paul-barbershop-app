-- =====================================================================
-- 2Gether Hair Studio — RPC functions
-- =====================================================================

-- ---------------------------------------------------------------------
-- get_busy_intervals: returns booked time ranges for a staff member
-- within a window, without exposing client details. Used by the public
-- booking flow to compute open slots.
-- ---------------------------------------------------------------------
create or replace function get_busy_intervals(
  p_staff_id uuid,
  p_range_start timestamptz,
  p_range_end timestamptz
)
returns table (start_time timestamptz, end_time timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select a.start_time, a.end_time
  from appointments a
  where a.staff_id = p_staff_id
    and a.status <> 'cancelled'
    and a.start_time < p_range_end
    and a.end_time > p_range_start
  order by a.start_time;
$$;

grant execute on function get_busy_intervals(uuid, timestamptz, timestamptz) to anon, authenticated;

-- ---------------------------------------------------------------------
-- create_appointment: atomically validates availability and inserts a
-- new appointment, preventing double-booking under concurrent requests.
-- ---------------------------------------------------------------------
create or replace function create_appointment(
  p_staff_id uuid,
  p_service_id uuid,
  p_start_time timestamptz,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_client_notes text default null
)
returns appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration int;
  v_buffer int := 0;
  v_end_time timestamptz;
  v_conflicts int;
  v_appointment appointments;
begin
  select duration_minutes into v_duration
  from services
  where id = p_service_id and active = true;

  if v_duration is null then
    raise exception 'INVALID_SERVICE';
  end if;

  select coalesce((value->>'buffer_minutes')::int, 0) into v_buffer
  from settings where key = 'booking';
  v_buffer := coalesce(v_buffer, 0);

  v_end_time := p_start_time + (v_duration || ' minutes')::interval;

  -- Lock the staff row to serialize concurrent booking attempts for
  -- the same staff member.
  perform 1 from staff where id = p_staff_id for update;

  select count(*) into v_conflicts
  from appointments
  where staff_id = p_staff_id
    and status <> 'cancelled'
    and tstzrange(start_time - (v_buffer || ' minutes')::interval, end_time + (v_buffer || ' minutes')::interval, '[)')
        && tstzrange(p_start_time, v_end_time, '[)');

  if v_conflicts > 0 then
    raise exception 'SLOT_TAKEN';
  end if;

  insert into appointments (
    staff_id, service_id, client_name, client_email, client_phone,
    start_time, end_time, client_notes
  ) values (
    p_staff_id, p_service_id, p_client_name, p_client_email, p_client_phone,
    p_start_time, v_end_time, p_client_notes
  )
  returning * into v_appointment;

  return v_appointment;
end;
$$;

grant execute on function create_appointment(uuid, uuid, timestamptz, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- get_appointment_by_cancel_token: lookup for the confirmation /
-- cancellation page using the unguessable cancel_token.
-- ---------------------------------------------------------------------
create or replace function get_appointment_by_cancel_token(p_token uuid)
returns table (
  id uuid,
  staff_name text,
  service_name text,
  start_time timestamptz,
  end_time timestamptz,
  status appointment_status,
  client_name text,
  price_cents int,
  deposit_paid boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select a.id, s.name, sv.name, a.start_time, a.end_time, a.status, a.client_name, sv.price_cents, a.deposit_paid
  from appointments a
  join staff s on s.id = a.staff_id
  join services sv on sv.id = a.service_id
  where a.cancel_token = p_token;
$$;

grant execute on function get_appointment_by_cancel_token(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- cancel_appointment_by_token: cancels a booking up to 24h before start
-- ---------------------------------------------------------------------
create or replace function cancel_appointment_by_token(p_token uuid)
returns appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appt appointments;
begin
  select * into v_appt from appointments where cancel_token = p_token;

  if v_appt.id is null then
    raise exception 'NOT_FOUND';
  end if;

  if v_appt.status = 'cancelled' then
    raise exception 'ALREADY_CANCELLED';
  end if;

  if v_appt.start_time < now() + interval '24 hours' then
    raise exception 'TOO_LATE';
  end if;

  update appointments set status = 'cancelled'
  where id = v_appt.id
  returning * into v_appt;

  return v_appt;
end;
$$;

grant execute on function cancel_appointment_by_token(uuid) to anon, authenticated;
