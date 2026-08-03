import { describe, expect, it } from "vitest"

import nextConfig from "./next.config.js"

describe("Next.js development origin", () => {
  it("allows the documented 127.0.0.1 URL to load client resources", () => {
    expect(nextConfig.allowedDevOrigins).toContain("127.0.0.1")
  })
})
