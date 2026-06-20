-- NestHaul user-owned persistence schema.
-- Run this in the Supabase SQL editor for the project that backs .env.local.

create table if not exists public.move_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  active_page text not null default 'Explore',
  location text not null default '',
  apartment_type text not null default 'studio',
  move_in_date text not null default '',
  total_budget numeric not null default 0,
  preference text not null default 'mix',
  style_preference text not null default '',
  owned_items text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint move_plans_user_id_key unique (user_id)
);

create table if not exists public.checklist_items (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  priority text not null,
  suggested_budget numeric not null default 0,
  status text not null,
  source_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.saved_listings (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric not null default 0,
  source text not null,
  url text not null,
  checklist_item_id text not null,
  category text not null,
  condition text not null,
  logistics text not null,
  distance numeric,
  notes text,
  saved_from text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.explore_saved_items (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_item_id text not null,
  category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists move_plans_set_updated_at on public.move_plans;
create trigger move_plans_set_updated_at
before update on public.move_plans
for each row execute function public.set_updated_at();

drop trigger if exists checklist_items_set_updated_at on public.checklist_items;
create trigger checklist_items_set_updated_at
before update on public.checklist_items
for each row execute function public.set_updated_at();

drop trigger if exists saved_listings_set_updated_at on public.saved_listings;
create trigger saved_listings_set_updated_at
before update on public.saved_listings
for each row execute function public.set_updated_at();

drop trigger if exists explore_saved_items_set_updated_at on public.explore_saved_items;
create trigger explore_saved_items_set_updated_at
before update on public.explore_saved_items
for each row execute function public.set_updated_at();

alter table public.move_plans enable row level security;
alter table public.checklist_items enable row level security;
alter table public.saved_listings enable row level security;
alter table public.explore_saved_items enable row level security;

drop policy if exists "move_plans_select_own" on public.move_plans;
create policy "move_plans_select_own"
on public.move_plans for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "move_plans_insert_own" on public.move_plans;
create policy "move_plans_insert_own"
on public.move_plans for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "move_plans_update_own" on public.move_plans;
create policy "move_plans_update_own"
on public.move_plans for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "move_plans_delete_own" on public.move_plans;
create policy "move_plans_delete_own"
on public.move_plans for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "checklist_items_select_own" on public.checklist_items;
create policy "checklist_items_select_own"
on public.checklist_items for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "checklist_items_insert_own" on public.checklist_items;
create policy "checklist_items_insert_own"
on public.checklist_items for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "checklist_items_update_own" on public.checklist_items;
create policy "checklist_items_update_own"
on public.checklist_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "checklist_items_delete_own" on public.checklist_items;
create policy "checklist_items_delete_own"
on public.checklist_items for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "saved_listings_select_own" on public.saved_listings;
create policy "saved_listings_select_own"
on public.saved_listings for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "saved_listings_insert_own" on public.saved_listings;
create policy "saved_listings_insert_own"
on public.saved_listings for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "saved_listings_update_own" on public.saved_listings;
create policy "saved_listings_update_own"
on public.saved_listings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "saved_listings_delete_own" on public.saved_listings;
create policy "saved_listings_delete_own"
on public.saved_listings for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "explore_saved_items_select_own" on public.explore_saved_items;
create policy "explore_saved_items_select_own"
on public.explore_saved_items for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "explore_saved_items_insert_own" on public.explore_saved_items;
create policy "explore_saved_items_insert_own"
on public.explore_saved_items for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "explore_saved_items_update_own" on public.explore_saved_items;
create policy "explore_saved_items_update_own"
on public.explore_saved_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "explore_saved_items_delete_own" on public.explore_saved_items;
create policy "explore_saved_items_delete_own"
on public.explore_saved_items for delete
to authenticated
using (auth.uid() = user_id);
