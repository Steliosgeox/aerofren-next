import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  openChatMock,
  selectSessionMock,
  usePathnameMock,
  useSearchParamsMock,
} = vi.hoisted(() => ({
  openChatMock: vi.fn(),
  selectSessionMock: vi.fn(),
  usePathnameMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: (() => {
    let dynamicIndex = 0;

    return () => {
      const ids = ["scroll-frame", "chatbot-widget", "back-to-top"];
      const testId = ids[dynamicIndex] ?? `dynamic-${dynamicIndex}`;
      dynamicIndex += 1;

      return function DynamicComponent() {
        return <div data-testid={testId} />;
      };
    };
  })(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/contexts/ChatContext", () => ({
  useChat: () => ({
    openChat: openChatMock,
    selectSession: selectSessionMock,
  }),
}));

describe("RouteEffects", () => {
  beforeEach(() => {
    openChatMock.mockReset();
    selectSessionMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens deep-linked chats without overwriting the persisted session and keeps the widget visible on other front-office pages", async () => {
    const { RouteEffects } = await import("@/components/RouteEffects");

    usePathnameMock.mockReturnValue("/about");
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("chat=open&session=external-session"),
    );

    render(<RouteEffects />);

    expect(openChatMock).toHaveBeenCalledTimes(1);
    expect(selectSessionMock).toHaveBeenCalledWith("external-session", {
      persist: false,
    });
    expect(screen.getByTestId("chatbot-widget")).toBeInTheDocument();
    expect(screen.queryByTestId("scroll-frame")).not.toBeInTheDocument();
    expect(screen.queryByTestId("back-to-top")).not.toBeInTheDocument();
  });
});
