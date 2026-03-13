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
  useMemo,
  memo,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  ChevronsDown,
  Headset,
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
import { gsap } from "@/lib/gsap/client";
import { type ChatMessage as ChatThreadMessage, useChat } from "@/contexts/ChatContext";
import "./Chatbot.scss";

const ReactMarkdown = dynamic(
  () => import("react-markdown").then((mod) => mod.default),
  { ssr: false, loading: () => <span>...</span> }
);

type MarkdownComponents = {
  p: React.ComponentType<{ children?: React.ReactNode }>;
  ul: React.ComponentType<{ children?: React.ReactNode }>;
};

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const CHAT_NEAR_BOTTOM_THRESHOLD = 72;

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

function isChatNearBottom(scroller: HTMLDivElement | null): boolean {
  if (!scroller) return true;

  const distanceFromBottom =
    scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight);

  return distanceFromBottom <= CHAT_NEAR_BOTTOM_THRESHOLD;
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

const DATE_SEPARATOR_FORMATTER = new Intl.DateTimeFormat("el-GR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("el-GR", {
  hour: "2-digit",
  minute: "2-digit",
});

type TimelineItem =
  | {
      key: string;
      type: "separator";
      label: string;
    }
  | {
      key: string;
      type: "message";
      message: ChatThreadMessage;
      timeLabel: string | null;
    };

function getMessageDate(timestamp?: string) {
  if (!timestamp) return null;

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getMessageDayKey(timestamp?: string) {
  const parsed = getMessageDate(timestamp);
  if (!parsed) return null;

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMessageDayLabel(timestamp?: string) {
  const parsed = getMessageDate(timestamp);
  if (!parsed) return null;
  return DATE_SEPARATOR_FORMATTER.format(parsed);
}

function formatMessageTimeLabel(timestamp?: string) {
  const parsed = getMessageDate(timestamp);
  if (!parsed) return null;
  return TIME_FORMATTER.format(parsed);
}

function buildTimelineItems(messages: ChatThreadMessage[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  let previousDayKey: string | null = null;

  messages.forEach((message) => {
    const nextDayKey = getMessageDayKey(message.timestamp);
    const nextDayLabel = formatMessageDayLabel(message.timestamp);

    if (nextDayKey && nextDayKey !== previousDayKey && nextDayLabel) {
      items.push({
        key: `separator-${nextDayKey}`,
        type: "separator",
        label: nextDayLabel,
      });
      previousDayKey = nextDayKey;
    }

    items.push({
      key: message.id,
      type: "message",
      message,
      timeLabel: formatMessageTimeLabel(message.timestamp),
    });
  });

  return items;
}

function getSupportHeaderStatus(status: "pending" | "in_progress" | "resolved" | "idle") {
  if (status === "pending") return "Αναμονή ανθρώπινης υποστήριξης";
  if (status === "in_progress") return "Σε εξέλιξη με εκπρόσωπο";
  if (status === "resolved") return "Η προηγούμενη υποστήριξη ολοκληρώθηκε";
  return "AI υποστήριξη";
}

type SupportCtaTone = "default" | "success" | "neutral" | "error" | "gate";

function getSupportCtaState(
  status: "pending" | "in_progress" | "resolved" | "idle",
  errorMessage: string | null,
  showSupportGate: boolean,
) {
  if (showSupportGate) {
    return {
      tone: "gate" as SupportCtaTone,
      title: "Απαιτείται σύνδεση",
      description: "Για να μιλήσετε με εκπρόσωπο, συνδεθείτε πρώτα στον λογαριασμό σας ή καλέστε μας άμεσα.",
      actionLabel: null,
    };
  }

  if (errorMessage) {
    return {
      tone: "error" as SupportCtaTone,
      title: "Δεν ολοκληρώθηκε η προώθηση.",
      description: errorMessage,
      actionLabel: "Δοκιμή ξανά",
    };
  }

  if (status === "pending") {
    return {
      tone: "success" as SupportCtaTone,
      title: "Το αίτημά σας καταχωρήθηκε.",
      description: "Ένας εκπρόσωπός μας θα επικοινωνήσει σύντομα. Εναλλακτικά, καλέστε μας στο 210 3461645.",
      actionLabel: null,
    };
  }

  if (status === "in_progress") {
    return {
      tone: "success" as SupportCtaTone,
      title: "Η ομάδα μας το εξετάζει.",
      description: "Η συνομιλία σας βρίσκεται ήδη σε εξέλιξη με εκπρόσωπο της AEROFREN.",
      actionLabel: null,
    };
  }

  if (status === "resolved") {
    return {
      tone: "neutral" as SupportCtaTone,
      title: "Η προηγούμενη συνομιλία ολοκληρώθηκε.",
      description: "Αν χρειάζεστε συνέχεια, πατήστε «Άνοιγμα ξανά» για νέο αίτημα προς εκπρόσωπο.",
      actionLabel: "Άνοιγμα ξανά",
    };
  }

  return {
    tone: "default" as SupportCtaTone,
    title: "Χρειάζεστε άνθρωπο;",
    description: "Αν το θέμα χρειάζεται τεχνική ή εμπορική υποστήριξη, προωθήστε τη συνομιλία σας απευθείας στην ομάδα μας.",
    actionLabel: "Μιλήστε με εκπρόσωπο",
  };
}

function getThreadModeLabel(status: "pending" | "in_progress" | "resolved" | "idle") {
  if (status === "pending" || status === "in_progress") {
    return "Human Support";
  }

  if (status === "resolved") {
    return "Resolved";
  }

  return "AI First";
}

const TimelineSeparator = memo(function TimelineSeparator({ label }: { label: string }) {
  return (
    <div className="chatbot__timeline-separator" role="presentation">
      <span className="chatbot__timeline-separator-line" />
      <span className="chatbot__timeline-separator-label">{label}</span>
      <span className="chatbot__timeline-separator-line" />
    </div>
  );
});

const ChatMessageItem = memo(function ChatMessageItem({
  message,
  timeLabel,
  markdownComponents,
}: {
  message: ChatThreadMessage;
  timeLabel: string | null;
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
  const roleBadgeLabel = isUser ? "Εσείς" : isAdmin ? "Υποστήριξη" : "AI";
  const senderDisplay = isUser ? "Εσείς" : message.senderLabel || (isAdmin ? "Ομάδα AEROFREN" : "Βοηθός AEROFREN");

  return (
    <div className={messageClass}>
      {!isUser && (
        <div className="chatbot__message-icon">
          <div
            className={`chatbot__icon chatbot__icon--small ${isAdmin ? "chatbot__icon--support" : "chatbot__icon--gradient"}`}
          >
            {isAdmin ? <Shield className="chatbot__icon-svg" /> : <Sparkles className="chatbot__icon-svg" />}
          </div>
        </div>
      )}
      <div className="chatbot__message-content">
        <div className="chatbot__message-meta">
          <span className={`chatbot__message-role chatbot__message-role--${message.role}`}>
            {roleBadgeLabel}
          </span>
          <p className="chatbot__message-sender">{senderDisplay}</p>
          {timeLabel && (
            <time className="chatbot__message-time" dateTime={message.timestamp}>
              {timeLabel}
            </time>
          )}
        </div>
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
  const chatRootRef = useRef<HTMLDivElement>(null);
  const chatScrollerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const {
    closeChat,
    escalateToHuman,
    escalationErrorMessage,
    hasUnreadSupportReply,
    isHydrating,
    isLoading,
    isOpen,
    messages,
    openChat,
    sendMessage,
    supportStatus,
    escalationStatus,
  } = useChat();

  const [input, setInput] = useState<string>("");
  const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);
  const [showSupportGate, setShowSupportGate] = useState<boolean>(false);
  const [hasDetachedMessages, setHasDetachedMessages] = useState<boolean>(false);

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
  const toggleAriaLabel = hasUnreadSupportReply
    ? "Άνοιγμα συνομιλίας, νέα απάντηση διαθέσιμη"
    : "Άνοιγμα συνομιλίας";
  const shouldShowHydrationIndicator = isHydrating && !isLoading;
  const latestMessageSignature = useMemo(() => {
    const latestMessage = messages[messages.length - 1];
    return `${messages.length}:${latestMessage?.id ?? ""}:${latestMessage?.timestamp ?? ""}`;
  }, [messages]);
  const timelineItems = useMemo(() => buildTimelineItems(messages), [messages]);
  const supportCta = useMemo(
    () => getSupportCtaState(supportStatus, escalationErrorMessage, showSupportGate),
    [escalationErrorMessage, showSupportGate, supportStatus],
  );
  const prevMessageSignatureRef = useRef<string | null>(null);
  const forceScrollToLatestRef = useRef(false);

  const handleSubmit = useCallback(async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    forceScrollToLatestRef.current = true;
    setHasDetachedMessages(false);
    setInput("");
    await sendMessage(messageText);
  }, [input, isLoading, sendMessage]);

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
    const result = await escalateToHuman();
    if (result === "requires_auth") {
      setShowSupportGate(true);
      return;
    }
    setShowSupportGate(false);
  }, [escalateToHuman]);

  const handleSupportGateDismiss = useCallback(() => {
    setShowSupportGate(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setShowSupportGate(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (supportStatus !== "idle" || escalationStatus === "loading") {
      setShowSupportGate(false);
    }
  }, [escalationStatus, supportStatus]);

  const scrollToLatest = useCallback(() => {
    const scroller = chatScrollerRef.current;
    if (!scroller) return;

    setHasDetachedMessages(false);
    requestAnimationFrame(() => {
      gsap.to(scroller, {
        scrollTop: scroller.scrollHeight,
        duration: 0.6,
        ease: "power2.out",
      });
    });
  }, []);

  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current && messages.length > 0) {
      forceScrollToLatestRef.current = true;
      scrollToLatest();
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, messages.length, scrollToLatest]);

  useEffect(() => {
    if (!isOpen) {
      prevMessageSignatureRef.current = latestMessageSignature;
      forceScrollToLatestRef.current = false;
      return;
    }

    if (messages.length === 0) {
      prevMessageSignatureRef.current = latestMessageSignature;
      setHasDetachedMessages(false);
      forceScrollToLatestRef.current = false;
      return;
    }

    const previousSignature = prevMessageSignatureRef.current;
    const hasMessageChanged =
      previousSignature !== null && previousSignature !== latestMessageSignature;
    const shouldPinToLatest =
      forceScrollToLatestRef.current || isChatNearBottom(chatScrollerRef.current);

    if (previousSignature === null || (hasMessageChanged && shouldPinToLatest)) {
      scrollToLatest();
    } else if (hasMessageChanged) {
      setHasDetachedMessages(true);
    }

    prevMessageSignatureRef.current = latestMessageSignature;
    forceScrollToLatestRef.current = false;
  }, [isOpen, latestMessageSignature, scrollToLatest]);

  const handleScrollerScroll = useCallback(() => {
    if (isChatNearBottom(chatScrollerRef.current)) {
      setHasDetachedMessages(false);
    }
  }, []);

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

  const supportCtaArea = (
    <>
      <div
        className="chatbot__support-cta-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {supportCta.tone !== "error" && (
          <div className={`chatbot__support-cta chatbot__support-cta--${supportCta.tone}`}>
            <div className="chatbot__support-cta-main">
              <div className="chatbot__support-cta-icon">
                {supportCta.tone === "gate" ? (
                  <LogIn className="chatbot__support-cta-icon-svg" />
                ) : supportCta.tone === "neutral" ? (
                  <Headset className="chatbot__support-cta-icon-svg" />
                ) : supportCta.tone === "success" ? (
                  <CheckCircle className="chatbot__support-cta-icon-svg" />
                ) : (
                  <User className="chatbot__support-cta-icon-svg" />
                )}
              </div>
              <div className="chatbot__support-cta-copy">
                <p className="chatbot__support-cta-title">{supportCta.title}</p>
                <p className="chatbot__support-cta-text">{supportCta.description}</p>
              </div>
            </div>
            <div className="chatbot__support-cta-actions">
              {supportCta.tone === "gate" ? (
                <>
                  <Link
                    href="/login"
                    className="chatbot__support-cta-button chatbot__support-cta-button--primary"
                    onClick={handleSupportGateDismiss}
                  >
                    <LogIn className="chatbot__support-cta-button-icon" />
                    <span>Σύνδεση</span>
                  </Link>
                  <button
                    type="button"
                    className="chatbot__support-cta-button chatbot__support-cta-button--secondary"
                    onClick={() => {
                      handleSupportGateDismiss();
                      window.location.href = "tel:+302103461645";
                    }}
                  >
                    <Phone className="chatbot__support-cta-button-icon" />
                    <span>Κλήση 210 3461645</span>
                  </button>
                  <button
                    type="button"
                    className="chatbot__support-cta-button chatbot__support-cta-button--ghost"
                    onClick={handleSupportGateDismiss}
                  >
                    Συνέχεια με AI
                  </button>
                </>
              ) : supportCta.actionLabel ? (
                <button
                  type="button"
                  className="chatbot__support-cta-button chatbot__support-cta-button--primary"
                  onClick={handleEscalation}
                  disabled={escalationStatus === "loading"}
                >
                  {escalationStatus === "loading" ? (
                    <div className="chatbot__quick-action-spinner" />
                  ) : supportCta.tone === "neutral" ? (
                    <Headset className="chatbot__support-cta-button-icon" />
                  ) : (
                    <User className="chatbot__support-cta-button-icon" />
                  )}
                  <span>{supportCta.actionLabel}</span>
                </button>
              ) : (
                <p className="chatbot__support-cta-meta">Η ενημέρωση θα εμφανιστεί στο ίδιο νήμα.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {supportCta.tone === "error" && (
        <div
          className={`chatbot__support-cta chatbot__support-cta--${supportCta.tone}`}
          role="alert"
        >
          <div className="chatbot__support-cta-main">
            <div className="chatbot__support-cta-icon">
              <AlertCircle className="chatbot__support-cta-icon-svg" />
            </div>
            <div className="chatbot__support-cta-copy">
              <p className="chatbot__support-cta-title">{supportCta.title}</p>
              <p className="chatbot__support-cta-text">{supportCta.description}</p>
            </div>
          </div>
          <div className="chatbot__support-cta-actions">
            <button
              type="button"
              className="chatbot__support-cta-button chatbot__support-cta-button--primary"
              onClick={handleEscalation}
              disabled={escalationStatus === "loading"}
            >
              {escalationStatus === "loading" ? (
                <div className="chatbot__quick-action-spinner" />
              ) : (
                <User className="chatbot__support-cta-button-icon" />
              )}
              <span>{supportCta.actionLabel}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="chatbot-toggle"
          aria-label={toggleAriaLabel}
        >
          <MessageCircle />
          {hasUnreadSupportReply && (
            <span className="chatbot-toggle__badge" aria-hidden="true">
              !
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
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
              <div className={`chatbot__header-icon ${supportStatus === "idle" ? "" : "chatbot__header-icon--support"}`}>
                {supportStatus === "idle" ? (
                  <Sparkles className="chatbot__header-icon-svg" />
                ) : (
                  <Headset className="chatbot__header-icon-svg" />
                )}
              </div>
              <div className="chatbot__header-text">
                <div className="chatbot__header-eyebrow-row">
                  <span className="chatbot__header-eyebrow">AEROFREN support channel</span>
                  <span className={`chatbot__header-mode chatbot__header-mode--${supportStatus}`}>
                    {getThreadModeLabel(supportStatus)}
                  </span>
                </div>
                <h2 className="chatbot__header-title">
                  {supportStatus === "idle" ? "Βοηθός AEROFREN" : "Συνομιλία Υποστήριξης AEROFREN"}
                </h2>
                <span className="chatbot__header-status">
                  {`Online • ${getSupportHeaderStatus(supportStatus)}`}
                </span>
              </div>
            </div>
            <button
              className="chatbot__header-close"
              onClick={closeChat}
              aria-label="Κλείσιμο"
            >
              <X />
            </button>
          </div>

          <div className="chatbot__quick-actions">
            <Link className="chatbot__quick-action" href="/products">
              <Package className="chatbot__quick-action-icon" />
              <span>Προϊόντα</span>
            </Link>
            <button className="chatbot__quick-action" onClick={() => (window.location.href = "tel:+302103461645")}>
              <Phone className="chatbot__quick-action-icon" />
              <span>Τηλέφωνο</span>
            </button>
            <button className="chatbot__quick-action" onClick={() => (window.location.href = "mailto:aerofren@gmail.com")}>
              <Mail className="chatbot__quick-action-icon" />
              <span>E-mail</span>
            </button>
          </div>

          <div className="chatbot__container">
            {!isConversationMode ? (
              <div className="chatbot__welcome-content">
                <div className="chatbot__welcome-shell">
                  <div className="chatbot__welcome-hero">
                    <div className="chatbot__icon-wrapper">
                      <div className="chatbot__icon chatbot__icon--gradient">
                        <Sparkles className="chatbot__icon-svg" strokeWidth={1.5} />
                      </div>
                    </div>
                    <p className="chatbot__welcome-eyebrow">AI first, άνθρωπος όταν χρειάζεται</p>
                    <h1 className="chatbot__title">Άμεση τεχνική καθοδήγηση και ομαλή μετάβαση σε υποστήριξη.</h1>
                    <p className="chatbot__welcome-lead">
                      Ξεκινήστε με ερώτηση προϊόντος ή διαθεσιμότητας. Αν το θέμα χρειάζεται άνθρωπο,
                      η ίδια συνομιλία περνά στην ομάδα μας χωρίς νέο νήμα.
                    </p>
                    <div className="chatbot__welcome-facts">
                      <div className="chatbot__welcome-fact">
                        <span className="chatbot__welcome-fact-label">Ροή</span>
                        <strong>AI → Support</strong>
                      </div>
                      <div className="chatbot__welcome-fact">
                        <span className="chatbot__welcome-fact-label">Κανάλι</span>
                        <strong>Ίδιο νήμα</strong>
                      </div>
                      <div className="chatbot__welcome-fact">
                        <span className="chatbot__welcome-fact-label">Άμεση επαφή</span>
                        <strong>210 3461645</strong>
                      </div>
                    </div>
                  </div>
                  <div className="chatbot__suggestions-box">
                    <p className="chatbot__suggestions-title">Συχνές εκκινήσεις</p>
                    <div className="chatbot__welcome-suggestions">
                      {welcomeSuggestions.map((suggestion, index) => (
                        <button
                          key={`suggestion${index + 1}`}
                          className="chatbot__suggestion"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <span>{suggestion}</span>
                          <ArrowRight className="chatbot__suggestion-icon" />
                        </button>
                      ))}
                    </div>
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
                    {supportCtaArea}
                  </div>
                </div>
              </div>
            ) : (
              <div className="chatbot__conversation-content">
                <div
                  className="chatbot__message-scroller"
                  onScroll={handleScrollerScroll}
                  ref={chatScrollerRef}
                >
                  <div
                    className="chatbot__messages"
                    ref={chatMessagesRef}
                    style={messagesStyle}
                  >
                    {timelineItems.map((item) =>
                      item.type === "separator" ? (
                        <TimelineSeparator key={item.key} label={item.label} />
                      ) : (
                        <ChatMessageItem
                          key={item.key}
                          message={item.message}
                          timeLabel={item.timeLabel}
                          markdownComponents={AIChatText}
                        />
                      ),
                    )}
                    {shouldShowHydrationIndicator && (
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
                  {hasDetachedMessages && (
                    <div className="chatbot__jump-to-latest-wrap">
                      <button
                        type="button"
                        className="chatbot__jump-to-latest"
                        onClick={scrollToLatest}
                      >
                        <ChevronsDown className="chatbot__jump-to-latest-icon" />
                        <span>Νέα μηνύματα • Μετάβαση στο πιο πρόσφατο</span>
                      </button>
                    </div>
                  )}
                  {hasUnreadSupportReply && !hasDetachedMessages && (
                    <div className="chatbot__support-pill">
                      Έχετε νέα απάντηση από την ομάδα υποστήριξης.
                    </div>
                  )}
                  {supportCtaArea}
                  <div className="chatbot__composer-header">
                    <p className="chatbot__composer-title">Γρήγορες ενέργειες</p>
                    <p className="chatbot__composer-hint">Επιλέξτε εκκίνηση ή γράψτε το δικό σας μήνυμα.</p>
                  </div>
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
                      placeholder="Περιγράψτε το αίτημά σας με λίγες λέξεις..."
                      value={input}
                      disabled={isLoading}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
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
        </div>
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
