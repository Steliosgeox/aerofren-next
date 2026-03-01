import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("react-doctor targeted regressions", () => {
  it("keeps LiquidGlassSwitcher as a single theme writer", () => {
    const source = readSource("src/components/LiquidGlassSwitcher.tsx");
    expect(source).not.toMatch(
      /document\.documentElement\.setAttribute\(\s*["']data-theme["']/,
    );
  });

  it("avoids mount-only setState in AuthContext", () => {
    const source = readSource("src/contexts/AuthContext.tsx");
    expect(source).not.toMatch(/setMounted\(true\)/);
  });

  it("does not use index keys in known flagged files", () => {
    const files = [
      "src/app/(main)/products/loading.tsx",
      "src/app/(main)/products/[category]/loading.tsx",
      "src/app/(main)/admin/page.tsx",
      "src/components/ui/AmbientParticles.tsx",
      "src/app/(main)/resources/[guide]/page.tsx",
    ];

    const indexKeyPattern = /key=\{(?:index|lineIndex|i)\}/;

    for (const file of files) {
      const source = readSource(file);
      expect(source).not.toMatch(indexKeyPattern);
    }
  });

  it("uses next/image in components flagged for raw img", () => {
    const files = [
      "src/components/AboutHistoryGrid.tsx",
      "src/components/ScrollAnimation.tsx",
    ];

    for (const file of files) {
      const source = readSource(file);
      expect(source).not.toMatch(/<img\s/);
    }
  });
});
