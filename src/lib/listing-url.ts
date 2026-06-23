export type ListingSourceId =
  | "facebook-marketplace"
  | "amazon"
  | "ikea"
  | "target"
  | "walmart"
  | "wayfair"
  | "craigslist"
  | "unknown";

export interface ParsedListingUrl {
  sourceId: ListingSourceId;
  sourceName: string;
  normalizedUrl: string;
  hostname: string;
}

const removableQueryParams = new Set([
  "fbclid",
  "gclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_",
  "referral_code",
  "referral_story_type",
  "spm",
  "tracking"
]);

export function parseListingUrl(value: string): ParsedListingUrl | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";
    stripTrackingParams(url);

    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "facebook.com" || hostname.endsWith(".facebook.com")) {
      return parseFacebookMarketplaceUrl(url, hostname);
    }

    if (hostname.includes("amazon.")) {
      return {
        sourceId: "amazon",
        sourceName: "Amazon",
        normalizedUrl: normalizeAmazonUrl(url),
        hostname
      };
    }

    if (hostname === "ikea.com" || hostname.endsWith(".ikea.com")) {
      return sourceResult("ikea", "IKEA", url, hostname);
    }

    if (hostname === "target.com" || hostname.endsWith(".target.com")) {
      return sourceResult("target", "Target", url, hostname);
    }

    if (hostname === "walmart.com" || hostname.endsWith(".walmart.com")) {
      return sourceResult("walmart", "Walmart", url, hostname);
    }

    if (hostname === "wayfair.com" || hostname.endsWith(".wayfair.com")) {
      return sourceResult("wayfair", "Wayfair", url, hostname);
    }

    if (hostname === "craigslist.org" || hostname.endsWith(".craigslist.org")) {
      return sourceResult("craigslist", "Craigslist", url, hostname);
    }

    return sourceResult("unknown", hostname, url, hostname);
  } catch {
    return null;
  }
}

function parseFacebookMarketplaceUrl(url: URL, hostname: string): ParsedListingUrl {
  const itemId = url.pathname.match(/\/marketplace\/item\/([0-9]+)/i)?.[1];

  if (itemId) {
    return {
      sourceId: "facebook-marketplace",
      sourceName: "Facebook Marketplace",
      normalizedUrl: `${url.origin}/marketplace/item/${itemId}/`,
      hostname
    };
  }

  return sourceResult("facebook-marketplace", "Facebook Marketplace", url, hostname);
}

function normalizeAmazonUrl(url: URL) {
  const segments = url.pathname.split("/").filter(Boolean);
  const dpIndex = segments.findIndex((segment) => segment.toLowerCase() === "dp");
  const asin = dpIndex >= 0 ? segments[dpIndex + 1] : "";

  url.search = "";

  if (asin) {
    const slug = dpIndex > 0 ? `/${segments[dpIndex - 1]}` : "";
    return `${url.origin}${slug}/dp/${asin}/`;
  }

  return url.toString();
}

function stripTrackingParams(url: URL) {
  for (const key of Array.from(url.searchParams.keys())) {
    if (key.toLowerCase().startsWith("utm_") || removableQueryParams.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
}

function sourceResult(sourceId: ListingSourceId, sourceName: string, url: URL, hostname: string): ParsedListingUrl {
  return {
    sourceId,
    sourceName,
    normalizedUrl: url.toString(),
    hostname
  };
}
