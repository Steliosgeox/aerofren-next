import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HorizontalGallery from "@/components/HorizontalGallery";
import { catalogCategories } from "@/data/catalog-taxonomy";

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
  it("renders canonical category links and the CTA card", () => {
    render(<HorizontalGallery />);

    for (const item of catalogCategories) {
      expect(screen.getByAltText(item.nameEl).closest("a")).toHaveAttribute(
        "href",
        `/products/${item.slug}`,
      );
    }

    expect(screen.getByText(String(catalogCategories.length))).toBeInTheDocument();
    expect(screen.getByText("SEO Κατηγορίες")).toBeInTheDocument();
    expect(screen.getByText("Δείτε τον κατάλογο")).toBeInTheDocument();
  });
});
