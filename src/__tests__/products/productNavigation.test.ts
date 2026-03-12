import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("product navigation regressions", () => {
  it("rewires the header mega menu to the catalog taxonomy", () => {
    const source = readSource("src/components/Header.tsx");

    expect(source).toContain("@/data/catalog-taxonomy");
    expect(source).not.toContain("@/data/product-showcase");
    expect(source).toContain("Κατηγορίες προϊόντων");
  });

  it("routes the homepage gallery through canonical category paths", () => {
    const source = readSource("src/components/HorizontalGallery.tsx");

    expect(source).not.toContain("/products#");
    expect(source).toContain("@/data/catalog-taxonomy");
    expect(source).toContain("SEO Κατηγορίες");
  });
});
