import { test, expect } from "@playwright/test";
import {
  captureFrontendErrors,
  dismissCookieBanner,
  expectNoFrontendErrors,
  expectNoHorizontalOverflow,
} from "./helpers";

const ROUTE_EXPECTATIONS = [
  {
    path: "/products",
    titlePattern: /Προϊόντα για Δίκτυα Αέρα & Νερού/i,
    headingPattern: /Προϊόντα για Δίκτυα Αέρα/i,
  },
  {
    path: "/about",
    titlePattern: /Η Ιστορία μας/i,
    headingPattern: /Η ιστορία μας/i,
  },
  {
    path: "/contact",
    titlePattern: /Επικοινωνία/i,
    headingPattern: /ΕΠΙΚΟΙΝΩΝΗΣΤΕ ΜΑΖΙ ΜΑΣ|Επικοινωνία/i,
  },
];

test.describe("route smoke", () => {
  for (const route of ROUTE_EXPECTATIONS) {
    test(`${route.path} renders without frontend errors`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium");

      const errors = captureFrontendErrors(page);

      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await dismissCookieBanner(page);

      await expect(page).toHaveTitle(route.titlePattern);
      await expect(page.getByRole("heading", { name: route.headingPattern }).first()).toBeVisible();
      await expect(page.getByTestId("site-header")).toBeVisible();

      await expectNoHorizontalOverflow(page);
      await expectNoFrontendErrors(errors);
    });
  }

  test("homepage CTA reaches products and the desktop header exposes the contact route", async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== "chromium");
    test.skip(testInfo.project.name !== "chromium-desktop");
    test.setTimeout(45_000);

    const errors = captureFrontendErrors(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissCookieBanner(page);
    const hero = page.getByTestId("homepage-hero");
    const productsCta = hero.getByRole("link", { name: "Δείτε τα προϊόντα" }).first();

    await expect(productsCta).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/products$/, { timeout: 15_000 }),
      productsCta.click(),
    ]);
    await expect(page.getByRole("heading", { name: /Προϊόντα για Δίκτυα Αέρα/i }).first()).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissCookieBanner(page);
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Επικοινωνία" }),
    ).toHaveAttribute("href", "/contact");

    await expectNoFrontendErrors(errors);
  });
});
