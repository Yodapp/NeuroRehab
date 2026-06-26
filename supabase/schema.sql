-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  protocol_type text not null default 'none',
  protocol_start_date date,
  enabled_supplements text[] default array['lions_mane', 'morning_meds'],
  onboarding_completed boolean default false
);

-- activities (master list)
create table activities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  categories text[] not null,        -- e.g. ['fine_motor_focus', 'logic_problem_solving']
  description text,
  external_url text,
  is_default boolean default false
);

-- user_activities (per-user on/off toggles)
create table user_activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  activity_id uuid references activities(id) on delete cascade,
  is_enabled boolean default true,
  unique(user_id, activity_id)
);

-- daily_logs
create table daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  took_psilocybin boolean default false,
  took_niacin boolean default false,
  took_lions_mane boolean default false,
  took_morning_meds boolean default false,
  energy_rating integer check (energy_rating between 1 and 5),
  focus_rating integer check (focus_rating between 1 and 5),
  symptom_rating integer check (symptom_rating between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- activity_logs (one row per activity per day)
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  daily_log_id uuid references daily_logs(id) on delete cascade,
  activity_id uuid references activities(id) on delete cascade,
  completed boolean default false,
  unique(daily_log_id, activity_id)
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, protocol_type, enabled_supplements)
  values (
    new.id,
    'none',
    array['lions_mane', 'morning_meds']
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security (RLS) — required for multi-user safety
alter table profiles enable row level security;
alter table user_activities enable row level security;
alter table daily_logs enable row level security;
alter table activity_logs enable row level security;

create policy "Users can only access their own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users can only access their own activity settings"
  on user_activities for all using (auth.uid() = user_id);

create policy "Users can only access their own daily logs"
  on daily_logs for all using (auth.uid() = user_id);

create policy "Users can only access their own activity logs"
  on activity_logs for all
  using (daily_log_id in (select id from daily_logs where user_id = auth.uid()));

-- Seed: default activities
insert into activities (name, categories, description, external_url, is_default) values
  ('BrainHQ',             array['attention_memory'],                           'Tränar kognitiv flexibilitet',      'https://www.brainhq.com', true),
  ('Lumosity',            array['attention_memory'],                           'Tränar kognitiv yelhet',            'https://www.lumosity.com', true),
  ('Dual N-Back',         array['attention_memory'],                           'Tränar arbetsminne',                'https://brainscale.net', true),
  ('Sudoku',              array['logic_problem_solving'],                      'Tränar logiskt tänkande',           null, true),
  ('Crossword Puzzles',   array['logic_problem_solving'],                      'Tränar ordförråd och minne',        null, true),
  ('Brain Teaser Mag.',   array['logic_problem_solving'],                      'Tränar problemlösning',             null, false),
  ('Lego Building',       array['fine_motor_focus', 'logic_problem_solving'],  'Tränar finmotorik och koncentration', null, true),
  ('Jigsaw Puzzles',      array['fine_motor_focus', 'attention_memory'],       'Tränar spatial förmåga',            null, true),
  ('Casual Video Games',  array['fine_motor_focus', 'attention_memory'],       'Tränar reaktion och koordination',  null, true),
  ('Programmering',       array['logic_problem_solving', 'attention_memory'],  'Tränar problemlösning och fokus',   null, true),
  ('Promenad',            array['physical'],                                   'Stödjer neuroplasticitet',          null, true);
