import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  RouteScrollShell,
  shouldDisableSmoothScroll,
  shouldUseLightweightLenis,
} from "@/components/RouteScrollShell";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("@/components/LenisProvider", () => ({
  default: ({
    children,
    syncWithGsap = true,
  }: {
    children: ReactNode;
    syncWithGsap?: boolean;
  }) => (
    <div data-testid="lenis-provider" data-sync-with-gsap={String(syncWithGsap)}>
      {children}
    </div>
  ),
}));

describe("RouteScrollShell", () => {
  afterEach(() => {
    cleanup();
    usePathnameMock.mockReset();
  });

  it("uses the lightweight Lenis path for the contact page", () => {
    usePathnameMock.mockReturnValue("/contact");

    render(
      <RouteScrollShell>
        <span>content</span>
      </RouteScrollShell>,
    );

    expect(screen.getByTestId("lenis-provider")).toHaveAttribute("data-sync-with-gsap", "false");
  });

  it("keeps the GSAP-synced Lenis path for animation-heavy public routes", () => {
    usePathnameMock.mockReturnValue("/products");

    render(
      <RouteScrollShell>
        <span>content</span>
      </RouteScrollShell>,
    );

    expect(screen.getByTestId("lenis-provider")).toHaveAttribute("data-sync-with-gsap", "true");
  });

  it("exposes the route guards as pure helpers", () => {
    expect(shouldDisableSmoothScroll("/admin")).toBe(true);
    expect(shouldDisableSmoothScroll("/contact")).toBe(false);
    expect(shouldUseLightweightLenis("/contact")).toBe(true);
    expect(shouldUseLightweightLenis("/about")).toBe(false);
  });
});
