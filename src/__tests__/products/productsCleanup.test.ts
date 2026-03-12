import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const fileExists = (relativePath: string) =>
  existsSync(path.join(process.cwd(), relativePath));
const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("products cleanup", () => {
  it("removes obsolete public catalog files and keeps the new taxonomy source", () => {
    const removedFiles = [
      "src/components/QuoteModal.tsx",
      "src/components/SmoothScrollProvider.tsx",
      "src/components/catalog/CategoryCard.tsx",
      "src/components/catalog/CategorySidebar.tsx",
      "src/components/catalog/ProductGrid.tsx",
      "src/components/catalog/SubcategoryCard.tsx",
      "src/components/catalog/SubcategoryPageContent.tsx",
      "src/components/ui/ProductHeroCard.tsx",
      "src/data/categories.ts",
    ];

    for (const file of removedFiles) {
      expect(fileExists(file)).toBe(false);
    }

    expect(fileExists("src/data/catalog-taxonomy.ts")).toBe(true);
    expect(readSource("src/data/catalog-taxonomy.ts")).toContain("catalogCategories");
  });
});
