import type { ChecklistCategory, ExploreItem, Listing } from "./types";

type ExploreSeed = {
  id: string;
  title: string;
  price: number;
  checklistItemId: string;
  category: ChecklistCategory;
  condition?: Listing["condition"];
  logistics?: string;
};

const source = "NestHaul starter picks";

const seeds: ExploreSeed[] = [
  { id: "sleep-mattress-foam", title: "Budget foam mattress", price: 275, checklistItemId: "mattress", category: "Sleep", condition: "new" },
  { id: "sleep-mattress-hybrid", title: "Used hybrid mattress", price: 220, checklistItemId: "mattress", category: "Sleep", condition: "used" },
  { id: "sleep-bed-frame-platform", title: "Platform bed frame", price: 145, checklistItemId: "bed-frame", category: "Sleep", condition: "new" },
  { id: "sleep-bed-frame-metal", title: "Metal bed frame", price: 95, checklistItemId: "bed-frame", category: "Sleep", condition: "used" },
  { id: "sleep-sheets-cotton", title: "Two-set cotton sheet bundle", price: 55, checklistItemId: "sheets", category: "Sleep", condition: "new" },
  { id: "sleep-sheets-percale", title: "Percale sheet set", price: 48, checklistItemId: "sheets", category: "Sleep", condition: "new" },
  { id: "sleep-pillows", title: "Two-pack bed pillows", price: 36, checklistItemId: "sheets", category: "Sleep", condition: "new" },

  { id: "work-desk-compact", title: "Compact writing desk", price: 110, checklistItemId: "desk", category: "Work", condition: "used" },
  { id: "work-desk-folding", title: "Folding work table", price: 68, checklistItemId: "desk", category: "Work", condition: "new" },
  { id: "work-desk-wall", title: "Wall-mounted desk", price: 118, checklistItemId: "desk", category: "Work", condition: "new" },
  { id: "work-chair-task", title: "Adjustable task chair", price: 95, checklistItemId: "work-chair", category: "Work", condition: "used" },
  { id: "work-chair-ergonomic", title: "Used ergonomic chair", price: 120, checklistItemId: "work-chair", category: "Work", condition: "used" },
  { id: "work-lamp-clamp", title: "Clamp task lamp", price: 28, checklistItemId: "task-light", category: "Work", condition: "new" },
  { id: "work-lamp-led", title: "LED desk lamp", price: 34, checklistItemId: "task-light", category: "Work", condition: "new" },

  { id: "kitchen-cookware-set", title: "Starter skillet and saucepan set", price: 75, checklistItemId: "cookware-basics", category: "Kitchen", condition: "new" },
  { id: "kitchen-cast-iron", title: "Used cast iron skillet", price: 35, checklistItemId: "cookware-basics", category: "Kitchen", condition: "used" },
  { id: "kitchen-pot", title: "Stainless stock pot", price: 42, checklistItemId: "cookware-basics", category: "Kitchen", condition: "new" },
  { id: "kitchen-dishes", title: "Four-place dinnerware set", price: 65, checklistItemId: "dishes", category: "Kitchen", condition: "new" },
  { id: "kitchen-flatware", title: "Flatware and glassware set", price: 45, checklistItemId: "dishes", category: "Kitchen", condition: "new" },
  { id: "kitchen-knife-board", title: "Chef knife and cutting board", price: 50, checklistItemId: "knife-board", category: "Kitchen", condition: "new" },
  { id: "kitchen-sheet-pan", title: "Sheet pan and colander pair", price: 38, checklistItemId: "sheet-pan-colander", category: "Kitchen", condition: "new" },

  { id: "bath-towel-set", title: "Six-piece towel set", price: 42, checklistItemId: "bath-towels", category: "Bathroom", condition: "new" },
  { id: "bath-quick-dry", title: "Quick-dry towel pair", price: 34, checklistItemId: "bath-towels", category: "Bathroom", condition: "new" },
  { id: "bath-shower-kit", title: "Shower curtain, liner, and rings", price: 35, checklistItemId: "shower-basics", category: "Bathroom", condition: "new" },
  { id: "bath-mat", title: "Bath mat and liner set", price: 32, checklistItemId: "shower-basics", category: "Bathroom", condition: "new" },
  { id: "bath-over-toilet", title: "Over-toilet shelf", price: 44, checklistItemId: "bath-storage", category: "Bathroom", condition: "used" },
  { id: "bath-cart", title: "Slim bathroom cart", price: 38, checklistItemId: "bath-storage", category: "Bathroom", condition: "new" },
  { id: "bath-caddy", title: "Shower caddy", price: 22, checklistItemId: "bath-storage", category: "Bathroom", condition: "new" },

  { id: "cleaning-starter", title: "All-purpose cleaning starter kit", price: 38, checklistItemId: "cleaning-kit", category: "Cleaning", condition: "new" },
  { id: "cleaning-mop", title: "Mop and bucket set", price: 32, checklistItemId: "cleaning-kit", category: "Cleaning", condition: "new" },
  { id: "cleaning-trash", title: "Trash can and liners", price: 36, checklistItemId: "cleaning-kit", category: "Cleaning", condition: "new" },
  { id: "cleaning-vacuum-stick", title: "Lightweight stick vacuum", price: 80, checklistItemId: "vacuum", category: "Cleaning", condition: "used" },
  { id: "cleaning-broom", title: "Broom and dustpan", price: 24, checklistItemId: "vacuum", category: "Cleaning", condition: "new" },
  { id: "cleaning-laundry-kit", title: "Laundry basket and detergent", price: 37, checklistItemId: "laundry", category: "Cleaning", condition: "new" },
  { id: "cleaning-hamper", title: "Collapsible laundry hamper", price: 26, checklistItemId: "laundry", category: "Cleaning", condition: "new" },

  { id: "storage-garment-rack", title: "Freestanding garment rack", price: 72, checklistItemId: "closet-storage", category: "Storage", condition: "used" },
  { id: "storage-cube", title: "Cube storage shelf", price: 64, checklistItemId: "closet-storage", category: "Storage", condition: "used" },
  { id: "storage-underbed", title: "Under-bed storage bins", price: 44, checklistItemId: "closet-storage", category: "Storage", condition: "new" },
  { id: "storage-kitchen-rack", title: "Kitchen shelf risers", price: 28, checklistItemId: "kitchen-storage", category: "Storage", condition: "new" },
  { id: "storage-food-containers", title: "Food storage container set", price: 34, checklistItemId: "kitchen-storage", category: "Storage", condition: "new" },
  { id: "storage-toolkit", title: "Small apartment tool kit", price: 32, checklistItemId: "tool-kit", category: "Storage", condition: "new" },
  { id: "storage-hooks", title: "Entry hooks and anchors", price: 18, checklistItemId: "tool-kit", category: "Storage", condition: "new" },

  { id: "living-loveseat", title: "Used loveseat", price: 210, checklistItemId: "sofa", category: "Living", condition: "used" },
  { id: "living-futon", title: "Compact futon", price: 230, checklistItemId: "sofa", category: "Living", condition: "used" },
  { id: "living-floor-chair", title: "Foldable floor chair", price: 65, checklistItemId: "sofa", category: "Living", condition: "new" },
  { id: "living-side-table", title: "Small side table", price: 42, checklistItemId: "living-table", category: "Living", condition: "used" },
  { id: "living-coffee-table", title: "Nesting coffee tables", price: 68, checklistItemId: "living-table", category: "Living", condition: "used" },
  { id: "living-floor-lamp", title: "Simple floor lamp", price: 48, checklistItemId: "floor-lamp", category: "Living", condition: "new" },
  { id: "living-lamp-shade", title: "Warm light floor lamp", price: 58, checklistItemId: "floor-lamp", category: "Living", condition: "new" }
];

export const exploreItems: ExploreItem[] = seeds.map((seed) => ({
  condition: "new",
  logistics: seed.condition === "used" ? "pickup or local delivery" : "delivery available",
  notes: `Static starter option for ${seed.category.toLowerCase()} planning; compare price and fit before buying.`,
  source,
  url: "#",
  ...seed
}));
