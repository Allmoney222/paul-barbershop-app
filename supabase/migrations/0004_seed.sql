-- =====================================================================
-- 2Gether Hair Studio — Seed data
-- Safe to re-run: uses fixed UUIDs + upserts.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------
insert into staff (id, name, email, phone, bio, specialties, role, active, sort_order, photo_url)
values
  ('11111111-1111-1111-1111-111111111111', 'Jordan', 'jordan@2getherhairstudio.com', '716-555-0101',
   'Master barber with 12+ years behind the chair. Known for precision fades and classic cuts with a modern edge.',
   array['Fades', 'Classic Cuts', 'Beard Sculpting'], 'admin', true, 1,
   'https://images.unsplash.com/photo-1622296089780-290d715192af?w=400&h=400&fit=crop&crop=faces'),
  ('22222222-2222-2222-2222-222222222222', 'Mia', 'mia@2getherhairstudio.com', '716-555-0102',
   'Color and curl specialist who loves transforming looks with vibrant, healthy color and defined curl patterns.',
   array['Color', 'Curly Hair', 'Balayage'], 'stylist', true, 2,
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces'),
  ('33333333-3333-3333-3333-333333333333', 'Alex', 'alex@2getherhairstudio.com', '716-555-0103',
   'Stylist specializing in braids and protective styles, plus all-around cuts for every member of the family.',
   array['Braids', 'Protective Styles', 'Kids Cuts'], 'stylist', true, 3,
   'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  bio = excluded.bio,
  specialties = excluded.specialties,
  role = excluded.role,
  active = excluded.active,
  sort_order = excluded.sort_order,
  photo_url = excluded.photo_url;

-- ---------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------
insert into services (id, name, category, description, duration_minutes, price_cents, active, sort_order)
values
  ('a1000000-0000-0000-0000-000000000001', 'Men''s Cut', 'Hair', 'Classic precision haircut tailored to your style.', 45, 3000, true, 1),
  ('a1000000-0000-0000-0000-000000000002', 'Fade & Design', 'Hair', 'Sharp fade with optional custom line design.', 60, 4000, true, 2),
  ('a1000000-0000-0000-0000-000000000003', 'Beard Trim', 'Beard', 'Shape-up and line work to keep your beard sharp.', 20, 1500, true, 3),
  ('a1000000-0000-0000-0000-000000000004', 'Full Cut + Beard', 'Hair', 'Complete haircut and beard trim combo.', 75, 5000, true, 4),
  ('a1000000-0000-0000-0000-000000000005', 'Women''s Cut & Style', 'Hair', 'Cut, blowout, and style tailored to you.', 60, 5500, true, 5),
  ('a1000000-0000-0000-0000-000000000006', 'Color Treatment', 'Color', 'Full color service including consultation.', 90, 8000, true, 6),
  ('a1000000-0000-0000-0000-000000000007', 'Braids (simple)', 'Braids', 'Simple braid styling, great for protective styles.', 90, 6500, true, 7),
  ('a1000000-0000-0000-0000-000000000008', 'Kids Cut (under 12)', 'Kids', 'Haircut for clients under 12 years old.', 30, 2000, true, 8)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price_cents = excluded.price_cents,
  active = excluded.active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------
-- Staff <-> Services
-- ---------------------------------------------------------------------
insert into staff_services (staff_id, service_id) values
  -- Jordan (Master Barber)
  ('11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000003'),
  ('11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000004'),
  ('11111111-1111-1111-1111-111111111111', 'a1000000-0000-0000-0000-000000000008'),
  -- Mia (Color & Curl Specialist)
  ('22222222-2222-2222-2222-222222222222', 'a1000000-0000-0000-0000-000000000005'),
  ('22222222-2222-2222-2222-222222222222', 'a1000000-0000-0000-0000-000000000006'),
  ('22222222-2222-2222-2222-222222222222', 'a1000000-0000-0000-0000-000000000008'),
  -- Alex (Stylist & Braids)
  ('33333333-3333-3333-3333-333333333333', 'a1000000-0000-0000-0000-000000000001'),
  ('33333333-3333-3333-3333-333333333333', 'a1000000-0000-0000-0000-000000000002'),
  ('33333333-3333-3333-3333-333333333333', 'a1000000-0000-0000-0000-000000000005'),
  ('33333333-3333-3333-3333-333333333333', 'a1000000-0000-0000-0000-000000000007'),
  ('33333333-3333-3333-3333-333333333333', 'a1000000-0000-0000-0000-000000000008')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Availability — Mon-Sat 9:00 AM - 7:00 PM, closed Sunday (day 0)
-- ---------------------------------------------------------------------
insert into availability (staff_id, day_of_week, start_time, end_time)
select s.id, d.dow, '09:00', '19:00'
from staff s
cross join (select generate_series(1, 6) as dow) d
where s.id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------
insert into settings (key, value) values
  ('shop_info', jsonb_build_object(
    'name', '2Gether Hair Studio',
    'tagline', 'Where beauty, style, and community come together.',
    'address', '123 Elmwood Ave, Buffalo, NY 14201',
    'phone', '716-555-0100',
    'email', 'hello@2getherhairstudio.com',
    'timezone', 'America/New_York',
    'hours', jsonb_build_object(
      'mon', '9:00 AM - 7:00 PM',
      'tue', '9:00 AM - 7:00 PM',
      'wed', '9:00 AM - 7:00 PM',
      'thu', '9:00 AM - 7:00 PM',
      'fri', '9:00 AM - 7:00 PM',
      'sat', '9:00 AM - 7:00 PM',
      'sun', 'Closed'
    )
  )),
  ('booking', jsonb_build_object(
    'deposit_enabled', true,
    'deposit_amount_cents', 1500,
    'buffer_minutes', 0,
    'slot_increment_minutes', 15
  ))
on conflict (key) do update set value = excluded.value;
