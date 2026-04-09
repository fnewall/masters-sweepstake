-- Run this in your Supabase SQL editor to set up the database

-- Participants table
create table if not exists participants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Picks table
create table if not exists picks (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references participants(id) on delete cascade,
  golfer_name text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table participants enable row level security;
alter table picks enable row level security;

-- Allow public read access (for leaderboard)
create policy "Public read participants" on participants
  for select using (true);

create policy "Public read picks" on picks
  for select using (true);

-- Allow all writes (admin uses anon key — secure via password in app)
create policy "Allow insert participants" on participants
  for insert with check (true);

create policy "Allow update participants" on participants
  for update using (true);

create policy "Allow delete participants" on participants
  for delete using (true);

create policy "Allow insert picks" on picks
  for insert with check (true);

create policy "Allow delete picks" on picks
  for delete using (true);
