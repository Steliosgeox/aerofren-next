import { describe, expect, it } from "vitest";

import {
  catalogCategories,
  getCategoryBySlug,
  getSubcategoryBySlug,
} from "@/data/catalog-taxonomy";

describe("catalog taxonomy data", () => {
  it("ships the approved phase-1 category structure", () => {
    expect(catalogCategories.map((category) => category.slug)).toEqual([
      "push-in-fittings",
      "thread-fittings",
      "hoses-pipes",
      "ball-valves",
      "air-tools",
      "water-filtration",
      "installation-accessories",
    ]);
  });

  it("covers all 11 approved subcategory slugs", () => {
    const subcategorySlugs = catalogCategories.flatMap((category) =>
      category.subcategories.map((subcategory) => subcategory.slug),
    );

    expect(subcategorySlugs).toHaveLength(11);
    expect(subcategorySlugs).toEqual(
      expect.arrayContaining([
        "exartimata-aeros",
        "goniakoi-odigoi",
        "mproutzina-taf",
        "exartimata-solinon",
        "exartimata-pollaplon-xriseon",
        "solines-inox-thermou-aera",
        "ball-valve-aeros-ygrown",
        "koftis",
        "epexergasia-nerou",
        "pollapla-stirigmata",
        "thermosystellomena",
      ]),
    );
  });

  it("provides stable lookup helpers and canonical paths", () => {
    expect(getCategoryBySlug("push-in-fittings")?.nameEl).toBe(
      "Ρακόρ Ταχυσύνδεσης",
    );
    expect(getSubcategoryBySlug("epexergasia-nerou")?.canonicalPath).toBe(
      "/products/water-filtration/epexergasia-nerou",
    );
    expect(getSubcategoryBySlug("does-not-exist")).toBeUndefined();
  });
});
