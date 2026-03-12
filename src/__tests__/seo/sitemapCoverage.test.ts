import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { catalogCategories } from "@/data/catalog-taxonomy";

describe("sitemap coverage", () => {
  it("includes all canonical category and subcategory URLs", () => {
    const entries = sitemap().map((entry) => entry.url);

    expect(entries).toContain("https://aerofren.gr/products");

    for (const category of catalogCategories) {
      expect(entries).toContain(`https://aerofren.gr/products/${category.slug}`);

      for (const subcategory of category.subcategories) {
        expect(entries).toContain(
          `https://aerofren.gr${subcategory.canonicalPath}`,
        );
      }
    }
  });

  it("does not publish redirect-only legacy product URLs", () => {
    const entries = sitemap().map((entry) => entry.url);

    expect(entries).not.toContain("https://aerofren.gr/products/pneumatic-valves");
  });
});
