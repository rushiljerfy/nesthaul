import { describe, expect, it } from "vitest";
import {
  loadPlanFromSupabase,
  migrateLocalPlanToSupabase,
  savePlanToSupabase,
  type QueryResult
} from "./supabase-persistence";
import type { SavedPlan } from "./types";

const userId = "user-123";

const savedPlan: SavedPlan = {
  activePage: "Dashboard",
  profile: {
    location: "Brooklyn, NY",
    apartmentType: "studio",
    moveInDate: "2026-08-01",
    totalBudget: 1500,
    preference: "mix",
    stylePreference: "warm minimal",
    ownedItems: ["mattress"]
  },
  checklist: [
    {
      id: "mattress",
      name: "Mattress",
      category: "Sleep",
      priority: "urgent",
      suggestedBudget: 300,
      status: "bought",
      sourceIds: ["real-simple-first-apartment"]
    },
    {
      id: "desk",
      name: "Desk or work table",
      category: "Work",
      priority: "soon",
      suggestedBudget: 125,
      status: "saved",
      sourceIds: ["real-simple-first-apartment"]
    }
  ],
  listings: [
    {
      id: "explore-desk",
      title: "Compact desk",
      price: 95,
      source: "Explore",
      url: "https://example.com/desk",
      checklistItemId: "desk",
      category: "Work",
      condition: "new",
      logistics: "delivery available",
      notes: "Small footprint",
      savedFrom: "explore"
    }
  ]
};

describe("Supabase persistence", () => {
  it("saves the app plan across all persistence tables", async () => {
    const client = createFakeSupabaseClient();

    await savePlanToSupabase(client, userId, savedPlan);

    expect(client.tables.move_plans).toMatchObject([{ user_id: userId, active_page: "Dashboard", location: "Brooklyn, NY" }]);
    expect(client.tables.checklist_items).toHaveLength(2);
    expect(client.tables.saved_listings).toMatchObject([
      { id: "explore-desk", user_id: userId, checklist_item_id: "desk", saved_from: "explore" }
    ]);
    expect(client.tables.explore_saved_items).toMatchObject([{ id: "explore-desk", user_id: userId, checklist_item_id: "desk" }]);
  });

  it("loads a saved plan from Supabase rows", async () => {
    const client = createFakeSupabaseClient();

    await savePlanToSupabase(client, userId, savedPlan);

    expect(await loadPlanFromSupabase(client, userId)).toEqual(savedPlan);
  });

  it("persists removal by replacing stale saved listing rows", async () => {
    const client = createFakeSupabaseClient();

    await savePlanToSupabase(client, userId, savedPlan);
    await savePlanToSupabase(client, userId, { ...savedPlan, listings: [] });

    expect(client.tables.saved_listings).toEqual([]);
    expect(client.tables.explore_saved_items).toEqual([]);
  });

  it("migrates a local plan with idempotent overwrite behavior", async () => {
    const client = createFakeSupabaseClient();

    await migrateLocalPlanToSupabase(client, userId, savedPlan);
    await migrateLocalPlanToSupabase(client, userId, savedPlan);

    expect(client.tables.move_plans).toHaveLength(1);
    expect(client.tables.checklist_items).toHaveLength(2);
    expect(client.tables.saved_listings).toHaveLength(1);
    expect(await loadPlanFromSupabase(client, userId)).toEqual(savedPlan);
  });
});

function createFakeSupabaseClient() {
  const tables: Record<string, Record<string, unknown>[]> = {
    move_plans: [],
    checklist_items: [],
    saved_listings: [],
    explore_saved_items: []
  };

  return {
    tables,
    from(table: string) {
      return new FakeQuery(tables, table);
    }
  };
}

class FakeQuery {
  private operation: "select" | "upsert" | "insert" | "delete" | null = null;
  private selectedRows: Record<string, unknown>[] = [];
  private writeRows: Record<string, unknown>[] = [];
  private filters: Record<string, unknown> = {};

  constructor(
    private tables: Record<string, Record<string, unknown>[]>,
    private table: string
  ) {}

  select() {
    this.operation = "select";
    return this;
  }

  upsert(rows: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "upsert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    return this.execute();
  }

  insert(rows: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "insert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    return this.execute();
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;

    if (this.operation === "delete") {
      return this.execute();
    }

    return this;
  }

  maybeSingle() {
    const rows = this.getFilteredRows();

    return Promise.resolve({ data: rows[0] ?? null, error: null });
  }

  then<TResult1 = QueryResult<unknown>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<unknown>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private execute(): Promise<QueryResult<unknown>> {
    if (this.operation === "select") {
      return Promise.resolve({ data: this.getFilteredRows(), error: null });
    }

    if (this.operation === "delete") {
      this.tables[this.table] = this.tables[this.table].filter(
        (row) => !Object.entries(this.filters).every(([column, value]) => row[column] === value)
      );
      return Promise.resolve({ data: null, error: null });
    }

    if (this.operation === "insert") {
      this.tables[this.table].push(...this.writeRows);
      return Promise.resolve({ data: null, error: null });
    }

    if (this.operation === "upsert") {
      for (const row of this.writeRows) {
        const existingIndex = this.tables[this.table].findIndex((current) => isSameUniqueRow(current, row));

        if (existingIndex >= 0) {
          this.tables[this.table][existingIndex] = row;
        } else {
          this.tables[this.table].push(row);
        }
      }

      return Promise.resolve({ data: null, error: null });
    }

    return Promise.resolve({ data: null, error: null });
  }

  private getFilteredRows() {
    this.selectedRows = this.tables[this.table].filter((row) =>
      Object.entries(this.filters).every(([column, value]) => row[column] === value)
    );

    return this.selectedRows;
  }
}

function isSameUniqueRow(left: Record<string, unknown>, right: Record<string, unknown>) {
  if ("user_id" in left && "user_id" in right && "id" in left && "id" in right) {
    return left.user_id === right.user_id && left.id === right.id;
  }

  return "user_id" in left && "user_id" in right && left.user_id === right.user_id;
}
