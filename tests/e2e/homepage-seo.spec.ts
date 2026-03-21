import { test, expect } from "@playwright/test";

const HERO_COPY = "B2B προμηθευτής για εξαρτήματα νερού, φίλτρα και πνευματικά συστήματα";

test("homepage server html stays crawlable and exposes primary metadata", async ({ request }) => {
  const response = await request.get("/");

  expect(response.ok()).toBeTruthy();

  const html = await response.text();

  expect(html).not.toContain("BAILOUT_TO_CLIENT_SIDE_RENDERING");
  expect(html).toContain('data-testid="homepage-hero"');
  expect(html).toContain(HERO_COPY);
  expect(html).toContain("<title>AEROFREN | B2B Προμηθευτής για Εξαρτήματα Νερού, Φίλτρα &amp; Πνευματικά</title>");
  expect(html).toContain('name="description" content="AEROFREN: B2B προμηθευτής για εξαρτήματα νερού, φίλτρα, ρακόρ και πνευματικά. Από το 1980, 10.000+ προϊόντα. Μοσχάτο, Αθήνα."');
  expect(html).toContain('rel="canonical" href="https://aerofren.gr"');
  expect(html).toContain("data-nosnippet");
});
