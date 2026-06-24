"use client";

import { Bath, BedDouble, BookmarkPlus, BriefcaseBusiness, Check, CookingPot, LampFloor, Package, Sparkles } from "lucide-react";
import { exploreItems } from "@/lib/explore";
import { formatCurrency } from "@/lib/format";
import type { ChecklistCategory, ExploreItem, Listing } from "@/lib/types";
import { Badge, SectionHeader } from "./ui";

interface ExplorePageProps {
  savedListings: Listing[];
  onSaveItem: (item: ExploreItem) => void;
}

export function ExplorePage({ savedListings, onSaveItem }: ExplorePageProps) {
  const categories = Array.from(new Set(exploreItems.map((item) => item.category)));

  return (
    <section className="section-shell">
      <SectionHeader
        eyebrow="Explore"
        title="Explore starter items"
        note="Save items you are considering and NestHaul will help you track your plan."
      />

      <div className="explore-stack">
        {categories.map((category) => (
          <ExploreCarousel
            category={category}
            items={exploreItems.filter((item) => item.category === category)}
            key={category}
            savedListings={savedListings}
            onSaveItem={onSaveItem}
          />
        ))}
      </div>
    </section>
  );
}

function ExploreCarousel({
  category,
  items,
  savedListings,
  onSaveItem
}: {
  category: ChecklistCategory;
  items: ExploreItem[];
  savedListings: Listing[];
  onSaveItem: (item: ExploreItem) => void;
}) {
  return (
    <section className="explore-category" aria-labelledby={`explore-${category}`}>
      <div className="explore-category-heading">
        <span className="category-icon">{categoryIcon(category)}</span>
        <h3 id={`explore-${category}`}>{category}</h3>
      </div>
      <div className="explore-carousel">
        {items.map((item) => {
          const isSaved = savedListings.some((listing) => listing.id === item.id);

          return (
            <article className="explore-card" data-testid="explore-item" key={item.id}>
              <div>
                <div className="item-visual" aria-hidden="true">
                  {categoryIcon(item.category)}
                </div>
                <div className="item-meta">
                  <Badge tone="neutral">{item.category}</Badge>
                  <span>{item.source}</span>
                </div>
                <h4>{item.title}</h4>
                <strong>{formatCurrency(item.price)}</strong>
                <p>{item.notes}</p>
                <small>
                  {formatCondition(item.condition)} · {item.logistics}
                </small>
              </div>
              <button disabled={isSaved} type="button" onClick={() => onSaveItem(item)}>
                {isSaved ? <Check aria-hidden="true" size={16} /> : <BookmarkPlus aria-hidden="true" size={16} />}
                {isSaved ? "Saved" : "Save to List"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function categoryIcon(category: ChecklistCategory) {
  const props = { size: 20, strokeWidth: 1.8 };

  switch (category) {
    case "Sleep":
      return <BedDouble aria-hidden="true" {...props} />;
    case "Work":
      return <BriefcaseBusiness aria-hidden="true" {...props} />;
    case "Kitchen":
      return <CookingPot aria-hidden="true" {...props} />;
    case "Bathroom":
      return <Bath aria-hidden="true" {...props} />;
    case "Cleaning":
      return <Sparkles aria-hidden="true" {...props} />;
    case "Storage":
      return <Package aria-hidden="true" {...props} />;
    case "Living":
      return <LampFloor aria-hidden="true" {...props} />;
  }
}

function formatCondition(condition: Listing["condition"]) {
  const labels: Record<Listing["condition"], string> = {
    new: "New",
    used: "Used",
    "open-box": "Open box",
    refurbished: "Refurbished",
    unknown: "Unknown condition",
    "N/A": "N/A"
  };

  return labels[condition];
}
