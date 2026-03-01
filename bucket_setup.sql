-- Copy and paste this into the Supabase SQL Editor and hit RUN

-- 1. Create a public storage bucket called 'backgrounds'
insert into storage.buckets (id, name, public) 
values ('backgrounds', 'backgrounds', true)
on conflict (id) do nothing;

-- 2. Allow any user to upload files to the 'backgrounds' bucket
create policy "Anyone can upload backgrounds"
  on storage.objects for insert
  with check ( bucket_id = 'backgrounds' );

-- 3. Allow any user to view files in the 'backgrounds' bucket
create policy "Anyone can view backgrounds"
  on storage.objects for select
  using ( bucket_id = 'backgrounds' );

-- 4. Allow users to update their own files (in case they write over an old file)
create policy "Anyone can update backgrounds"
  on storage.objects for update
  using ( bucket_id = 'backgrounds' );
