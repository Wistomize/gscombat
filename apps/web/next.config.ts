import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:3001"
    return [{ destination: `${apiBaseUrl}/:path*`, source: "/api/backend/:path*" }]
  },
  output: "standalone"
}

export default nextConfig
