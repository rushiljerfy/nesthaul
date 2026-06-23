import { describe, expect, it } from "vitest";
import { extractListingMetadata } from "./listing-metadata";
import type { ChecklistItem } from "./types";

const checklist: ChecklistItem[] = [
  {
    id: "mattress",
    name: "Mattress",
    category: "Sleep",
    priority: "urgent",
    suggestedBudget: 300,
    status: "missing",
    sourceIds: []
  },
  {
    id: "desk",
    name: "Desk or work table",
    category: "Work",
    priority: "soon",
    suggestedBudget: 125,
    status: "missing",
    sourceIds: []
  },
  {
    id: "sofa",
    name: "Small sofa or loveseat",
    category: "Living",
    priority: "nice-to-have",
    suggestedBudget: 250,
    status: "missing",
    sourceIds: []
  },
  {
    id: "tool-kit",
    name: "Small tool kit",
    category: "Storage",
    priority: "soon",
    suggestedBudget: 35,
    status: "missing",
    sourceIds: []
  }
];

describe("listing metadata extraction", () => {
  it("extracts listing fields from JSON-LD and page copy", () => {
    const metadata = extractListingMetadata(
      `
        <html>
          <head>
            <meta property="og:title" content="Queen memory foam mattress">
            <script type="application/ld+json">
              {
                "@type": "Product",
                "name": "Queen memory foam mattress",
                "offers": { "price": "249.99" }
              }
            </script>
          </head>
          <body>New condition. Delivery and pickup available today.</body>
        </html>
      `,
      { checklist, url: "https://shop.example.com/listings/mattress" }
    );

    expect(metadata).toEqual({
      title: "Queen memory foam mattress",
      price: 249.99,
      source: "shop.example.com",
      url: "https://shop.example.com/listings/mattress",
      checklistItemId: "mattress",
      condition: null,
      logistics: "",
      distance: ""
    });
  });

  it("uses empty and null fallbacks when listing details are unavailable", () => {
    const metadata = extractListingMetadata("<html><body>No product data here.</body></html>", {
      checklist,
      url: "https://market.example.com/unknown"
    });

    expect(metadata).toMatchObject({
      title: "",
      price: null,
      source: "market.example.com",
      checklistItemId: "",
      condition: null,
      logistics: "",
      distance: ""
    });
  });

  it("prefers product page metadata over generic JSON-LD names", () => {
    const metadata = extractListingMetadata(
      `
        <html>
          <head>
            <meta property="og:title" content="Firm foam mattress, Twin">
            <script type="application/ld+json">
              { "@type": "BreadcrumbList", "name": "Products" }
            </script>
          </head>
        </html>
      `,
      { checklist, url: "https://www.ikea.com/us/en/p/example" }
    );

    expect(metadata.title).toBe("Firm foam mattress, Twin");
    expect(metadata.checklistItemId).toBe("mattress");
  });

  it("uses the product URL slug when page metadata is generic", () => {
    const metadata = extractListingMetadata(
      `
        <html>
          <head>
            <title>Products</title>
            <script type="application/ld+json">
              { "@type": "BreadcrumbList", "name": "Products" }
            </script>
          </head>
        </html>
      `,
      { checklist, url: "https://www.ikea.com/us/en/p/agotnes-foam-mattress-firm-light-blue-10480847/" }
    );

    expect(metadata.title).toBe("agotnes foam mattress firm light blue");
    expect(metadata.checklistItemId).toBe("mattress");
  });

  it("does not treat product numbers as prices", () => {
    const metadata = extractListingMetadata("<html><body>Article 10480847 no price exposed</body></html>", {
      checklist,
      url: "https://www.ikea.com/us/en/p/agotnes-foam-mattress-firm-light-blue-10480847/"
    });

    expect(metadata.title).toBe("agotnes foam mattress firm light blue");
    expect(metadata.price).toBeNull();
  });

  it("can read currency-marked prices from page text", () => {
    const metadata = extractListingMetadata("<html><body>Used desk available for $85 pickup only</body></html>", {
      checklist,
      url: "https://market.example.com/used-desk"
    });

    expect(metadata.price).toBe(85);
    expect(metadata.checklistItemId).toBe("desk");
  });

  it("does not use Amazon tracking, filters, or page chrome as listing facts", () => {
    const metadata = extractListingMetadata(
      `
        <html>
          <head><title>Amazon.com: GAOMON sectional sofa</title></head>
          <body>
            Search filters include Refurbished and Small tool kit.
            Sponsored banner shows $10 coupon.
            <span class="a-price"><span class="a-offscreen">$99.99</span></span>
          </body>
        </html>
      `,
      {
        checklist,
        url: "https://www.amazon.com/GAOMON-Sectional-Cushions-Armrests-Capacity/dp/B0GYDF9BLT/ref=sr_1_1_sspa?keywords=couch"
      }
    );

    expect(metadata.title).toBe("GAOMON Sectional Cushions Armrests Capacity");
    expect(metadata.price).toBe(99.99);
    expect(metadata.condition).toBeNull();
    expect(metadata.checklistItemId).toBe("sofa");
  });

  it("does not invent price or condition for Facebook Marketplace pages", () => {
    const metadata = extractListingMetadata("<html><body>Facebook Marketplace</body></html>", {
      checklist,
      url: "https://www.facebook.com/marketplace/item/1038206661965081/?ref=category_feed&tracking=abc"
    });

    expect(metadata.source).toBe("Facebook Marketplace");
    expect(metadata.url).toBe("https://www.facebook.com/marketplace/item/1038206661965081/");
    expect(metadata.price).toBeNull();
    expect(metadata.condition).toBeNull();
  });
});
