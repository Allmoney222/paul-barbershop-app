-- Add photo_url column to services table
alter table services add column if not exists photo_url text;
