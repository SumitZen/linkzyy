-- Paste this into your Supabase Dashboard via the SQL Editor tab on the left margin, then click "RUN".

-- 1. Create the `profiles` table to store Linkzy user data
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  name text,
  bio text,
  avatar_url text,
  banner_url text,
  bg_color text,
  bg_image text,
  theme text default 'editorial-light',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the `links` table
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  icon text,
  is_active boolean default true,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Turn ON Row Level Security (RLS) so users can only edit their own data
alter table public.profiles enable row level security;
alter table public.links enable row level security;

-- 4. Create Policies for `profiles`
-- Anyone can view public profiles
create policy "Public profiles are viewable by everyone." 
  on profiles for select 
  using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile." 
  on profiles for insert 
  with check ( auth.uid() = id );

-- Users can update their own profile
create policy "Users can update own profile." 
  on profiles for update 
  using ( auth.uid() = id );

-- 5. Create Policies for `links`
-- Anyone can view links
create policy "Links are viewable by everyone." 
  on links for select 
  using ( true );

-- Users can insert their own links
create policy "Users can insert own links." 
  on links for insert 
  with check ( auth.uid() = user_id );

-- Users can update their own links
create policy "Users can update own links." 
  on links for update 
  using ( auth.uid() = user_id );

-- Users can delete their own links
create policy "Users can delete own links." 
  on links for delete 
  using ( auth.uid() = user_id );

-- 6. Important: Allow new user signups to automatically create a profile row
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'user_name' /* Fallback to google name if OAuth */,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it already exists to prevent errors during re-runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
