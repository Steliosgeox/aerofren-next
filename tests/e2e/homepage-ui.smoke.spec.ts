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
      const eyebrowEl = document.querySelector(".nexus-hero__eyebrow");
      const ctaEl = document.querySelector('[data-testid="homepage-primary-cta"]');
      const liquidEl = ctaEl?.querySelector(".liquid");
      const labelEl = ctaEl?.querySelector(".button__label");

      if (!headerEl || !titleEl || !eyebrowEl || !ctaEl || !liquidEl || !labelEl) {
        return null;
      }

      const headerRect = headerEl.getBoundingClientRect();
      const titleRect = titleEl.getBoundingClientRect();
      const eyebrowRect = eyebrowEl.getBoundingClientRect();
      const ctaRect = ctaEl.getBoundingClientRect();
      const liquidRect = liquidEl.getBoundingClientRect();
      const labelRect = labelEl.getBoundingClientRect();

      return {
        headerBottom: headerRect.bottom,
        titleTop: titleRect.top,
        titleBottom: titleRect.bottom,
        ctaTop: ctaRect.top,
        ctaWidth: ctaRect.width,
        ctaHeight: ctaRect.height,
        titleFontSize: parseFloat(window.getComputedStyle(titleEl).fontSize),
        eyebrowTop: eyebrowRect.top,
        eyebrowWidth: eyebrowRect.width,
        eyebrowFontSize: parseFloat(window.getComputedStyle(eyebrowEl).fontSize),
        liquidWidth: liquidRect.width,
        liquidHeight: liquidRect.height,
        liquidFilter: window.getComputedStyle(liquidEl).filter,
        labelDeltaX: Math.abs((labelRect.left + labelRect.width / 2) - (ctaRect.left + ctaRect.width / 2)),
        labelDeltaY: Math.abs((labelRect.top + labelRect.height / 2) - (ctaRect.top + ctaRect.height / 2)),
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry!.eyebrowTop).toBeGreaterThanOrEqual(geometry!.headerBottom - 4);
    expect(geometry!.eyebrowWidth).toBeGreaterThanOrEqual(420);
    expect(geometry!.eyebrowFontSize).toBeGreaterThanOrEqual(17);
    expect(geometry!.titleTop).toBeGreaterThanOrEqual(geometry!.headerBottom - 4);
    expect(geometry!.ctaTop).toBeGreaterThan(geometry!.titleBottom - 8);
    expect(geometry!.ctaWidth).toBeGreaterThanOrEqual(140);
    expect(geometry!.ctaHeight).toBeGreaterThanOrEqual(50);
    expect(geometry!.titleFontSize).toBeLessThanOrEqual(72);
    expect(geometry!.liquidWidth).toBeGreaterThanOrEqual(150);
    expect(geometry!.liquidHeight).toBeGreaterThanOrEqual(150);
    expect(geometry!.liquidFilter).not.toBe("none");
    expect(geometry!.labelDeltaX).toBeLessThanOrEqual(2);
    expect(geometry!.labelDeltaY).toBeLessThanOrEqual(2);

    await expectNoHorizontalOverflow(page);
    await expectNoFrontendErrors(errors);
  });

  test("desktop hero eyebrow stays legible on large viewports", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop");
    test.setTimeout(45_000);

    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const eyebrow = page.locator(".nexus-hero__eyebrow").first();
    const primaryCta = page.getByTestId("homepage-primary-cta");

    await dismissCookieBanner(page);
    await expect(eyebrow).toBeVisible();
    await expect(primaryCta).toBeVisible();

    const metrics = await page.evaluate(() => {
      const eyebrowEl = document.querySelector(".nexus-hero__eyebrow");
      const ctaEl = document.querySelector('[data-testid="homepage-primary-cta"]');

      if (!eyebrowEl || !ctaEl) {
        return null;
      }

      const eyebrowRect = eyebrowEl.getBoundingClientRect();
      const ctaRect = ctaEl.getBoundingClientRect();

      return {
        viewportWidth: window.innerWidth,
        eyebrowWidth: eyebrowRect.width,
        eyebrowFontSize: parseFloat(window.getComputedStyle(eyebrowEl).fontSize),
        eyebrowOpacity: parseFloat(window.getComputedStyle(eyebrowEl).opacity || "1"),
        ctaTop: ctaRect.top,
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics!.viewportWidth).toBe(2560);
    expect(metrics!.eyebrowWidth).toBeGreaterThanOrEqual(560);
    expect(metrics!.eyebrowFontSize).toBeGreaterThanOrEqual(21);
    expect(metrics!.eyebrowOpacity).toBeGreaterThanOrEqual(0.9);
    expect(metrics!.ctaTop).toBeGreaterThan(0);
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
      const labelEl = ctaEl?.querySelector(".button__label");
      const navEl = document.querySelector('[data-testid="mobile-bottom-nav"]');
      const navItems = Array.from(document.querySelectorAll(".mobile-bottom-nav__item"));

      if (!headerEl || !titleEl || !ctaEl || !liquidEl || !labelEl || !navEl || navItems.length === 0) {
        return null;
      }

      const headerRect = headerEl.getBoundingClientRect();
      const titleRect = titleEl.getBoundingClientRect();
      const ctaRect = ctaEl.getBoundingClientRect();
      const liquidRect = liquidEl.getBoundingClientRect();
      const labelRect = labelEl.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      const navItemCenterOffsets = navItems.map((item) => {
        const iconEl = item.querySelector(".mobile-bottom-nav__icon");
        const labelNode = item.querySelector(".mobile-bottom-nav__label");

        if (!iconEl || !labelNode) {
          return { icon: Number.POSITIVE_INFINITY, label: Number.POSITIVE_INFINITY };
        }

        const itemRect = item.getBoundingClientRect();
        const iconRect = iconEl.getBoundingClientRect();
        const labelRectValue = labelNode.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;

        return {
          icon: Math.abs((iconRect.left + iconRect.width / 2) - itemCenter),
          label: Math.abs((labelRectValue.left + labelRectValue.width / 2) - itemCenter),
        };
      });

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
        labelDeltaX: Math.abs((labelRect.left + labelRect.width / 2) - (ctaRect.left + ctaRect.width / 2)),
        labelDeltaY: Math.abs((labelRect.top + labelRect.height / 2) - (ctaRect.top + ctaRect.height / 2)),
        navCenterDelta: Math.abs((navRect.left + navRect.width / 2) - window.innerWidth / 2),
        maxNavIconCenterDelta: Math.max(...navItemCenterOffsets.map((item) => item.icon)),
        maxNavLabelCenterDelta: Math.max(...navItemCenterOffsets.map((item) => item.label)),
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
    expect(metrics!.labelDeltaX).toBeLessThanOrEqual(2);
    expect(metrics!.labelDeltaY).toBeLessThanOrEqual(2);
    expect(metrics!.navCenterDelta).toBeLessThanOrEqual(2);
    expect(metrics!.maxNavIconCenterDelta).toBeLessThanOrEqual(2);
    expect(metrics!.maxNavLabelCenterDelta).toBeLessThanOrEqual(2);

    await expectNoHorizontalOverflow(page);
    await expectNoFrontendErrors(errors);
  });
});
