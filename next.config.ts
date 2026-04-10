import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/earn/:path*",
        destination: "https://earn.li.fi/v1/earn/:path*",
      },
    ];
  },
};

export default nextConfig;
