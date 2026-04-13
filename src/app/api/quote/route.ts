import { NextRequest, NextResponse } from "next/server";

const COMPOSER_URL = "https://li.quest/v1/quote";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  if (!qs) {
    return NextResponse.json({ error: "Missing query params" }, { status: 400 });
  }

  const apiKey = process.env.LIFI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "LIFI_API_KEY is not configured on the server. Copy .env.local.example to .env.local and set the key." },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${COMPOSER_URL}?${qs}`, {
      headers: { "x-lifi-api-key": apiKey },
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream quote failed", status: res.status, body: text.slice(0, 300) },
        { status: 502 },
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: "Upstream returned non-JSON response", body: text.slice(0, 300) },
        { status: 502 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Quote fetch failed" },
      { status: 502 },
    );
  }
}
