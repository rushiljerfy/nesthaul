import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("listing metadata route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes Facebook Marketplace links without scraping them", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const response = await POST(
      new Request("http://localhost/api/listing-metadata", {
        method: "POST",
        body: JSON.stringify({
          url: "https://www.facebook.com/marketplace/item/1038206661965081/?ref=category_feed&referral_code=null&referral_story_type=listing&tracking=abc"
        })
      })
    );

    await expect(response.json()).resolves.toEqual({
      title: "",
      price: null,
      source: "Facebook Marketplace",
      url: "https://www.facebook.com/marketplace/item/1038206661965081/",
      checklistItemId: "",
      condition: null,
      logistics: "",
      distance: ""
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("falls back to manual entry metadata when a detected retailer page cannot be read", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);
    const response = await POST(
      new Request("http://localhost/api/listing-metadata", {
        method: "POST",
        body: JSON.stringify({
          url: "https://www.amazon.com/GAOMON-Sectional-Cushions-Armrests-Capacity/dp/B0GYDF9BLT/ref=sr_1_1?keywords=couch"
        })
      })
    );

    await expect(response.json()).resolves.toEqual({
      title: "",
      price: null,
      source: "Amazon",
      url: "https://www.amazon.com/GAOMON-Sectional-Cushions-Armrests-Capacity/dp/B0GYDF9BLT/",
      checklistItemId: "",
      condition: null,
      logistics: "",
      distance: ""
    });
  });
});
