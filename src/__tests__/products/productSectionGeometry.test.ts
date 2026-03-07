import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("product section geometry", () => {
  it("uses simple block panels instead of the old masonry-style layout", () => {
    const source = readSource("src/components/catalog/ProductsPageContent.tsx");

    expect(source).not.toContain("productTileClassByLayout");
    expect(source).not.toContain("row-span-2");
    expect(source).not.toContain('auto-rows-[minmax(18rem,auto)]');
  });
});
