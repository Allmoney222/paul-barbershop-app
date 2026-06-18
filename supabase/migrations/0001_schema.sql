-- =====================================================================
-- 2Gether Hair Studio — Core schema
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
do $$ begin
  create type staff_role as enum ('admin', 'stylist', 'barber');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type appointment_status as enum ('booked', 'confirmed', 'completed', 'no-show', 'cancelled');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------
-- TABLE: staff
-- ---------------------------------------------------------------------
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  phone text,
  photo_url text,
  bio text,
  specialties text[] not null default '{}',
  role staff_role not null default 'stylist',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table staff is 'Stylists, barbers, and admins working at the studio.';

-- ---------------------------------------------------------------------
-- TABLE: services
-- ---------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Hair',
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TABLE: staff_services (many-to-many)
-- ---------------------------------------------------------------------
create table if not exists staff_services (
  staff_id uuid not null references staff(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- ---------------------------------------------------------------------
-- TABLE: availability (recurring weekly hours per staff member)
-- ---------------------------------------------------------------------
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint availability_time_check check (end_time > start_time)
);

create index if not exists availability_staff_day_idx on availability (staff_id, day_of_week);

-- ---------------------------------------------------------------------
-- TABLE: blocked_times (one-off blocks: vacation, holidays, etc.)
-- ---------------------------------------------------------------------
create table if not exists blocked_times (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade, -- null = whole shop
  date date not null,
  start_time time, -- null + null end_time = entire day blocked
  end_time time,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists blocked_times_staff_date_idx on blocked_times (staff_id, date);

-- ---------------------------------------------------------------------
-- TABLE: appointments
-- ---------------------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id),
  service_id uuid not null references services(id),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status appointment_status not null default 'booked',
  stripe_payment_intent_id text,
  deposit_paid boolean not null default false,
  client_notes text,
  internal_notes text,
  cancel_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_time_check check (end_time > start_time)
);

create index if not exists appointments_staff_time_idx on appointments (staff_id, start_time);
create index if not exists appointments_cancel_token_idx on appointments (cancel_token);
create index if not exists appointments_client_email_idx on appointments (client_email);

-- ---------------------------------------------------------------------
-- TABLE: settings (key/value store)
-- ---------------------------------------------------------------------
create table if not exists settings (
  key text primary key,
  value jsonb not null
);

-- ---------------------------------------------------------------------
-- updated_at trigger for appointments
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();
