"use client";

import { useState } from "react";
import { LinkIcon, Plus } from "lucide-react";
import { assessListing } from "@/lib/recommendations";
import { formatCurrency } from "@/lib/format";
import type { ChecklistItem, Listing } from "@/lib/types";

interface SavedListingsProps {
  checklist: ChecklistItem[];
  listings: Listing[];
  totalBudget: number;
  plannedSpend: number;
  onAddListing: (listing: Listing) => void;
}

interface ListingFormState {
  title: string;
  price: string;
  source: string;
  url: string;
  checklistItemId: string;
  condition: Listing["condition"];
  logistics: string;
  distance: string;
  notes: string;
}

const initialForm: ListingFormState = {
  title: "",
  price: "",
  source: "",
  url: "",
  checklistItemId: "",
  condition: "used",
  logistics: "",
  distance: "",
  notes: ""
};

export function SavedListings({
  checklist,
  listings,
  totalBudget,
  plannedSpend,
  onAddListing
}: SavedListingsProps) {
  const [form, setForm] = useState<ListingFormState>(initialForm);
  const [error, setError] = useState("");

  function updateField(name: keyof ListingFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedItem = checklist.find((item) => item.id === form.checklistItemId);

    if (!form.title.trim() || !form.price || !form.source.trim() || !form.url.trim() || !selectedItem || !form.logistics.trim()) {
      setError("Title, price, source, URL, checklist item, and delivery or pickup info are required.");
      return;
    }

    const listing: Listing = {
      id: globalThis.crypto?.randomUUID?.() ?? `listing-${Date.now()}`,
      title: form.title.trim(),
      price: Number(form.price),
      source: form.source.trim(),
      url: form.url.trim(),
      checklistItemId: selectedItem.id,
      category: selectedItem.category,
      condition: form.condition,
      logistics: form.logistics.trim(),
      distance: form.distance ? Number(form.distance) : undefined,
      notes: form.notes.trim() || undefined
    };

    onAddListing(listing);
    setForm(initialForm);
    setError("");
  }

  return (
    <section className="section-shell">
      <div className="section-heading">
        <p className="eyebrow">Saved listings</p>
        <h2>Compare options before you buy.</h2>
      </div>

      {error ? (
        <div className="form-errors" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      <form className="listing-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </label>
        <label>
          Price
          <input type="number" min="0" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
        </label>
        <label>
          Source
          <input value={form.source} onChange={(event) => updateField("source", event.target.value)} />
        </label>
        <label>
          URL
          <input value={form.url} onChange={(event) => updateField("url", event.target.value)} />
        </label>
        <label>
          Category/checklist item
          <select value={form.checklistItemId} onChange={(event) => updateField("checklistItemId", event.target.value)}>
            <option value="">Choose item</option>
            {checklist.map((item) => (
              <option key={item.id} value={item.id}>
                {item.category}: {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Condition
          <select value={form.condition} onChange={(event) => updateField("condition", event.target.value)}>
            <option value="used">Used</option>
            <option value="new">New</option>
            <option value="open-box">Open box</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </label>
        <label>
          Delivery or pickup info
          <input value={form.logistics} onChange={(event) => updateField("logistics", event.target.value)} />
        </label>
        <label>
          Optional distance
          <input type="number" min="0" value={form.distance} onChange={(event) => updateField("distance", event.target.value)} />
        </label>
        <label className="wide-field">
          Notes
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
        </label>
        <button className="primary-button form-submit" type="submit">
          <Plus aria-hidden="true" size={18} />
          Save listing
        </button>
      </form>

      <div className="listing-list">
        {listings.length === 0 ? (
          <p className="empty-state">No listings saved yet.</p>
        ) : (
          listings.map((listing) => {
            const assessment = assessListing(listing, checklist, totalBudget, plannedSpend);
            return (
              <article className="listing-row" key={listing.id}>
                <div>
                  <h3>{listing.title}</h3>
                  <p>
                    {listing.source} · {listing.condition} · {listing.logistics}
                  </p>
                  {listing.savedFrom === "explore" ? <p className="saved-source">Saved from Explore</p> : null}
                  {listing.notes ? <p>{listing.notes}</p> : null}
                  <a href={listing.url} target="_blank" rel="noreferrer">
                    <LinkIcon aria-hidden="true" size={14} />
                    View listing
                  </a>
                </div>
                <div className={`recommendation recommendation-${assessment.recommendation.toLowerCase()}`}>
                  <strong>{assessment.recommendation}</strong>
                  <span>{formatCurrency(listing.price)}</span>
                  <p>{assessment.explanation}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
