-- Make appointments.staff_id nullable so historical records are preserved
-- when a staff member is deleted, instead of requiring appointment deletion.
--
-- To apply: paste this in the Supabase Dashboard → SQL Editor and run it.
-- After applying, the deleteStaff action can be simplified to only cancel
-- future appointments; past ones will have staff_id set to NULL automatically.

alter table appointments
  alter column staff_id drop not null;

alter table appointments
  drop constraint if exists appointments_staff_id_fkey;

alter table appointments
  add constraint appointments_staff_id_fkey
  foreign key (staff_id) references staff(id) on delete set null;
