import { describe, expect, it } from "vitest";
import { parseListingUrl } from "./listing-url";

const facebookMarketplaceUrl =
  "https://www.facebook.com/marketplace/item/1038206661965081/?ref=category_feed&referral_code=null&referral_story_type=listing&tracking=%7B%22qid%22%3A%22-6656564809675741073%22%7D";

describe("listing URL parsing", () => {
  it("detects and cleans Facebook Marketplace item URLs", () => {
    expect(parseListingUrl(facebookMarketplaceUrl)).toMatchObject({
      sourceId: "facebook-marketplace",
      sourceName: "Facebook Marketplace",
      normalizedUrl: "https://www.facebook.com/marketplace/item/1038206661965081/"
    });
  });

  it("detects Amazon product URLs and removes tracking params", () => {
    expect(
      parseListingUrl("https://www.amazon.com/GAOMON-Sectional-Cushions-Armrests-Capacity/dp/B0GYDF9BLT/ref=sr_1_1?keywords=couch")
    ).toMatchObject({
      sourceId: "amazon",
      sourceName: "Amazon",
      normalizedUrl: "https://www.amazon.com/GAOMON-Sectional-Cushions-Armrests-Capacity/dp/B0GYDF9BLT/"
    });
  });

  it("detects IKEA links", () => {
    expect(parseListingUrl("https://www.ikea.com/us/en/p/agotnes-foam-mattress-firm-light-blue-10480847/?utm_source=ad")).toMatchObject({
      sourceId: "ikea",
      sourceName: "IKEA",
      normalizedUrl: "https://www.ikea.com/us/en/p/agotnes-foam-mattress-firm-light-blue-10480847/"
    });
  });

  it.each([
    ["https://www.target.com/p/example/-/A-123?ref=tgt_adv_xsp", "target", "Target"],
    ["https://www.walmart.com/ip/example/123?athbdg=L1100", "walmart", "Walmart"],
    ["https://www.wayfair.com/furniture/pdp/example.html?piid=123", "wayfair", "Wayfair"],
    ["https://newyork.craigslist.org/brk/fuo/d/brooklyn-desk/1234567890.html?utm_campaign=test", "craigslist", "Craigslist"]
  ])("detects %s", (url, sourceId, sourceName) => {
    expect(parseListingUrl(url)).toMatchObject({ sourceId, sourceName });
  });

  it("falls back to the hostname for unknown links", () => {
    expect(parseListingUrl("https://shop.example.com/listings/123?utm_medium=email")).toMatchObject({
      sourceId: "unknown",
      sourceName: "shop.example.com",
      normalizedUrl: "https://shop.example.com/listings/123"
    });
  });
});
