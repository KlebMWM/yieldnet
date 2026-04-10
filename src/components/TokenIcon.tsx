"use client";

import { useState } from "react";
import { getTokenIconUrl } from "@/lib/tokens";

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

/** Deterministic hue from a string */
function symToHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return ((h % 360) + 360) % 360;
}

export default function TokenIcon({ symbol, size = 24, className = "" }: TokenIconProps) {
  const [failed, setFailed] = useState(false);
  const url = getTokenIconUrl(symbol);

  if (failed || !url) {
    const hue = symToHue(symbol);
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.42, backgroundColor: `hsl(${hue}, 55%, 50%)` }}
      >
        {symbol.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full shrink-0 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
