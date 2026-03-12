import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const sourceRoots = [
  "src/app",
  "src/components",
  "src/data",
  "src/lib",
  "docs/plans/2026-02-27-seo-optimization.md",
  "docs/plans/2026-02-27-seo-refactor-audit.md",
  "docs/plans/2026-03-01-gsap-scrollsmoother-to-lenis.md",
];

const bannedYear = `19${90}`;
const bannedOpenHour = ["08", "00"].join(":");
const bannedCloseHour = ["16", "00"].join(":");
const bannedExperienceShort = `3${5}+`;
const bannedExperienceLong = `4${5}+`;
const bannedProductCount = "120." + "000+";

const bannedPatterns = [
  new RegExp(`\\b${bannedYear}\\b`),
  new RegExp(`\\b${bannedOpenHour}\\b`),
  new RegExp(`\\b${bannedCloseHour}\\b`),
  new RegExp(bannedExperienceShort.replace("+", "\\+")),
  new RegExp(bannedExperienceLong.replace("+", "\\+")),
  new RegExp(bannedProductCount.replace(".", "\\.").replace("+", "\\+")),
];

function collectFiles(relativePath: string): string[] {
  const absolutePath = path.join(projectRoot, relativePath);
  const stats = statSync(absolutePath);

  if (stats.isFile()) {
    return [relativePath];
  }

  return readdirSync(absolutePath).flatMap((entry) =>
    collectFiles(path.join(relativePath, entry)),
  );
}

describe("business facts consistency", () => {
  it("removes banned founding-year, hours, and count drift from source and active docs", () => {
    const files = sourceRoots.flatMap(collectFiles);
    const offenders = files.flatMap((file) => {
      const source = readFileSync(path.join(projectRoot, file), "utf8");
      return bannedPatterns
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${file} -> ${pattern}`);
    });

    expect(offenders).toEqual([]);
  });

  it("keeps the canonical constants in the shared business facts module", () => {
    const constants = readFileSync(
      path.join(projectRoot, "src/lib/constants/aerofren.ts"),
      "utf8",
    );

    expect(constants).toContain('export const FOUNDING_YEAR = 1980;');
    expect(constants).toContain('export const BUSINESS_HOURS_TEXT_EL = `${BUSINESS_HOURS_OPEN} - ${BUSINESS_HOURS_CLOSE}`;');
    expect(constants).toContain('export const PRODUCT_COUNT = "10.000+";');
  });
});
