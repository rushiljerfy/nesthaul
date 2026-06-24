"use client";

import { useState } from "react";
import { LinkIcon, Plus, X } from "lucide-react";
import { assessListing } from "@/lib/recommendations";
import { formatCurrency } from "@/lib/format";
import type { ChecklistItem, Listing } from "@/lib/types";
import { Badge, Button, Card, EmptyState, FormField, SectionHeader, SelectInput, TextInput } from "./ui";

interface SavedListingsProps {
  checklist: ChecklistItem[];
  listings: Listing[];
  totalBudget: number;
  plannedSpend: number;
  onAddListing: (listing: Listing) => void;
  onRemoveListing: (listingId: string) => void;
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
}

const initialForm: ListingFormState = {
  title: "",
  price: "",
  source: "",
  url: "",
  checklistItemId: "",
  condition: "unknown",
  logistics: "",
  distance: ""
};

export function SavedListings({
  checklist,
  listings,
  totalBudget,
  plannedSpend,
  onAddListing,
  onRemoveListing
}: SavedListingsProps) {
  const [form, setForm] = useState<ListingFormState>(initialForm);
  const [listingUrl, setListingUrl] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isReadingListing, setIsReadingListing] = useState(false);

  function updateField(name: keyof ListingFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleReadListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!listingUrl.trim()) {
      setError("Paste a listing URL first.");
      return;
    }

    setIsReadingListing(true);

    try {
      const response = await fetch("/api/listing-metadata", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: listingUrl.trim() })
      });
      const result = (await response.json()) as Partial<ListingFormState> & {
        error?: string;
        price?: number | null;
        condition?: Listing["condition"] | null;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not read that listing. Check the link and try again.");
        return;
      }

      setForm({
        title: result.title ?? "",
        price: result.price === null || result.price === undefined ? "" : String(result.price),
        source: result.source ?? "",
        url: result.url ?? listingUrl.trim(),
        checklistItemId: result.checklistItemId ?? "",
        condition: result.condition ?? "unknown",
        logistics: result.logistics ?? "",
        distance: result.distance ?? ""
      });
      setStatus("Listing details loaded. Review and save when ready.");
    } catch {
      setError("Could not read that listing. Check the link and try again.");
    } finally {
      setIsReadingListing(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedItem = checklist.find((item) => item.id === form.checklistItemId);

    if (!form.url.trim() || !selectedItem) {
      setError("Read a listing URL and choose a checklist item before saving.");
      return;
    }

    if (!form.title.trim()) {
      setError("Add a listing title before saving.");
      return;
    }

    const price = Number(form.price);

    if (!form.price.trim() || !Number.isFinite(price) || price < 0) {
      setError("Enter the real listing price before saving.");
      return;
    }

    const listing: Listing = {
      id: globalThis.crypto?.randomUUID?.() ?? `listing-${Date.now()}`,
      title: form.title.trim(),
      price,
      source: form.source.trim(),
      url: form.url.trim(),
      checklistItemId: selectedItem.id,
      category: selectedItem.category,
      condition: form.condition,
      logistics: form.logistics.trim(),
      distance: form.distance ? Number(form.distance) : undefined
    };

    onAddListing(listing);
    setForm(initialForm);
    setListingUrl("");
    setError("");
    setStatus("");
  }

  return (
    <section className="section-shell">
      <SectionHeader
        eyebrow="Saved items"
        title="Compare options before you buy"
        note="Paste a listing URL, review the details, and NestHaul will label each option as buy, wait, or skip."
      />

      {error ? (
        <div className="form-errors" role="alert">
          <p>{error}</p>
        </div>
      ) : null}
      {status ? (
        <div className="success-message" role="status">
          {status}
        </div>
      ) : null}

      <Card className="listing-workspace">
        <form className="listing-link-form" onSubmit={handleReadListing}>
          <FormField label="Listing URL">
            <TextInput
            placeholder="Paste a marketplace, store, or product link"
            type="url"
            value={listingUrl}
            onChange={(event) => setListingUrl(event.target.value)}
          />
          </FormField>
          <Button disabled={isReadingListing} type="submit">
            <Plus aria-hidden="true" size={18} />
            {isReadingListing ? "Reading..." : "Read listing"}
          </Button>
        </form>

        <form className="listing-form listing-review-form" onSubmit={handleSubmit}>
          <FormField label="Title">
            <TextInput value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </FormField>
          <FormField label="Price">
            <TextInput
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
          </FormField>
          <FormField label="Source">
            <TextInput value={form.source} onChange={(event) => updateField("source", event.target.value)} />
          </FormField>
          <FormField label="URL">
            <TextInput value={form.url} onChange={(event) => updateField("url", event.target.value)} />
          </FormField>
          <FormField label="Category/checklist item">
            <SelectInput value={form.checklistItemId} onChange={(event) => updateField("checklistItemId", event.target.value)}>
            <option value="">Choose item</option>
            {checklist.map((item) => (
              <option key={item.id} value={item.id}>
                {item.category}: {item.name}
              </option>
            ))}
            </SelectInput>
          </FormField>
          <FormField label="Condition">
            <SelectInput value={form.condition} onChange={(event) => updateField("condition", event.target.value)}>
            <option value="unknown">Unknown</option>
            <option value="N/A">N/A</option>
            <option value="used">Used</option>
            <option value="new">New</option>
            <option value="open-box">Open box</option>
            <option value="refurbished">Refurbished</option>
            </SelectInput>
          </FormField>
          <FormField label="Delivery or pickup info">
            <TextInput value={form.logistics} onChange={(event) => updateField("logistics", event.target.value)} />
          </FormField>
          <FormField label="Optional distance">
            <TextInput type="number" min="0" value={form.distance} onChange={(event) => updateField("distance", event.target.value)} />
          </FormField>
          <Button className="form-submit" type="submit">
            <Plus aria-hidden="true" size={18} />
            Save listing
          </Button>
        </form>
      </Card>

      <div className="listing-list">
        {listings.length === 0 ? (
          <EmptyState>No listings saved yet. Save a starter item or paste a listing you are considering.</EmptyState>
        ) : (
          listings.map((listing) => {
            const assessment = assessListing(listing, checklist, totalBudget, plannedSpend);
            return (
              <article className="listing-row card" key={listing.id}>
                <div>
                  <div className="listing-title-row">
                    <h3>{listing.title}</h3>
                    <button
                      aria-label={`Remove ${listing.title}`}
                      className="icon-button"
                      type="button"
                      onClick={() => onRemoveListing(listing.id)}
                    >
                      <X aria-hidden="true" size={16} />
                    </button>
                  </div>
                  <p>
                    {listing.source} · {formatCondition(listing.condition)} · {listing.logistics || "Unknown logistics"}
                  </p>
                  {listing.savedFrom === "explore" ? <Badge tone="orange">Saved from Explore</Badge> : null}
                  {listing.notes ? <p>{listing.notes}</p> : null}
                  <a href={listing.url} target="_blank" rel="noreferrer">
                    <LinkIcon aria-hidden="true" size={14} />
                    View listing
                  </a>
                </div>
                <div className={`recommendation recommendation-${assessment.recommendation.toLowerCase()}`}>
                  <Badge tone={recommendationTone(assessment.recommendation)}>{assessment.recommendation}</Badge>
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

function recommendationTone(recommendation: ReturnType<typeof assessListing>["recommendation"]) {
  if (recommendation === "Buy") {
    return "green";
  }

  if (recommendation === "Wait") {
    return "yellow";
  }

  return "red";
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
