import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("legacy products routing", () => {
  it("redirects old category and subcategory routes back to /products", () => {
    const categoryRoute = readSource("src/app/(main)/products/[category]/page.tsx");
    const subcategoryRoute = readSource(
      "src/app/(main)/products/[category]/[subcategory]/page.tsx",
    );

    expect(categoryRoute).toContain('permanentRedirect("/products")');
    expect(subcategoryRoute).toContain('permanentRedirect("/products")');
    expect(categoryRoute).not.toContain('from "@/data/categories"');
    expect(subcategoryRoute).not.toContain('from "@/data/categories"');
  });

  it("keeps only the canonical /products entry in the sitemap", () => {
    const sitemap = readSource("src/app/sitemap.ts");

    expect(sitemap).not.toContain('from "@/data/categories"');
    expect(sitemap).not.toContain("/products/${cat.slug}");
    expect(sitemap).not.toContain("/products/${cat.slug}/${sub.slug}");
    expect(sitemap).toContain("`${baseUrl}/products`");
  });
});
