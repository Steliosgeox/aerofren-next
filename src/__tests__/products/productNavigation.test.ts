import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("product navigation regressions", () => {
  it("rewires the header mega menu to the new product showcase data", () => {
    const source = readSource("src/components/Header.tsx");

    expect(source).toContain("@/data/product-showcase");
    expect(source).not.toContain('from "@/data/categories"');
    expect(source).toContain("Προτεινόμενα προϊόντα");
  });

  it("removes old category query links from the homepage gallery", () => {
    const source = readSource("src/components/HorizontalGallery.tsx");

    expect(source).not.toMatch(/\/products\?category=/);
    expect(source).toContain("@/data/product-showcase");
    expect(source).not.toContain("ΚΑΤΗΓΟΡΙΕΣ ΠΡΟΪΟΝΤΩΝ");
  });
});
