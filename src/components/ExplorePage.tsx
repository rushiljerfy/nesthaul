"use client";

import { BookmarkPlus, Check } from "lucide-react";
import { exploreItems } from "@/lib/explore";
import { formatCurrency } from "@/lib/format";
import type { ChecklistCategory, ExploreItem, Listing } from "@/lib/types";

interface ExplorePageProps {
  savedListings: Listing[];
  onSaveItem: (item: ExploreItem) => void;
}

export function ExplorePage({ savedListings, onSaveItem }: ExplorePageProps) {
  const categories = Array.from(new Set(exploreItems.map((item) => item.category)));

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Explore</p>
          <h2>Explore starter picks</h2>
        </div>
        <p className="section-note">Static, budget-aware ideas mapped to your checklist categories.</p>
      </div>

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
      <h3 id={`explore-${category}`}>{category}</h3>
      <div className="explore-carousel">
        {items.map((item) => {
          const isSaved = savedListings.some((listing) => listing.id === item.id);

          return (
            <article className="explore-card" data-testid="explore-item" key={item.id}>
              <div>
                <span>{item.condition}</span>
                <h4>{item.title}</h4>
                <strong>{formatCurrency(item.price)}</strong>
                <p>{item.notes}</p>
                <small>{item.logistics}</small>
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
