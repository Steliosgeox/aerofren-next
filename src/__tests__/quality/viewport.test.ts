import { describe, expect, it } from "vitest";

import { getDynamicViewportHeight } from "@/lib/viewport";

describe("getDynamicViewportHeight", () => {
  it("prefers visualViewport height when available", () => {
    expect(
      getDynamicViewportHeight({
        innerHeight: 932,
        visualViewport: { height: 812 },
      }),
    ).toBe(812);
  });

  it("falls back to innerHeight when visualViewport is unavailable", () => {
    expect(
      getDynamicViewportHeight({
        innerHeight: 844,
      }),
    ).toBe(844);
  });
});
