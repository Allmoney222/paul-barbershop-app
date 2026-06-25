-- Ensure the staff-photos bucket exists and is publicly readable.
insert into storage.buckets (id, name, public)
values ('staff-photos', 'staff-photos', true)
on conflict (id) do update set public = true;

-- Drop old policies before recreating (idempotent).
drop policy if exists "Public can view staff-photos"   on storage.objects;
drop policy if exists "Admins can upload staff-photos" on storage.objects;
drop policy if exists "Admins can delete staff-photos" on storage.objects;
drop policy if exists "Admins can update staff-photos" on storage.objects;

-- Anyone can read/view uploaded photos (needed for public card backgrounds).
create policy "Public can view staff-photos"
  on storage.objects for select
  using (bucket_id = 'staff-photos');

-- Authenticated users (admin panel) can upload.
create policy "Admins can upload staff-photos"
  on storage.objects for insert
  with check (bucket_id = 'staff-photos' and auth.role() = 'authenticated');

-- Authenticated users can replace (update) an existing object.
create policy "Admins can update staff-photos"
  on storage.objects for update
  using (bucket_id = 'staff-photos' and auth.role() = 'authenticated');

-- Authenticated users can delete.
create policy "Admins can delete staff-photos"
  on storage.objects for delete
  using (bucket_id = 'staff-photos' and auth.role() = 'authenticated');
