"use client";

import { formatCurrency } from "@/lib/format";
import type { ChecklistCategory, ChecklistItem, ChecklistStatus } from "@/lib/types";
import { Badge, Card, SectionHeader } from "./ui";

interface ChecklistManagerProps {
  checklist: ChecklistItem[];
  onUpdateStatus: (itemId: string, status: ChecklistStatus) => void;
}

const statusOptions: ChecklistStatus[] = ["missing", "saved", "bought", "skipped"];

export function ChecklistManager({ checklist, onUpdateStatus }: ChecklistManagerProps) {
  const categories = Array.from(new Set(checklist.map((item) => item.category)));

  return (
    <section className="section-shell">
      <SectionHeader
        eyebrow="Your checklist"
        title="Apartment essentials by category"
        note="Mark each item as missing, saved, bought, or skipped as your plan changes."
      />

      <div className="category-list">
        {categories.map((category) => (
          <CategoryGroup
            key={category}
            category={category}
            items={checklist.filter((item) => item.category === category)}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryGroup({
  category,
  items,
  onUpdateStatus
}: {
  category: ChecklistCategory;
  items: ChecklistItem[];
  onUpdateStatus: (itemId: string, status: ChecklistStatus) => void;
}) {
  return (
    <Card className="category-group">
      <h3>{category}</h3>
      <div className="checklist-items">
        {items.map((item) => (
          <div className="checklist-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>
                <Badge tone={item.priority === "urgent" ? "orange" : "neutral"}>{item.priority}</Badge>
                {formatCurrency(item.suggestedBudget)} target
              </span>
            </div>
            <select value={item.status} onChange={(event) => onUpdateStatus(item.id, event.target.value as ChecklistStatus)}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </Card>
  );
}
