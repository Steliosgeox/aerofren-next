/**
 * AEROFREN AI Chatbot Component
 * TWO-STATE LAYOUT:
 * 1. Welcome = Compact floating widget
 * 2. Conversation = Expanded conversation workspace
 */

"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import {
  ArrowRight,
  Headset,
  Globe,
  MessageCircle,
  X,
  Package,
  Phone,
  Mail,
  Sparkles,
  User,
  LogIn,
  CheckCircle,
  Shield,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { gsap } from "@/lib/gsap/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import {
  requestChatCompletion,
  requestEscalation,
  fetchChatHistoryPage,
  markChatSessionRead,
  type ChatHistoryMessage,
} from "@/services/chat";
import { HttpError } from "@/services/http";
import { useNotifications } from "@/contexts/NotificationContext";
import type { ChatEscalationStatus, ChatMessageRole } from "@/lib/chat/types";
import "./Chatbot.scss";

const ReactMarkdown = dynamic(
  () => import("react-markdown").then((mod) => mod.default),
  { ssr: false, loading: () => <span>...</span> }
);

interface Message {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp?: string;
  senderLabel?: string;
  optimistic?: boolean;
}

const STORAGE_KEY = "aerofren_chat_session";

type MarkdownComponents = {
  p: React.ComponentType<{ children?: React.ReactNode }>;
  ul: React.ComponentType<{ children?: React.ReactNode }>;
};

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function sanitizeLinkUri(uri: string): string {
  if (!uri) return "#";
  if (uri.startsWith("#")) return uri;
  if (uri.startsWith("/") && !uri.startsWith("//")) return uri;

  try {
    const parsed = new URL(uri);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? uri : "#";
  } catch {
    try {
      const parsed = new URL(uri, "https://aerofren.gr");
      return ALLOWED_PROTOCOLS.has(parsed.protocol) ? uri : "#";
    } catch {
      return "#";
    }
  }
}

const MarkdownParagraph = memo(function MarkdownParagraph({ children }: { children?: React.ReactNode }) {
  return <p className="chatbot__message-text">{children}</p>;
});

const MarkdownList = memo(function MarkdownList({ children }: { children?: React.ReactNode }) {
  return <ul className="chatbot__message-text">{children}</ul>;
});

const AIChatText: MarkdownComponents = {
  p: MarkdownParagraph,
  ul: MarkdownList,
};

function mapHistoryMessage(message: ChatHistoryMessage): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    senderLabel: message.senderLabel,
  };
}

function getEscalationActionLabel(status: ChatEscalationStatus | "idle") {
  if (status === "pending") return "Σε αναμονή";
  if (status === "in_progress") return "Σε εξέλιξη";
  if (status === "resolved") return "Άνοιγμα ξανά";
  return "Μιλήστε με εκπρόσωπο";
}

function getEscalationErrorContent(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return "Η σύνδεσή σας έληξε. Συνδεθείτε ξανά και δοκιμάστε πάλι.";
    }
    if (error.status === 403) {
      return "Δεν ήταν δυνατή η επιβεβαίωση της συνομιλίας σας για προώθηση σε εκπρόσωπο.";
    }
    if (error.status === 404) {
      return "Δεν βρέθηκε ιστορικό για αυτή τη συνομιλία. Στείλτε ένα μήνυμα και δοκιμάστε ξανά.";
    }
    if (error.status === 409) {
      return error.message;
    }
    if (error.status === 429) {
      return "Υπάρχουν πολλές προσπάθειες αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγο.";
    }
    if (error.status === 503) {
      return "Η υπηρεσία προώθησης σε εκπρόσωπο δεν είναι διαθέσιμη αυτή τη στιγμή. Καλέστε μας στο 210 3461645.";
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Δεν καταφέραμε να προωθήσουμε το αίτημά σας σε εκπρόσωπο. Δοκιμάστε ξανά ή καλέστε μας στο 210 3461645.";
}

const ChatMessage = memo(function ChatMessage({
  message,
  markdownComponents,
}: {
  message: Message;
  markdownComponents: MarkdownComponents;
}) {
  if (message.role === "system") {
    return (
      <div className="chatbot__message chatbot__message--system">
        <div className="chatbot__system-pill">
          <ReactMarkdown components={markdownComponents} urlTransform={sanitizeLinkUri}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";
  const isAdmin = message.role === "admin";
  const messageClass = `chatbot__message chatbot__message--${message.role}`;

  return (
    <div className={messageClass}>
      {!isUser && (
        <div className="chatbot__message-icon">
          <div
            className={`chatbot__icon chatbot__icon--small ${isAdmin ? "chatbot__icon--support" : "chatbot__icon--gradient"}`}
          >
            {isAdmin ? <Shield className="chatbot__icon-svg" /> : <Headset className="chatbot__icon-svg" />}
          </div>
        </div>
      )}
      <div className="chatbot__message-content">
        {(message.senderLabel || isAdmin) && (
          <p className="chatbot__message-sender">
            {message.senderLabel || "Ομάδα AEROFREN"}
          </p>
        )}
        <ReactMarkdown components={markdownComponents} urlTransform={sanitizeLinkUri}>
          {message.content}
        </ReactMarkdown>
        {isUser && (
          <>
            <div className="chatbot__message-bubble" />
            <div className="chatbot__message-bubble chatbot__message-bubble--end" />
          </>
        )}
      </div>
    </div>
  );
});

export function Chatbot() {
  const searchParams = useSearchParams();
  const chatRootRef = useRef<HTMLElement>(null);
  const chatScrollerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const hydratedSessionRef = useRef<string | null>(null);

  const { user } = useAuth();
  const { allowFunctional, isReady: cookieConsentReady } = useCookieConsent();
  const { notifications, unreadCount } = useNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(() => uuidv4());
  const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [supportStatus, setSupportStatus] = useState<ChatEscalationStatus | "idle">("idle");
  const [escalationStatus, setEscalationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const messagesStyle: React.CSSProperties = {
    paddingInlineEnd: `calc(1.5em - ${scrollbarWidth}px)`,
  };

  const placeholder = "Ρωτήστε μας ό,τι χρειάζεστε...";
  const welcomeSuggestions = [
    "Ποια προϊόντα διαθέτετε;",
    "Στοιχεία επικοινωνίας",
    "Αποστέλλετε παραγγελίες;",
  ];
  const conversationSuggestions = [
    "Πνευματικά ρακόρ",
    "Φίλτρα νερού",
    "Τιμές & διαθεσιμότητα",
  ];
  const isConversationMode = messages.length > 0;
  const hasUnreadSupportReply = notifications.some((notification) => notification.type === "chat_reply" && !notification.isRead);

  useEffect(() => {
    if (!cookieConsentReady) return;

    if (!allowFunctional) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // No-op when storage is unavailable.
      }
      setSessionId(uuidv4());
      return;
    }

    try {
      let storedSession = localStorage.getItem(STORAGE_KEY);
      if (!storedSession) {
        storedSession = uuidv4();
        localStorage.setItem(STORAGE_KEY, storedSession);
      }
      setSessionId(storedSession);
    } catch (error) {
      console.warn("Failed to access localStorage for chat session", error);
      setSessionId(uuidv4());
    }
  }, [allowFunctional, cookieConsentReady]);

  useEffect(() => {
    const shouldOpen = searchParams.get("chat") === "open";
    const sessionParam = searchParams.get("session");

    if (shouldOpen) {
      setIsOpen(true);
    }

    if (sessionParam) {
      setSessionId(sessionParam);
      hydratedSessionRef.current = null;
      if (allowFunctional && cookieConsentReady) {
        try {
          localStorage.setItem(STORAGE_KEY, sessionParam);
        } catch {
          // ignore storage failures
        }
      }
    }
  }, [allowFunctional, cookieConsentReady, searchParams]);

  const randomID = useCallback(() => {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    return Math.floor(random * 2 ** 32).toString(16).padStart(8, "0");
  }, []);

  const refreshHistory = useCallback(async () => {
    if (!isOpen || !user || !sessionId) return;

    setIsHydrating(true);
    try {
      const history = await fetchChatHistoryPage(user, sessionId, { limit: 50 });
      setMessages(history.items.map(mapHistoryMessage));
      setSupportStatus(history.session?.escalationStatus ?? "idle");

      if ((history.session?.customerUnreadCount ?? 0) > 0) {
        await markChatSessionRead(user, sessionId);
      }
    } catch (error) {
      console.warn("[chatbot] failed to refresh history", error);
    } finally {
      setIsHydrating(false);
    }
  }, [isOpen, sessionId, user]);

  useEffect(() => {
    if (!isOpen || !user || !sessionId) return;

    const hydrationKey = `${user.uid}:${sessionId}`;
    if (hydratedSessionRef.current === hydrationKey) {
      return;
    }

    let cancelled = false;
    setIsHydrating(true);

    fetchChatHistoryPage(user, sessionId, { limit: 50 })
      .then(async (history) => {
        if (cancelled) return;

        hydratedSessionRef.current = hydrationKey;
        setMessages(history.items.map(mapHistoryMessage));
        setSupportStatus(history.session?.escalationStatus ?? "idle");

        if ((history.session?.customerUnreadCount ?? 0) > 0) {
          await markChatSessionRead(user, sessionId);
        }
      })
      .catch((error) => {
        console.warn("[chatbot] failed to hydrate history", error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydrating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionId, user]);

  useEffect(() => {
    if (!isOpen || !user || !sessionId) return;
    if (!hasUnreadSupportReply) return;

    const currentThreadNotification = notifications.find((notification) => {
      if (notification.type !== "chat_reply") return false;
      return notification.href.includes(encodeURIComponent(sessionId));
    });

    if (currentThreadNotification) {
      void refreshHistory();
    }
  }, [hasUnreadSupportReply, isOpen, notifications, refreshHistory, sessionId, user]);

  const handleSubmit = useCallback(async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: randomID(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
      senderLabel: user?.displayName ?? user?.email ?? undefined,
    };

    setIsLoading(true);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const history = messages.slice(-10).map((msg) => ({
        role: msg.role === "user" ? "user" as const : "assistant" as const,
        content: msg.content,
      }));

      const data = await requestChatCompletion(user, {
        message: messageText,
        sessionId,
        history,
      });

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        hydratedSessionRef.current = null;
        if (allowFunctional && cookieConsentReady) {
          try {
            localStorage.setItem(STORAGE_KEY, data.sessionId);
          } catch (error) {
            console.warn("Failed to persist updated sessionId", error);
          }
        }
      }

      if (data.persisted === false) {
        console.warn(
          "[chatbot] server persistence unavailable",
          JSON.stringify({
            sessionId: data.sessionId,
            traceId: data.traceId ?? null,
            persistenceError: data.persistenceError ?? null,
          })
        );
      }

      const aiContent =
        data.response ||
        "Λυπούμαστε, δεν μπορέσαμε να απαντήσουμε. Παρακαλούμε δοκιμάστε ξανά.";

      const aiMessage: Message = {
        id: randomID(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date().toISOString(),
        senderLabel: "AI AEROFREN",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: randomID(),
        role: "system",
        content: "Παρουσιάστηκε πρόβλημα. Δοκιμάστε ξανά ή καλέστε μας στο 210 3461645.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [allowFunctional, cookieConsentReady, input, isLoading, messages, randomID, sessionId, user]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    void handleSubmit(suggestion);
  }, [handleSubmit]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }, [handleSubmit]);

  const handleEscalation = useCallback(async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (supportStatus === "pending" || supportStatus === "in_progress") {
      return;
    }

    setEscalationStatus("loading");

    try {
      const result = await requestEscalation(user, sessionId);

      if (result.success) {
        setSupportStatus(result.status);
        setEscalationStatus("success");

        const confirmationMessage: Message = {
          id: randomID(),
          role: "system",
          content:
            result.status === "resolved"
              ? "Το αίτημά σας επανενεργοποιήθηκε."
              : `✅ **Το αίτημά σας καταχωρήθηκε.**\n\nΈνας εκπρόσωπός μας θα επικοινωνήσει σύντομα στο **${user.email}**.\n\nΕναλλακτικά, καλέστε μας στο **210 3461645**.`,
        };
        setMessages((prev) => [...prev, confirmationMessage]);
      } else {
        setEscalationStatus("error");
        const errorMessage: Message = {
          id: randomID(),
          role: "system",
          content:
            "Δεν καταφέραμε να προωθήσουμε το αίτημά σας σε εκπρόσωπο. Δοκιμάστε ξανά ή καλέστε μας στο **210 3461645**.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Escalation error:", error);
      setEscalationStatus("error");
      const errorMessage: Message = {
        id: randomID(),
        role: "system",
        content: getEscalationErrorContent(error),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [randomID, sessionId, supportStatus, user]);

  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    const newCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (newCount > prevCount && chatScrollerRef.current) {
      const scroller = chatScrollerRef.current;
      requestAnimationFrame(() => {
        if (scroller) {
          gsap.to(scroller, {
            scrollTop: scroller.scrollHeight,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      });
    }

    prevMessageCountRef.current = newCount;
  }, [messages.length]);

  const hasMessages = messages.length > 0;
  useLayoutEffect(() => {
    const calculateWidth = () => {
      const scrollerWidth = chatScrollerRef.current?.offsetWidth || 0;
      const messagesWidth = chatMessagesRef.current?.offsetWidth || 0;
      setScrollbarWidth(scrollerWidth - messagesWidth);
    };

    const frameId = requestAnimationFrame(calculateWidth);
    window.addEventListener("resize", calculateWidth);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", calculateWidth);
    };
  }, [hasMessages]);

  useEffect(() => {
    const chatRoot = chatRootRef.current;
    if (!isOpen || !isConversationMode || !chatRoot) return;

    let touchY: number | null = null;

    const routeScroll = (deltaY: number) => {
      const scroller = chatScrollerRef.current;
      if (!scroller) return;

      const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      if (maxScrollTop === 0) return;

      const nextScrollTop = Math.max(0, Math.min(maxScrollTop, scroller.scrollTop + deltaY));
      scroller.scrollTop = nextScrollTop;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      event.stopPropagation();
      routeScroll(event.deltaY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || touchY === null) return;

      const nextTouchY = event.touches[0].clientY;
      const deltaY = touchY - nextTouchY;

      if (Math.abs(deltaY) < 1) return;

      event.preventDefault();
      event.stopPropagation();
      routeScroll(deltaY);
      touchY = nextTouchY;
    };

    const resetTouch = () => {
      touchY = null;
    };

    chatRoot.addEventListener("wheel", handleWheel, { passive: false });
    chatRoot.addEventListener("touchstart", handleTouchStart, { passive: true });
    chatRoot.addEventListener("touchmove", handleTouchMove, { passive: false });
    chatRoot.addEventListener("touchend", resetTouch);
    chatRoot.addEventListener("touchcancel", resetTouch);

    return () => {
      chatRoot.removeEventListener("wheel", handleWheel);
      chatRoot.removeEventListener("touchstart", handleTouchStart);
      chatRoot.removeEventListener("touchmove", handleTouchMove);
      chatRoot.removeEventListener("touchend", resetTouch);
      chatRoot.removeEventListener("touchcancel", resetTouch);
    };
  }, [isConversationMode, isOpen]);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="chatbot-toggle"
          aria-label="Άνοιγμα συνομιλίας"
        >
          <MessageCircle />
          {unreadCount > 0 && (
            <span className="chatbot-toggle__badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <main
          aria-label="Βοηθός AEROFREN"
          aria-modal="true"
          className={`chatbot ${isConversationMode ? "chatbot--conversation" : "chatbot--welcome"}`}
          data-lenis-prevent
          onTouchMoveCapture={(event) => event.stopPropagation()}
          onWheelCapture={(event) => event.stopPropagation()}
          ref={chatRootRef}
          role="dialog"
        >
          <div className="chatbot__header">
            <div className="chatbot__header-info">
              <div className="chatbot__header-icon">
                <Sparkles className="chatbot__header-icon-svg" />
              </div>
              <div className="chatbot__header-text">
                <h3 className="chatbot__header-title">Βοηθός AEROFREN</h3>
                <span className="chatbot__header-status">
                  {supportStatus === "idle"
                    ? "Online • AI υποστήριξη"
                    : `Online • ${getEscalationActionLabel(supportStatus)}`}
                </span>
              </div>
            </div>
            <button
              className="chatbot__header-close"
              onClick={() => setIsOpen(false)}
              aria-label="Κλείσιμο"
            >
              <X />
            </button>
          </div>

          <div className="chatbot__quick-actions">
            <button className="chatbot__quick-action" onClick={() => window.open("/products", "_blank")}>
              <Package className="chatbot__quick-action-icon" />
              <span>Προϊόντα</span>
            </button>
            <button className="chatbot__quick-action" onClick={() => (window.location.href = "tel:+302103461645")}>
              <Phone className="chatbot__quick-action-icon" />
              <span>Τηλέφωνο</span>
            </button>
            <button className="chatbot__quick-action" onClick={() => (window.location.href = "mailto:aerofren@gmail.com")}>
              <Mail className="chatbot__quick-action-icon" />
              <span>E-mail</span>
            </button>
            <button
              className={`chatbot__quick-action ${supportStatus !== "idle" ? "chatbot__quick-action--success" : ""} ${escalationStatus === "loading" ? "chatbot__quick-action--loading" : ""}`}
              onClick={handleEscalation}
              disabled={supportStatus === "pending" || supportStatus === "in_progress" || escalationStatus === "loading"}
            >
              {supportStatus === "pending" || supportStatus === "in_progress" ? (
                <CheckCircle className="chatbot__quick-action-icon chatbot__quick-action-icon--success" />
              ) : escalationStatus === "loading" ? (
                <div className="chatbot__quick-action-spinner" />
              ) : (
                <User className="chatbot__quick-action-icon" />
              )}
              <span>{getEscalationActionLabel(supportStatus)}</span>
            </button>
          </div>

          {showLoginPrompt && (
            <div className="chatbot__login-modal">
              <div
                className="chatbot__login-modal-backdrop"
                role="button"
                tabIndex={0}
                aria-label="Κλείσιμο modal"
                onClick={() => setShowLoginPrompt(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setShowLoginPrompt(false);
                }}
              />
              <div className="chatbot__login-modal-content">
                <button
                  className="chatbot__login-modal-close"
                  onClick={() => setShowLoginPrompt(false)}
                  aria-label="Κλείσιμο"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="chatbot__login-modal-icon">
                  <LogIn className="w-8 h-8" />
                </div>
                <h3 className="chatbot__login-modal-title">Απαιτείται σύνδεση</h3>
                <p className="chatbot__login-modal-text">
                  Για να μιλήσετε με εκπρόσωπο, συνδεθείτε πρώτα στον λογαριασμό σας.
                </p>
                <div className="chatbot__login-modal-actions">
                  <Link
                    href="/login"
                    className="chatbot__login-modal-btn chatbot__login-modal-btn--primary"
                    onClick={() => setShowLoginPrompt(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Σύνδεση
                  </Link>
                  <button
                    className="chatbot__login-modal-btn chatbot__login-modal-btn--secondary"
                    onClick={() => {
                      setShowLoginPrompt(false);
                      window.location.href = "tel:+302103461645";
                    }}
                  >
                    <Phone className="w-4 h-4" />
                    Κλήση (210 3461645)
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="chatbot__container">
            {!isConversationMode ? (
              <div className="chatbot__welcome-content">
                <div className="chatbot__icon-wrapper">
                  <div className="chatbot__icon chatbot__icon--gradient">
                    <Sparkles className="chatbot__icon-svg" strokeWidth={1.5} />
                  </div>
                </div>
                <h1 className="chatbot__title">Πώς μπορούμε να βοηθήσουμε;</h1>
                <div className="chatbot__suggestions-box">
                  {welcomeSuggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion${index + 1}`}
                      className="chatbot__suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                  <div className="chatbot__input-wrapper">
                    <label className="chatbot__label" htmlFor="chat-input">
                      Ερώτημα
                    </label>
                    <input
                      id="chat-input"
                      className="chatbot__input"
                      type="text"
                      placeholder={placeholder}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      className="chatbot__submit"
                      onClick={() => void handleSubmit()}
                      disabled={!input.trim()}
                      aria-label="Αποστολή"
                    >
                      <ArrowRight className="chatbot__submit-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="chatbot__conversation-content">
                <div className="chatbot__message-scroller" ref={chatScrollerRef}>
                  <div
                    className="chatbot__messages"
                    ref={chatMessagesRef}
                    style={messagesStyle}
                  >
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        markdownComponents={AIChatText}
                      />
                    ))}
                    {isHydrating && messages.length === 0 && (
                      <div className="chatbot__message chatbot__message--assistant chatbot__message--ai-loading">
                        <div className="chatbot__message-icon">
                          <div className="chatbot__icon chatbot__icon--gradient chatbot__icon--small">
                            <Headset className="chatbot__icon-svg" />
                          </div>
                        </div>
                        <Loader />
                      </div>
                    )}
                    {isLoading && (
                      <div className="chatbot__message chatbot__message--assistant chatbot__message--ai-loading">
                        <div className="chatbot__message-icon">
                          <div className="chatbot__icon chatbot__icon--gradient chatbot__icon--small">
                            <Headset className="chatbot__icon-svg" />
                          </div>
                        </div>
                        <Loader />
                      </div>
                    )}
                  </div>
                </div>

                <div className="chatbot__input-box">
                  {hasUnreadSupportReply && (
                    <div className="chatbot__support-pill">
                      Έχετε νέα απάντηση από την ομάδα υποστήριξης.
                    </div>
                  )}
                  <div className="chatbot__suggestion-tags">
                    {conversationSuggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion-tag${index + 1}`}
                        className="chatbot__suggestion-tag"
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <div className="chatbot__textarea-wrapper">
                    <label className="chatbot__label" htmlFor="chat-textarea">
                      Μήνυμα
                    </label>
                    <textarea
                      id="chat-textarea"
                      className="chatbot__textarea"
                      placeholder={placeholder}
                      value={input}
                      disabled={isLoading}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <button className="chatbot__globe-button" aria-label="Globe">
                      <Globe className="chatbot__globe-icon" />
                    </button>
                    <button
                      className="chatbot__submit chatbot__submit--textarea"
                      onClick={() => void handleSubmit()}
                      disabled={!input.trim() || isLoading}
                      aria-label="Αποστολή"
                    >
                      <ArrowRight className="chatbot__submit-icon" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </>
  );
}

function Loader() {
  return (
    <svg
      className="chatbot__loader"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path className="chatbot__loader-line" d="m4.9 4.9 2.9 2.9" />
      <path className="chatbot__loader-line" d="M2 12h4" />
      <path className="chatbot__loader-line" d="m4.9 19.1 2.9-2.9" />
      <path className="chatbot__loader-line" d="M12 18v4" />
      <path className="chatbot__loader-line" d="m16.2 16.2 2.9 2.9" />
      <path className="chatbot__loader-line" d="M18 12h4" />
      <path className="chatbot__loader-line" d="m16.2 7.8 2.9-2.9" />
      <path className="chatbot__loader-line" d="M12 2v4" />
    </svg>
  );
}

export default Chatbot;
