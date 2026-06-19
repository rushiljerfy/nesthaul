import { describe, expect, it } from "vitest";
import { createMoveInChecklist, requiredCategories } from "./checklist";

describe("createMoveInChecklist", () => {
  it("creates researched starter essentials across every MVP category", () => {
    const checklist = createMoveInChecklist(["mattress"]);

    expect(new Set(checklist.map((item) => item.category))).toEqual(new Set(requiredCategories));
    expect(checklist.length).toBeGreaterThanOrEqual(18);
    expect(checklist.every((item) => item.sourceIds.length > 0)).toBe(true);
  });

  it("marks owned items as bought and leaves the rest missing", () => {
    const checklist = createMoveInChecklist(["mattress", "bath towels"]);

    expect(checklist.find((item) => item.name === "Mattress")?.status).toBe("bought");
    expect(checklist.find((item) => item.name === "Bath towels")?.status).toBe("bought");
    expect(checklist.find((item) => item.name === "Desk or work table")?.status).toBe("missing");
  });
});
