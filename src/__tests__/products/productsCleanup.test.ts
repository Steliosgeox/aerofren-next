import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const fileExists = (relativePath: string) =>
  existsSync(path.join(process.cwd(), relativePath));

describe("products cleanup", () => {
  it("removes the obsolete public catalog component tree", () => {
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
  });
});
