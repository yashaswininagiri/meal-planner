-- Meal Planner database schema
-- Run this entire file in Supabase Dashboard > SQL Editor.
-- Authenticated data access is performed by the Express backend after verifying
-- the user's Supabase Auth token. The service-role key must stay on the server.

create extension if not exists pgcrypto;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  category text not null check (category in ('Breakfast','Lunch','Dinner','Snack','Dessert')),
  prep_minutes integer not null default 20 check (prep_minutes between 0 and 1440),
  ingredients text not null check (char_length(trim(ingredients)) between 1 and 5000),
  instructions text not null default '' check (char_length(instructions) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  meal_type text not null check (meal_type in ('Breakfast','Lunch','Dinner','Snack')),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, plan_date, meal_type)
);

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  quantity text not null default '' check (char_length(quantity) <= 80),
  is_checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists recipes_user_created_idx on public.recipes(user_id, created_at desc);
create index if not exists meal_plans_user_date_idx on public.meal_plans(user_id, plan_date);
create index if not exists grocery_items_user_created_idx on public.grocery_items(user_id, created_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at before update on public.recipes
for each row execute function public.set_updated_at();

-- RLS is enabled as a defense-in-depth measure. The backend uses the service-role
-- key only after checking the authenticated user's identity and ownership.
-- Do not create public/anon policies for these tables.
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.grocery_items enable row level security;

-- There are intentionally no anon/authenticated table policies: direct browser
-- access is blocked. All CRUD requests must go through the protected Express API.
