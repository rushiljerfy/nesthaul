import { NextResponse } from "next/server";
import { createMoveInChecklist } from "@/lib/checklist";
import { extractListingMetadata } from "@/lib/listing-metadata";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!isHttpUrl(url)) {
    return NextResponse.json({ error: "Enter a valid listing URL." }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "NestHaul listing reader"
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Could not read that listing. Check the link and try again." }, { status: 502 });
    }

    const html = await response.text();

    return NextResponse.json(extractListingMetadata(html, { checklist: createMoveInChecklist(), url }));
  } catch {
    return NextResponse.json({ error: "Could not read that listing. Check the link and try again." }, { status: 502 });
  }
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
