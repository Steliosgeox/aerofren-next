import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useNotificationsMock } = vi.hoisted(() => ({
  useNotificationsMock: vi.fn(),
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

vi.mock("@/contexts/NotificationContext", () => ({
  useNotifications: () => useNotificationsMock(),
}));

function createNotificationState(overrides?: Partial<ReturnType<typeof baseNotificationState>>) {
  return {
    ...baseNotificationState(),
    ...overrides,
  };
}

function baseNotificationState() {
  return {
    notifications: [] as Array<{
      id: string;
      type: "escalation" | "contact" | "chat_reply";
      title: string;
      body: string;
      timestamp: Date;
      href: string;
      isRead: boolean;
    }>,
    unreadCount: 0,
    canMarkAllRead: false,
    markAllRead: vi.fn(),
    markRead: vi.fn(),
  };
}

describe("NotificationBell behavior", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("hides mark-all-read when the only unread item is a chat reply", async () => {
    const { NotificationBell } = await import("@/components/NotificationBell");

    useNotificationsMock.mockReturnValue(
      createNotificationState({
        unreadCount: 1,
        notifications: [
          {
            id: "chat:session-1:123",
            type: "chat_reply",
            title: "Νέα απάντηση υποστήριξης",
            body: "Έχουμε νέα απάντηση για τη συνομιλία σας.",
            timestamp: new Date("2026-03-13T10:00:00.000Z"),
            href: "/?chat=open&session=session-1",
            isRead: false,
          },
        ],
      }),
    );

    render(<NotificationBell />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ειδοποιήσεις (1 αδιάβαστες)",
      }),
    );

    expect(screen.queryByTitle("Σήμανση όλων ως διαβασμένα")).not.toBeInTheDocument();
  });

  it("shows mark-all-read for dismissible admin notifications", async () => {
    const { NotificationBell } = await import("@/components/NotificationBell");

    const markAllRead = vi.fn();
    useNotificationsMock.mockReturnValue(
      createNotificationState({
        unreadCount: 2,
        canMarkAllRead: true,
        markAllRead,
        notifications: [
          {
            id: "esc:1",
            type: "escalation",
            title: "Νέα συνομιλία για απάντηση",
            body: "Ο πελάτης περιμένει απάντηση",
            timestamp: new Date("2026-03-13T10:00:00.000Z"),
            href: "/admin/chats?session=1",
            isRead: false,
          },
        ],
      }),
    );

    render(<NotificationBell />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ειδοποιήσεις (2 αδιάβαστες)",
      }),
    );

    fireEvent.click(screen.getByTitle("Σήμανση όλων ως διαβασμένα"));

    expect(markAllRead).toHaveBeenCalledTimes(1);
  });
});
