import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("product detail window layout", () => {
  it("centers the product detail as a modal window instead of docking it to the right", () => {
    const source = readSource("src/components/catalog/ProductDetailRail.tsx");

    expect(source).toContain("items-center justify-center");
    expect(source).not.toContain("md:justify-end");
    expect(source).not.toContain("md:h-full");
  });

  it("locks the page scroll and coordinates overlay state while the window is open", () => {
    const source = readSource("src/components/catalog/ProductDetailRail.tsx");

    expect(source).toContain('useLenis');
    expect(source).toContain('lenis?.stop()');
    expect(source).toContain('lenis?.start()');
    expect(source).toContain('productWindowOpen');
    expect(source).toContain('product-window-toggle');
  });
});
