import { NextRequest, NextResponse } from "next/server";

const EARN_URL = "https://earn.li.fi/v1/vaults";

export async function GET(req: NextRequest) {
  const apiKey = process.env.LIFI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "LIFI_API_KEY is not configured on the server. Copy .env.local.example to .env.local and set the key." },
      { status: 500 },
    );
  }

  const qs = req.nextUrl.searchParams.toString();
  const url = qs ? `${EARN_URL}?${qs}` : EARN_URL;

  try {
    const res = await fetch(url, {
      headers: { "x-lifi-api-key": apiKey },
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream vaults fetch failed", status: res.status, body: text.slice(0, 300) },
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
      { error: err instanceof Error ? err.message : "Vaults fetch failed" },
      { status: 502 },
    );
  }
}
