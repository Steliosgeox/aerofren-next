import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatEscalationStatus } from "@/lib/chat/types";

const { gsapToMock, useChatMock } = vi.hoisted(() => ({
  gsapToMock: vi.fn(),
  useChatMock: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicComponent({ children }: { children?: ReactNode }) {
      return <>{children ?? null}</>;
    },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    onClick,
  }: {
    children?: ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("@/contexts/ChatContext", () => ({
  useChat: () => useChatMock(),
}));

vi.mock("@/lib/gsap/client", () => ({
  gsap: {
    to: gsapToMock,
  },
}));

function createChatState(overrides?: Partial<ReturnType<typeof baseChatState>>) {
  return {
    ...baseChatState(),
    ...overrides,
  };
}

type MockEscalationUiStatus = "idle" | "loading" | "success" | "error";

function baseChatState() {
  return {
    closeChat: vi.fn(),
    escalateToHuman: vi.fn().mockResolvedValue("success"),
    escalationErrorMessage: null as string | null,
    escalationStatus: "idle" as MockEscalationUiStatus,
    hasUnreadSupportReply: false,
    isHydrating: false,
    isLoading: false,
    isOpen: true,
    messages: [] as Array<{
      id: string;
      role: "assistant" | "user" | "admin" | "system";
      content: string;
      senderLabel?: string;
      timestamp?: string;
    }>,
    openChat: vi.fn(),
    sendMessage: vi.fn(),
    supportStatus: "idle" as ChatEscalationStatus | "idle",
  };
}

describe("Chatbot behavior", () => {
  beforeEach(() => {
    gsapToMock.mockReset();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders hydration feedback for an existing conversation instead of dead code", async () => {
    const { Chatbot } = await import("@/components/Chatbot");

    useChatMock.mockReturnValue(
      createChatState({
        isHydrating: true,
        messages: [
          {
            id: "m1",
            role: "assistant",
            content: "Καλησπέρα",
          },
        ],
      }),
    );

    const { container } = render(<Chatbot />);

    expect(container.querySelectorAll(".chatbot__message--ai-loading")).toHaveLength(1);
  });

  it("scrolls to the latest message when the widget reopens with an existing thread", async () => {
    const { Chatbot } = await import("@/components/Chatbot");

    let chatState = createChatState({
      isOpen: false,
      messages: [
        {
          id: "m1",
          role: "assistant",
          content: "Νέα απάντηση",
        },
      ],
    });

    useChatMock.mockImplementation(() => chatState);

    const { rerender } = render(<Chatbot />);

    chatState = createChatState({
      isOpen: true,
      messages: [
        {
          id: "m1",
          role: "assistant",
          content: "Νέα απάντηση",
        },
      ],
    });

    rerender(<Chatbot />);

    expect(gsapToMock).toHaveBeenCalledTimes(1);
  });

  it("uses a dialog div instead of a second main landmark", async () => {
    const { Chatbot } = await import("@/components/Chatbot");

    useChatMock.mockReturnValue(
      createChatState({
        messages: [
          {
            id: "m1",
            role: "assistant",
            content: "Καλησπέρα",
          },
        ],
      }),
    );

    render(
      <main>
        <Chatbot />
      </main>,
    );

    const dialog = screen.getByRole("dialog", { name: "Βοηθός AEROFREN" });

    expect(dialog.tagName).toBe("DIV");
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("uses chat unread state for the closed toggle and removes the dead globe action", async () => {
    const { Chatbot } = await import("@/components/Chatbot");

    useChatMock.mockReturnValue(
      createChatState({
        hasUnreadSupportReply: true,
        isOpen: false,
      }),
    );

    render(<Chatbot />);

    expect(
      screen.getByRole("button", {
        name: "Άνοιγμα συνομιλίας, νέα απάντηση διαθέσιμη",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("!")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Globe" })).not.toBeInTheDocument();
  });

  it("renders support escalation feedback as widget chrome instead of a thread message", async () => {
    const { Chatbot } = await import("@/components/Chatbot");

    useChatMock.mockReturnValue(
      createChatState({
        supportStatus: "pending",
      }),
    );

    const { container } = render(<Chatbot />);

    const supportCard = container.querySelector(".chatbot__support-cta");

    expect(supportCard).toHaveTextContent("Το αίτημά σας καταχωρήθηκε.");
    expect(supportCard).toHaveTextContent(
      "Ένας εκπρόσωπός μας θα επικοινωνήσει σύντομα. Εναλλακτικά, καλέστε μας στο 210 3461645.",
    );
    expect(container.querySelector(".chatbot__message--system")).not.toBeInTheDocument();
  });

  it("renders day separators when the thread spans multiple dates", async () => {
    const { Chatbot } = await import("@/components/Chatbot");

    useChatMock.mockReturnValue(
      createChatState({
        messages: [
          {
            id: "m1",
            role: "assistant",
            content: "Καλημέρα",
            senderLabel: "Βοηθός AEROFREN",
            timestamp: "2026-03-10T08:30:00.000Z",
          },
          {
            id: "m2",
            role: "admin",
            content: "Αναλαμβάνει η υποστήριξη.",
            senderLabel: "Ομάδα AEROFREN",
            timestamp: "2026-03-11T09:00:00.000Z",
          },
        ],
      }),
    );

    const { container } = render(<Chatbot />);

    expect(container.querySelectorAll(".chatbot__timeline-separator")).toHaveLength(2);
  });

  it("shows an inline support gate instead of a login modal when escalation requires auth", async () => {
    const { Chatbot } = await import("@/components/Chatbot");

    const escalateToHuman = vi.fn().mockResolvedValue("requires_auth");
    useChatMock.mockReturnValue(
      createChatState({
        escalateToHuman,
      }),
    );

    const { container } = render(<Chatbot />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Μιλήστε με εκπρόσωπο",
        }),
      );
    });

    expect(escalateToHuman).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Απαιτείται σύνδεση")).toBeInTheDocument();
    expect(screen.getByText("Συνέχεια με AI")).toBeInTheDocument();
    expect(container.querySelector(".chatbot__login-modal")).not.toBeInTheDocument();
  });
});
