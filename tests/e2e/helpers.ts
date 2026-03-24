import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const IGNORED_CONSOLE_ERRORS = [
  "Failed to load resource: the server responded with a status of 404",
];

export function captureFrontendErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();
    if (IGNORED_CONSOLE_ERRORS.some((pattern) => text.includes(pattern))) {
      return;
    }

    errors.push(`console: ${text}`);
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    const url = request.url();
    const errorText = failure?.errorText ?? "unknown";

    if (url.startsWith("chrome-error://")) {
      return;
    }

    if (
      errorText.includes("ERR_ABORTED") &&
      (url.includes("_rsc=") || url.includes("/_next/image?") || url.endsWith(".webm"))
    ) {
      return;
    }

    errors.push(`requestfailed: ${request.method()} ${url} ${errorText}`);
  });

  return errors;
}

export async function dismissCookieBanner(page: Page) {
  const acceptAllButton = page.getByRole("button", { name: "Αποδοχή όλων" });

  const bannerAppeared = await acceptAllButton
    .waitFor({ state: "visible", timeout: 4_000 })
    .then(() => true)
    .catch(() => false);

  if (bannerAppeared) {
    await acceptAllButton.click();
    await expect(acceptAllButton).toBeHidden();
  }
}

export async function expectNoHorizontalOverflow(page: Page) {
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
}

export async function expectNoFrontendErrors(errors: string[]) {
  expect(errors).toEqual([]);
}
