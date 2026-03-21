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

      if (!headerEl || !titleEl || !ctaEl) {
        return null;
      }

      const headerRect = headerEl.getBoundingClientRect();
      const titleRect = titleEl.getBoundingClientRect();
      const ctaRect = ctaEl.getBoundingClientRect();

      return {
        headerBottom: headerRect.bottom,
        titleTop: titleRect.top,
        titleBottom: titleRect.bottom,
        ctaTop: ctaRect.top,
        ctaWidth: ctaRect.width,
        ctaHeight: ctaRect.height,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry!.titleTop).toBeGreaterThanOrEqual(geometry!.headerBottom - 4);
    expect(geometry!.ctaTop).toBeGreaterThan(geometry!.titleBottom - 8);
    expect(geometry!.ctaWidth).toBeGreaterThanOrEqual(140);
    expect(geometry!.ctaHeight).toBeGreaterThanOrEqual(50);

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

    const titleRect = await title.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
    const ctaMetrics = await primaryCta.evaluate((element) => {
      const rect = element.getBoundingClientRect();

      return {
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    });

    expect(titleRect.top).toBeGreaterThan(72);
    expect(ctaMetrics.top).toBeGreaterThan(titleRect.bottom - 8);
    expect(ctaMetrics.width).toBeGreaterThanOrEqual(140);
    expect(ctaMetrics.height).toBeGreaterThanOrEqual(50);

    await expectNoHorizontalOverflow(page);
    await expectNoFrontendErrors(errors);
  });
});
