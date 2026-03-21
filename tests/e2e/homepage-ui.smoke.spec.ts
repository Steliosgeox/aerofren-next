import { test, expect } from "@playwright/test";
import {
  captureFrontendErrors,
  dismissCookieBanner,
  expectNoFrontendErrors,
  expectNoHorizontalOverflow,
} from "./helpers";

test.describe("homepage smoke", () => {
  test("desktop hero clears the fixed header and keeps mobile chrome hidden", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop");
    test.setTimeout(45_000);

    const errors = captureFrontendErrors(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const header = page.getByTestId("site-header");
    const hero = page.getByTestId("homepage-hero");
    const title = page.getByRole("heading", { level: 1 }).first();
    const primaryCta = page.getByTestId("homepage-primary-cta");
    const mobileNav = page.getByLabel("Mobile primary navigation");
    const heroCanvas = hero.locator(".nexus-hero__canvas").first();

    await expect(header).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(title).toBeVisible();
    await dismissCookieBanner(page);
    await expect(primaryCta).toBeVisible();
    await expect(heroCanvas).toBeVisible();
    await page.waitForTimeout(250);
    await expect(mobileNav).toBeHidden();

    const geometry = await page.evaluate(() => {
      const headerEl = document.querySelector('[data-testid="site-header"]');
      const titleEl = document.querySelector("h1");
      const ctaEl = document.querySelector('[data-testid="homepage-primary-cta"]');
      const liquidEl = ctaEl?.querySelector(".liquid");

      if (!headerEl || !titleEl || !ctaEl || !liquidEl) {
        return null;
      }

      const headerRect = headerEl.getBoundingClientRect();
      const titleRect = titleEl.getBoundingClientRect();
      const ctaRect = ctaEl.getBoundingClientRect();
      const liquidRect = liquidEl.getBoundingClientRect();

      return {
        headerBottom: headerRect.bottom,
        titleTop: titleRect.top,
        titleBottom: titleRect.bottom,
        ctaTop: ctaRect.top,
        ctaWidth: ctaRect.width,
        ctaHeight: ctaRect.height,
        titleFontSize: parseFloat(window.getComputedStyle(titleEl).fontSize),
        liquidWidth: liquidRect.width,
        liquidHeight: liquidRect.height,
        liquidFilter: window.getComputedStyle(liquidEl).filter,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry!.titleTop).toBeGreaterThanOrEqual(geometry!.headerBottom - 4);
    expect(geometry!.ctaTop).toBeGreaterThan(geometry!.titleBottom - 8);
    expect(geometry!.ctaWidth).toBeGreaterThanOrEqual(140);
    expect(geometry!.ctaHeight).toBeGreaterThanOrEqual(50);
    expect(geometry!.titleFontSize).toBeLessThanOrEqual(72);
    expect(geometry!.liquidWidth).toBeGreaterThanOrEqual(150);
    expect(geometry!.liquidHeight).toBeGreaterThanOrEqual(150);
    expect(geometry!.liquidFilter).not.toBe("none");

    await expectNoHorizontalOverflow(page);
    await expectNoFrontendErrors(errors);
  });

  test("mobile homepage keeps the hero readable and exposes the mobile dock", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-mobile");
    test.setTimeout(45_000);

    const errors = captureFrontendErrors(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const hero = page.getByTestId("homepage-hero");
    const title = page.getByRole("heading", { level: 1 }).first();
    const primaryCta = page.getByTestId("homepage-primary-cta");
    const mobileNav = page.getByLabel("Mobile primary navigation");
    const heroCanvas = hero.locator(".nexus-hero__canvas").first();

    await expect(hero).toBeVisible();
    await expect(title).toBeVisible();
    await dismissCookieBanner(page);
    await expect(primaryCta).toBeVisible();
    await expect(heroCanvas).toBeVisible();
    await page.waitForTimeout(250);
    await expect(mobileNav).toBeVisible();

    const metrics = await page.evaluate(() => {
      const headerEl = document.querySelector('[data-testid="site-header"]');
      const titleEl = document.querySelector("h1");
      const ctaEl = document.querySelector('[data-testid="homepage-primary-cta"]');
      const liquidEl = ctaEl?.querySelector(".liquid");

      if (!headerEl || !titleEl || !ctaEl || !liquidEl) {
        return null;
      }

      const headerRect = headerEl.getBoundingClientRect();
      const titleRect = titleEl.getBoundingClientRect();
      const ctaRect = ctaEl.getBoundingClientRect();
      const liquidRect = liquidEl.getBoundingClientRect();

      return {
        headerBottom: headerRect.bottom,
        titleTop: titleRect.top,
        titleBottom: titleRect.bottom,
        titleFontSize: parseFloat(window.getComputedStyle(titleEl).fontSize),
        ctaTop: ctaRect.top,
        ctaWidth: ctaRect.width,
        ctaHeight: ctaRect.height,
        liquidWidth: liquidRect.width,
        liquidHeight: liquidRect.height,
        liquidFilter: window.getComputedStyle(liquidEl).filter,
      };
    });
    expect(metrics).not.toBeNull();
    expect(metrics!.titleTop).toBeGreaterThanOrEqual(metrics!.headerBottom - 4);
    expect(metrics!.titleFontSize).toBeLessThanOrEqual(44);
    expect(metrics!.ctaTop).toBeGreaterThan(metrics!.titleBottom - 8);
    expect(metrics!.ctaWidth).toBeGreaterThanOrEqual(140);
    expect(metrics!.ctaHeight).toBeGreaterThanOrEqual(50);
    expect(metrics!.liquidWidth).toBeGreaterThanOrEqual(140);
    expect(metrics!.liquidHeight).toBeGreaterThanOrEqual(140);
    expect(metrics!.liquidFilter).not.toBe("none");

    await expectNoHorizontalOverflow(page);
    await expectNoFrontendErrors(errors);
  });
});
