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
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Quote fetch failed" }, { status: 502 });
  }
}
