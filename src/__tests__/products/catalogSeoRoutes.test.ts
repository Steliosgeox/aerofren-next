import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("catalog SEO routes", () => {
  it("renders real category and subcategory pages instead of redirecting", () => {
    const categoryRoute = readSource("src/app/(main)/products/[category]/page.tsx");
    const subcategoryRoute = readSource(
      "src/app/(main)/products/[category]/[subcategory]/page.tsx",
    );

    expect(categoryRoute).toContain("getCategoryStaticParams");
    expect(subcategoryRoute).toContain("getSubcategoryStaticParams");
    expect(categoryRoute).not.toContain('permanentRedirect("/products")');
    expect(subcategoryRoute).not.toContain('permanentRedirect("/products")');
    expect(categoryRoute).toContain("ItemListSchema");
    expect(subcategoryRoute).toContain("FaqSchema");
  });
});
