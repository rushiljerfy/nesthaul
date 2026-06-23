import { NextResponse } from "next/server";
import { createMoveInChecklist } from "@/lib/checklist";
import { extractListingMetadata } from "@/lib/listing-metadata";
import { parseListingUrl } from "@/lib/listing-url";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!isHttpUrl(url)) {
    return NextResponse.json({ error: "Enter a valid listing URL." }, { status: 400 });
  }

  const parsedUrl = parseListingUrl(url);

  if (parsedUrl?.sourceId === "facebook-marketplace") {
    return NextResponse.json(manualEntryMetadata(parsedUrl));
  }

  try {
    const response = await fetch(parsedUrl?.normalizedUrl ?? url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "NestHaul listing reader"
      }
    });

    if (!response.ok) {
      return parsedUrl
        ? NextResponse.json(manualEntryMetadata(parsedUrl))
        : NextResponse.json({ error: "Could not read that listing. Check the link and try again." }, { status: 502 });
    }

    const html = await response.text();

    return NextResponse.json(extractListingMetadata(html, { checklist: createMoveInChecklist(), url: parsedUrl?.normalizedUrl ?? url }));
  } catch {
    return parsedUrl
      ? NextResponse.json(manualEntryMetadata(parsedUrl))
      : NextResponse.json({ error: "Could not read that listing. Check the link and try again." }, { status: 502 });
  }
}

function manualEntryMetadata(parsedUrl: NonNullable<ReturnType<typeof parseListingUrl>>) {
  return {
    title: "",
    price: null,
    source: parsedUrl.sourceName,
    url: parsedUrl.normalizedUrl,
    checklistItemId: "",
    condition: null,
    logistics: "",
    distance: ""
  };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
