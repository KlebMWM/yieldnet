import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/earn/:path*",
        destination: "https://earn.li.fi/v1/earn/:path*",
      },
      {
        source: "/api/quote",
        destination: "https://li.quest/v1/quote",
      },
    ];
  },
};

export default nextConfig;
