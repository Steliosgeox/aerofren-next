import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HorizontalGallery from "@/components/HorizontalGallery";
import {
  getProductShowcaseCount,
  productShowcaseNavigationItems,
} from "@/data/product-showcase";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    fill,
    src,
    ...props
  }: {
    alt: string;
    fill?: boolean;
    src: string;
    [key: string]: unknown;
  }) => {
    void fill;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={src} {...props} />;
  },
}));

describe("HorizontalGallery", () => {
  it("renders the restored showcase strip and CTA card", () => {
    render(<HorizontalGallery />);

    expect(screen.getByText("Κατάλογος Προϊόντων")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /εξαρτήματα υψηλών προδιαγραφών/i,
      }),
    ).toBeInTheDocument();

    for (const item of productShowcaseNavigationItems) {
      expect(screen.getByAltText(item.nameEl).closest("a")).toHaveAttribute(
        "href",
        item.href,
      );
    }

    expect(
      screen.getByRole("link", { name: /δείτε τον κατάλογο/i }),
    ).toHaveAttribute("href", "/products");
    expect(
      screen.getByText(String(getProductShowcaseCount())),
    ).toBeInTheDocument();
    expect(screen.getByText("Κατηγορίες Προϊόντων")).toBeInTheDocument();
  });
});
