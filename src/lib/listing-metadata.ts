import type { ChecklistItem, Listing } from "./types";

export interface ListingMetadata {
  title: string;
  price: number;
  source: string;
  url: string;
  checklistItemId: string;
  condition: Listing["condition"];
  logistics: string;
  distance: string;
}

interface ExtractMetadataOptions {
  checklist?: ChecklistItem[];
  url: string;
}

const notAvailable = "N/A";

export function extractListingMetadata(html: string, { checklist = [], url }: ExtractMetadataOptions): ListingMetadata {
  const source = sourceFromUrl(url);
  const pageText = stripTags(html);
  const title = firstMeaningfulTitle([
    metaContent(html, "og:title"),
    metaContent(html, "twitter:title"),
    titleFromUrl(url),
    titleText(html),
    jsonLdValue(html, "name")
  ]);
  const explicitPrice = firstPresent([
    jsonLdOfferValue(html, "price"),
    jsonLdValue(html, "price"),
    metaContent(html, "product:price:amount"),
    metaContent(html, "og:price:amount"),
    amazonPrice(html)
  ]);
  const price = explicitPrice ? parsePrice(explicitPrice) : source.includes("amazon.") ? 0 : parseCurrencyPrice(pageText);
  const logistics = inferLogistics(title);
  const condition = inferCondition(title);
  const checklistItemId = inferChecklistItemId(title, checklist);

  return {
    title: title || notAvailable,
    price,
    source: source || notAvailable,
    url,
    checklistItemId,
    condition,
    logistics,
    distance: ""
  };
}

export function inferChecklistItemId(text: string, checklist: ChecklistItem[]) {
  const normalizedText = normalize(text);
  const rankedMatches = checklist
    .map((item) => ({
      item,
      score: scoreChecklistItem(normalizedText, item)
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score);

  return rankedMatches[0]?.item.id ?? "";
}

function scoreChecklistItem(text: string, item: ChecklistItem) {
  const synonymScore = categorySynonyms(item.id).reduce((score, word) => score + (text.includes(word) ? 4 : 0), 0);
  const words = normalize(item.name).split(" ").filter((word) => word.length > 2);
  const nameScore = words.reduce((score, word) => score + (text.includes(word) ? 2 : 0), 0);
  const idScore = normalize(item.id)
    .split(" ")
    .filter(Boolean)
    .reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);

  return synonymScore + nameScore + idScore;
}

function inferCondition(text: string): Listing["condition"] {
  const normalizedText = normalize(text);

  if (normalizedText.includes("open box")) {
    return "open-box";
  }

  if (normalizedText.includes("refurbished")) {
    return "refurbished";
  }

  if (normalizedText.includes("used") || normalizedText.includes("pre owned")) {
    return "used";
  }

  return "N/A";
}

function inferLogistics(text: string) {
  const normalizedText = normalize(text);

  if (normalizedText.includes("delivery") && normalizedText.includes("pickup")) {
    return "Delivery or pickup available";
  }

  if (normalizedText.includes("delivery") || normalizedText.includes("shipping")) {
    return "Delivery available";
  }

  if (normalizedText.includes("pickup") || normalizedText.includes("pick up")) {
    return "Pickup available";
  }

  return notAvailable;
}

function parsePrice(value: string) {
  const match = value.match(/\$?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/);

  if (!match) {
    return 0;
  }

  return Number(match[1].replace(/,/g, ""));
}

function parseCurrencyPrice(value: string) {
  const match = value.match(/\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/);

  if (!match) {
    return 0;
  }

  return Number(match[1].replace(/,/g, ""));
}

function amazonPrice(html: string) {
  const candidates = [
    /id=["'](?:priceblock_ourprice|priceblock_dealprice|corePriceDisplay_desktop_feature_div)["'][\s\S]*?\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i,
    /class=["'][^"']*\ba-price\b[^"']*["'][\s\S]*?class=["'][^"']*\ba-offscreen\b[^"']*["'][^>]*>\s*\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i
  ];

  for (const pattern of candidates) {
    const match = pattern.exec(html);

    if (match) {
      return match[1];
    }
  }

  return "";
}

function sourceFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function firstPresent(values: Array<string | null | undefined>) {
  return values.find((value) => value?.trim())?.trim() ?? "";
}

function firstMeaningfulTitle(values: Array<string | null | undefined>) {
  return values.find((value) => value?.trim() && !isGenericTitle(value))?.trim() ?? "";
}

function isGenericTitle(value: string) {
  return ["product", "products", "listing", "item", "marketplace", "unknown", "amazon com"].includes(normalize(value));
}

function titleFromUrl(value: string) {
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const dpIndex = segments.findIndex((segment) => segment.toLowerCase() === "dp");
    const usefulSegment =
      url.hostname.includes("amazon.") && dpIndex > 0
        ? segments[dpIndex - 1]
        : segments
            .filter((segment) => !isIgnoredUrlSegment(segment))
            .reverse()
            .find((segment) => /[a-z]/i.test(segment));

    if (!usefulSegment) {
      return "";
    }

    return usefulSegment
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b[0-9]{5,}\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

function isIgnoredUrlSegment(segment: string) {
  return /^p$|^dp$|^product$|^products$|^ref=|^[A-Z0-9]{10}$|^[0-9]+$/i.test(segment);
}

function categorySynonyms(itemId: string) {
  const synonyms: Record<string, string[]> = {
    sofa: ["sofa", "couch", "sectional", "loveseat"],
    "living-table": ["coffee table", "side table"],
    "floor-lamp": ["floor lamp"],
    mattress: ["mattress"],
    desk: ["desk", "work table"],
    "work-chair": ["chair"],
    "task-light": ["lamp", "task light"],
    "tool-kit": ["tool kit", "toolkit"]
  };

  return synonyms[itemId] ?? [];
}

function metaContent(html: string, name: string) {
  const escapedName = escapeRegExp(name);
  const propertyPattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapedName}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const contentFirstPattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedName}["'][^>]*>`,
    "i"
  );

  return decodeHtml(propertyPattern.exec(html)?.[1] ?? contentFirstPattern.exec(html)?.[1] ?? "");
}

function titleText(html: string) {
  return decodeHtml(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "");
}

function jsonLdValue(html: string, key: string) {
  for (const data of jsonLdObjects(html)) {
    const value = findNestedValue(data, key);

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function jsonLdOfferValue(html: string, key: string) {
  for (const data of jsonLdObjects(html)) {
    const offers = findNestedValue(data, "offers");
    const offerList = Array.isArray(offers) ? offers : [offers];

    for (const offer of offerList) {
      if (offer && typeof offer === "object" && key in offer) {
        const value = (offer as Record<string, unknown>)[key];

        if (typeof value === "string" || typeof value === "number") {
          return String(value);
        }
      }
    }
  }

  return "";
}

function jsonLdObjects(html: string) {
  const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const objects: unknown[] = [];

  for (const match of matches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      // Some commerce pages ship malformed JSON-LD; ignore those blocks and keep reading metadata.
    }
  }

  return objects;
}

function findNestedValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (key in value) {
    return (value as Record<string, unknown>)[key];
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        const result = findNestedValue(item, key);

        if (result !== undefined) {
          return result;
        }
      }
    } else if (child && typeof child === "object") {
      const result = findNestedValue(child, key);

      if (result !== undefined) {
        return result;
      }
    }
  }

  return undefined;
}

function stripTags(html: string) {
  return decodeHtml(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
