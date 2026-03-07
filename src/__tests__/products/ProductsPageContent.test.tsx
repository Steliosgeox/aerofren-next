import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProductsPageContent } from "@/components/catalog/ProductsPageContent";

describe("ProductsPageContent", () => {
  it("renders the new public product showcase instead of a category grid", () => {
    render(<ProductsPageContent />);

    expect(
      screen.getByRole("heading", {
        name: /προϊόντα για δίκτυα αέρα & νερού/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/κατηγορίες/i)).not.toBeInTheDocument();
  });

  it("opens the selected product inside the detail rail", async () => {
    render(<ProductsPageContent />);

    await userEvent.click(
      screen.getByRole("button", { name: "ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ" }),
    );

    const rail = screen.getByRole("dialog");
    expect(within(rail).getByText("ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ")).toBeInTheDocument();
    expect(
      within(rail).getByText(/δημιουργία λογαριασμού/i),
    ).toBeInTheDocument();
    expect(
      within(rail).getByText(/η ομάδα μας σας εξυπηρετεί άμεσα/i),
    ).toBeInTheDocument();
  });
});
