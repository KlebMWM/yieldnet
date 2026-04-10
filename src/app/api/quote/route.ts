import { NextRequest, NextResponse } from "next/server";

const COMPOSER_URL = "https://li.quest/v1/quote";
const API_KEY = process.env.LIFI_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  if (!qs) {
    return NextResponse.json({ error: "Missing query params" }, { status: 400 });
  }

  try {
    const res = await fetch(`${COMPOSER_URL}?${qs}`, {
      headers: { "x-lifi-api-key": API_KEY },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: "Quote fetch failed" }, { status: 502 });
  }
}
