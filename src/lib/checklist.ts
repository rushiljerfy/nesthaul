import type { ChecklistCategory, ChecklistItem } from "./types";

export const requiredCategories: ChecklistCategory[] = [
  "Sleep",
  "Work",
  "Kitchen",
  "Bathroom",
  "Cleaning",
  "Storage",
  "Living"
];

const template: Omit<ChecklistItem, "status">[] = [
  {
    id: "mattress",
    name: "Mattress",
    category: "Sleep",
    priority: "urgent",
    suggestedBudget: 300,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "bed-frame",
    name: "Bed frame",
    category: "Sleep",
    priority: "soon",
    suggestedBudget: 160,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "sheets",
    name: "Sheets and pillowcases",
    category: "Sleep",
    priority: "urgent",
    suggestedBudget: 60,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "desk",
    name: "Desk or work table",
    category: "Work",
    priority: "soon",
    suggestedBudget: 125,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "work-chair",
    name: "Work chair",
    category: "Work",
    priority: "soon",
    suggestedBudget: 120,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "task-light",
    name: "Task lamp",
    category: "Work",
    priority: "nice-to-have",
    suggestedBudget: 35,
    sourceIds: ["architectural-digest-first-apartment"]
  },
  {
    id: "cookware-basics",
    name: "Skillet and pot",
    category: "Kitchen",
    priority: "urgent",
    suggestedBudget: 90,
    sourceIds: ["bon-appetit-kitchen-starter"]
  },
  {
    id: "knife-board",
    name: "Chef knife and cutting board",
    category: "Kitchen",
    priority: "urgent",
    suggestedBudget: 55,
    sourceIds: ["bon-appetit-kitchen-starter"]
  },
  {
    id: "dishes",
    name: "Dishes, glasses, and flatware",
    category: "Kitchen",
    priority: "urgent",
    suggestedBudget: 80,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "sheet-pan-colander",
    name: "Sheet pan and colander",
    category: "Kitchen",
    priority: "soon",
    suggestedBudget: 45,
    sourceIds: ["bon-appetit-kitchen-starter"]
  },
  {
    id: "bath-towels",
    name: "Bath towels",
    category: "Bathroom",
    priority: "urgent",
    suggestedBudget: 50,
    sourceIds: ["real-simple-first-apartment", "architectural-digest-first-apartment"]
  },
  {
    id: "shower-basics",
    name: "Shower curtain and bath mat",
    category: "Bathroom",
    priority: "urgent",
    suggestedBudget: 45,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "bath-storage",
    name: "Bathroom storage",
    category: "Bathroom",
    priority: "soon",
    suggestedBudget: 45,
    sourceIds: ["architectural-digest-first-apartment"]
  },
  {
    id: "cleaning-kit",
    name: "Basic cleaning kit",
    category: "Cleaning",
    priority: "urgent",
    suggestedBudget: 45,
    sourceIds: ["spruce-first-place-mistakes"]
  },
  {
    id: "vacuum",
    name: "Vacuum or broom",
    category: "Cleaning",
    priority: "soon",
    suggestedBudget: 85,
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "laundry",
    name: "Laundry hamper and detergent",
    category: "Cleaning",
    priority: "soon",
    suggestedBudget: 40,
    sourceIds: ["architectural-digest-first-apartment"]
  },
  {
    id: "closet-storage",
    name: "Closet or garment storage",
    category: "Storage",
    priority: "soon",
    suggestedBudget: 90,
    sourceIds: ["architectural-digest-first-apartment"]
  },
  {
    id: "kitchen-storage",
    name: "Kitchen organizers",
    category: "Storage",
    priority: "nice-to-have",
    suggestedBudget: 50,
    sourceIds: ["bon-appetit-kitchen-starter"]
  },
  {
    id: "tool-kit",
    name: "Small tool kit",
    category: "Storage",
    priority: "soon",
    suggestedBudget: 35,
    sourceIds: ["architectural-digest-first-apartment"]
  },
  {
    id: "sofa",
    name: "Small sofa or loveseat",
    category: "Living",
    priority: "nice-to-have",
    suggestedBudget: 250,
    sourceIds: ["real-simple-first-apartment", "architectural-digest-first-apartment"]
  },
  {
    id: "living-table",
    name: "Coffee table or side table",
    category: "Living",
    priority: "nice-to-have",
    suggestedBudget: 70,
    sourceIds: ["real-simple-first-apartment", "spruce-first-place-mistakes"]
  },
  {
    id: "floor-lamp",
    name: "Floor lamp",
    category: "Living",
    priority: "soon",
    suggestedBudget: 60,
    sourceIds: ["architectural-digest-first-apartment"]
  }
];

export function createMoveInChecklist(ownedItems: string[] = []): ChecklistItem[] {
  const normalizedOwnedItems = ownedItems.map(normalize);

  return template.map((item) => ({
    ...item,
    status: normalizedOwnedItems.some(
      (ownedItem) => normalize(item.name).includes(ownedItem) || ownedItem.includes(normalize(item.name))
    )
      ? "bought"
      : "missing"
  }));
}

export function findChecklistItem(checklist: ChecklistItem[], id: string) {
  return checklist.find((item) => item.id === id);
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
