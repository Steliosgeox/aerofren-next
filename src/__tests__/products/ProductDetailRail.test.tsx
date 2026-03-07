import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProductDetailRail } from "@/components/catalog/ProductDetailRail";
import { productShowcaseItems } from "@/data/product-showcase";

describe("ProductDetailRail", () => {
  it("returns null when closed", () => {
    const { container } = render(
      <ProductDetailRail
        isOpen={false}
        onClose={vi.fn()}
        product={productShowcaseItems[0]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the selected product consultation flow in Greek", () => {
    render(
      <ProductDetailRail
        isOpen
        onClose={vi.fn()}
        product={productShowcaseItems[5]}
      />,
    );

    expect(screen.getByText("ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ")).toBeInTheDocument();
    expect(document.body.dataset.productWindowOpen).toBe("true");
    expect(screen.getByText(/παράθυρο προϊόντος/i)).toBeInTheDocument();
    expect(screen.queryByText(/product consultation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/επιλεγμένο προϊόν/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/θορυβώδες background/i)).not.toBeInTheDocument();
    expect(screen.getByText(/δημιουργία λογαριασμού/i)).toBeInTheDocument();
    expect(screen.getAllByText(/chat/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /κλήση/i })).toHaveAttribute(
      "href",
      "tel:2103461645",
    );
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:info@aerofren.gr",
    );
  });

  it("closes when the close button is pressed", async () => {
    const onClose = vi.fn();
    render(
      <ProductDetailRail
        isOpen
        onClose={onClose}
        product={productShowcaseItems[0]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^κλείσιμο$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
