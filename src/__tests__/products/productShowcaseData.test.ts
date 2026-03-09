import { describe, expect, it } from "vitest";

import {
  getProductBySlug,
  getProductShowcaseCount,
  productShowcaseNavigationItems,
  productShowcaseItems,
} from "@/data/product-showcase";

describe("product showcase data", () => {
  it("normalizes the live product inventory into unique public items", () => {
    expect(productShowcaseItems).toHaveLength(11);
    expect(productShowcaseItems.map((item) => item.nameEl)).toEqual(
      expect.arrayContaining([
        "ΣΩΛΗΝΕΣ ΙΝΟΧ ΘΕΡΜΟΥ ΑΕΡΑ",
        "ΠΟΛΛΑΠΛΑ ΣΤΗΡΙΓΜΑΤΑ",
        "ΜΠΡΟΥΤΖΙΝΑ ΤΑΦ",
        "ΚΟΦΤΗΣ",
        "ΘΕΡΜΟΣΥΣΤΕΛΛΟΜΕΝΑ",
        "ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ",
        "ΕΞΑΡΤΗΜΑΤΑ ΣΩΛΗΝΩΝ",
        "ΕΞΑΡΤΗΜΑΤΑ ΠΟΛΛΑΠΛΩΝ ΧΡΗΣΕΩΝ",
        "ΕΞΑΡΤΗΜΑΤΑ ΑΕΡΟΣ",
        "ΓΩΝΙΑΚΟΙ ΟΔΗΓΟΙ",
        "BALL VALVE ΑΕΡΟΣ & ΥΓΡΩΝ",
      ]),
    );
  });

  it("normalizes duplicate source files into a single product entry", () => {
    expect(
      productShowcaseItems.filter(
        (item) => item.nameEl === "ΕΞΑΡΤΗΜΑΤΑ ΣΩΛΗΝΩΝ",
      ),
    ).toHaveLength(1);
  });

  it("ships stable public fields for every product", () => {
    for (const item of productShowcaseItems) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.slug).toMatch(/^[a-z0-9-]+$/);
      expect(item.image).toMatch(/^\/images\/new-categories\//);
      expect(item.summaryEl.length).toBeGreaterThan(24);
      expect(item.highlightsEl.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("exposes stable lookup helpers", () => {
    expect(getProductShowcaseCount()).toBe(11);
    expect(getProductBySlug("epexergasia-nerou")?.nameEl).toBe(
      "ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ",
    );
    expect(getProductBySlug("does-not-exist")).toBeUndefined();
  });

  it("maps the horizontal gallery to the Scroll-second artwork set", () => {
    expect(productShowcaseNavigationItems).toHaveLength(
      productShowcaseItems.length,
    );

    for (const item of productShowcaseNavigationItems) {
      expect(item.image).toMatch(/^\/images\/Scroll-second\//);
      expect(item.href).toBe(`/products#${item.slug}`);
    }
  });
});
