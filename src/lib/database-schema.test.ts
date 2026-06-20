import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  join(process.cwd(), "supabase/migrations/202606200001_supabase_persistence.sql"),
  "utf8"
);

const userOwnedTables = ["move_plans", "checklist_items", "saved_listings", "explore_saved_items"];

describe("Supabase database schema", () => {
  it("creates all user-owned persistence tables with RLS enabled", () => {
    for (const table of userOwnedTables) {
      expect(migrationSql).toContain(`create table if not exists public.${table}`);
      expect(migrationSql).toContain("user_id uuid not null references auth.users(id)");
      expect(migrationSql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("defines own-row select, insert, update, and delete policies for each table", () => {
    for (const table of userOwnedTables) {
      expect(migrationSql).toContain(`on public.${table} for select`);
      expect(migrationSql).toContain(`on public.${table} for insert`);
      expect(migrationSql).toContain(`on public.${table} for update`);
      expect(migrationSql).toContain(`on public.${table} for delete`);
    }

    expect(migrationSql.match(/using \(auth\.uid\(\) = user_id\)/g)?.length).toBeGreaterThanOrEqual(8);
    expect(migrationSql.match(/with check \(auth\.uid\(\) = user_id\)/g)?.length).toBeGreaterThanOrEqual(8);
    expect(migrationSql).not.toContain("using (true)");
    expect(migrationSql).not.toContain("to anon");
  });

  it("grants table access to authenticated users for RLS-backed API requests", () => {
    expect(migrationSql).toContain("grant usage on schema public to authenticated");

    for (const table of userOwnedTables) {
      expect(migrationSql).toContain(`grant select, insert, update, delete on public.${table} to authenticated`);
    }
  });
});
