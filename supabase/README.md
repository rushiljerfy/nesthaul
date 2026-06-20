# Supabase setup

Run `supabase/migrations/202606200001_supabase_persistence.sql` in the Supabase SQL editor for the project configured by `.env.local`.

The SQL creates these user-owned tables:

- `move_plans`
- `checklist_items`
- `saved_listings`
- `explore_saved_items`

Each table has `id`, `user_id`, `created_at`, and `updated_at` columns. Row Level Security is enabled on every table.

Policies are scoped to authenticated users only:

- select own rows
- insert own rows
- update own rows
- delete own rows

Every policy checks `auth.uid() = user_id`, with `WITH CHECK (auth.uid() = user_id)` on insert and update.
