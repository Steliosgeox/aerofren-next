import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MouseEvent, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { trackLeadEvent } from "@/lib/analytics";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    className,
  }: {
    children: ReactNode;
    href: string;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

describe("lead analytics helpers", () => {
  afterEach(() => {
    delete window.gtag;
  });

  it("forwards explicit lead events to gtag when available", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackLeadEvent("phone_click", {
      location: "footer_contact",
      page_type: "global",
    });

    expect(gtag).toHaveBeenCalledWith("event", "phone_click", {
      location: "footer_contact",
      page_type: "global",
    });
  });

  it("emits tracked-link clicks with the expected payload", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    render(
      <TrackedLink
        eventName="category_cta_click"
        eventParams={{
          location: "horizontal_gallery",
          page_type: "home",
          category_slug: "push-in-fittings",
        }}
        href="/products/push-in-fittings"
      >
        Κατηγορία
      </TrackedLink>,
    );

    await userEvent.click(screen.getByRole("link", { name: "Κατηγορία" }));

    expect(gtag).toHaveBeenCalledWith("event", "category_cta_click", {
      location: "horizontal_gallery",
      page_type: "home",
      category_slug: "push-in-fittings",
    });
  });
});
