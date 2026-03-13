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

function getEscalationActionLabel(
  status: "idle" | "pending" | "in_progress" | "resolved"
) {
  if (status === "pending") return "Σε αναμονή";
  if (status === "in_progress") return "Σε εξέλιξη";
  if (status === "resolved") return "Άνοιγμα ξανά";
  return "Μιλήστε με εκπρόσωπο";
}

const MarkdownParagraph = memo(function MarkdownParagraph({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <p className="chatbot__message-text">{children}</p>;
});

const MarkdownList = memo(function MarkdownList({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <ul className="chatbot__message-text">{children}</ul>;
});

const AIChatText: MarkdownComponents = {
  p: MarkdownParagraph,
  ul: MarkdownList,
};

const ChatMessage = memo(function ChatMessage({
  message,
  markdownComponents,
}: {
  message: ChatThreadMessage;
  markdownComponents: MarkdownComponents;
}) {
  if (message.role === "system") {
    return (
      <div className="chatbot__message chatbot__message--system">
        <div className="chatbot__system-pill">
          <ReactMarkdown
            components={markdownComponents}
            urlTransform={sanitizeLinkUri}
          >
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
            className={`chatbot__icon chatbot__icon--small ${
              isAdmin ? "chatbot__icon--support" : "chatbot__icon--gradient"
            }`}
          >
            {isAdmin ? (
              <Shield className="chatbot__icon-svg" />
            ) : (
              <Headset className="chatbot__icon-svg" />
            )}
          </div>
        </div>
      )}
      <div className="chatbot__message-content">
        {(message.senderLabel || isAdmin) && (
          <p className="chatbot__message-sender">
            {message.senderLabel || "Ομάδα AEROFREN"}
          </p>
        )}
        <ReactMarkdown
          components={markdownComponents}
          urlTransform={sanitizeLinkUri}
        >
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
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [hasDetachedMessages, setHasDetachedMessages] =
    useState<boolean>(false);

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

  const latestMessageSignature = useMemo(() => {
    const latestMessage = messages[messages.length - 1];
    return `${messages.length}:${latestMessage?.id ?? ""}:${latestMessage?.timestamp ?? ""}`;
  }, [messages]);

  const prevMessageSignatureRef = useRef<string | null>(null);
  const forceScrollToLatestRef = useRef(false);

  const handleSubmit = useCallback(
    async (text?: string) => {
      const messageText = text || input;
      if (!messageText.trim() || isLoading) return;

      forceScrollToLatestRef.current = true;
      setHasDetachedMessages(false);
      setInput("");
      await sendMessage(messageText);
    },
    [input, isLoading, sendMessage]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      void handleSubmit(suggestion);
    },
    [handleSubmit]
  );

  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleEscalation = useCallback(async () => {
    const result = await escalateToHuman();
    if (result === "requires_auth") {
      setShowLoginPrompt(true);
      return;
    }
    setShowLoginPrompt(false);
  }, [escalateToHuman]);

  useEffect(() => {
    if (!isOpen) {
      setShowLoginPrompt(false); // eslint-disable-line react-hooks/set-state-in-effect -- resetting modal on external close event is canonical sync with external state
    }
  }, [isOpen]);

  useEffect(() => {
    if (supportStatus !== "idle" || escalationStatus === "loading") {
      setShowLoginPrompt(false); // eslint-disable-line react-hooks/set-state-in-effect -- clearing login gate derived from external context update
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
      scrollToLatest(); // eslint-disable-line react-hooks/set-state-in-effect -- scroll side-effect on open is the canonical useEffect pattern for external event sync
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
      setHasDetachedMessages(false); // eslint-disable-line react-hooks/set-state-in-effect -- resetting scroll detachment when messages clear is syncing with external state
      forceScrollToLatestRef.current = false;
      return;
    }

    const previousSignature = prevMessageSignatureRef.current;
    const hasMessageChanged =
      previousSignature !== null &&
      previousSignature !== latestMessageSignature;
    const shouldPinToLatest =
      forceScrollToLatestRef.current ||
      isChatNearBottom(chatScrollerRef.current);

    if (
      previousSignature === null ||
      (hasMessageChanged && shouldPinToLatest)
    ) {
      scrollToLatest();
    } else if (hasMessageChanged) {
      setHasDetachedMessages(true);
    }

    prevMessageSignatureRef.current = latestMessageSignature;
    forceScrollToLatestRef.current = false;
  }, [isOpen, latestMessageSignature, messages.length, scrollToLatest]);

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

      const maxScrollTop = Math.max(
        0,
        scroller.scrollHeight - scroller.clientHeight
      );
      if (maxScrollTop === 0) return;

      const nextScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, scroller.scrollTop + deltaY)
      );
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
    chatRoot.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    chatRoot.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
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
          className={`chatbot ${
            isConversationMode ? "chatbot--conversation" : "chatbot--welcome"
          }`}
          data-lenis-prevent
          onTouchMoveCapture={(event) => event.stopPropagation()}
          onWheelCapture={(event) => event.stopPropagation()}
          ref={chatRootRef}
          role="dialog"
        >
          {/* ── HEADER ── */}
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
              type="button"
              className="chatbot__header-close"
              onClick={closeChat}
              aria-label="Κλείσιμο"
            >
              <X />
            </button>
          </div>

          {/* ── QUICK ACTIONS (4 buttons) ── */}
          <div className="chatbot__quick-actions">
            <button
              type="button"
              className="chatbot__quick-action"
              onClick={() => window.open("/products", "_blank")}
            >
              <Package className="chatbot__quick-action-icon" />
              <span>Προϊόντα</span>
            </button>
            <button
              type="button"
              className="chatbot__quick-action"
              onClick={() =>
                (window.location.href = "tel:+302103461645")
              }
            >
              <Phone className="chatbot__quick-action-icon" />
              <span>Τηλέφωνο</span>
            </button>
            <button
              type="button"
              className="chatbot__quick-action"
              onClick={() =>
                (window.location.href = "mailto:aerofren@gmail.com")
              }
            >
              <Mail className="chatbot__quick-action-icon" />
              <span>E-mail</span>
            </button>
            <button
              type="button"
              className={`chatbot__quick-action ${
                supportStatus !== "idle"
                  ? "chatbot__quick-action--success"
                  : ""
              } ${
                escalationStatus === "loading"
                  ? "chatbot__quick-action--loading"
                  : ""
              }`}
              onClick={() => void handleEscalation()}
              disabled={
                supportStatus === "pending" ||
                supportStatus === "in_progress" ||
                escalationStatus === "loading"
              }
            >
              {supportStatus === "pending" ||
              supportStatus === "in_progress" ? (
                <CheckCircle className="chatbot__quick-action-icon chatbot__quick-action-icon--success" />
              ) : escalationStatus === "loading" ? (
                <div className="chatbot__quick-action-spinner" />
              ) : (
                <User className="chatbot__quick-action-icon" />
              )}
              <span>{getEscalationActionLabel(supportStatus)}</span>
            </button>
          </div>

          {/* ── LOGIN PROMPT MODAL ── */}
          {showLoginPrompt && (
            <div className="chatbot__login-modal">
              <div
                className="chatbot__login-modal-backdrop"
                role="button"
                tabIndex={0}
                aria-label="Κλείσιμο modal"
                onClick={() => setShowLoginPrompt(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    setShowLoginPrompt(false);
                }}
              />
              <div className="chatbot__login-modal-content">
                <button
                  type="button"
                  className="chatbot__login-modal-close"
                  onClick={() => setShowLoginPrompt(false)}
                  aria-label="Κλείσιμο"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="chatbot__login-modal-icon">
                  <LogIn className="w-8 h-8" />
                </div>
                <h3 className="chatbot__login-modal-title">
                  Απαιτείται σύνδεση
                </h3>
                <p className="chatbot__login-modal-text">
                  Για να μιλήσετε με εκπρόσωπο, συνδεθείτε πρώτα στον
                  λογαριασμό σας.
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
                    type="button"
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

          {/* ── MAIN CONTAINER ── */}
          <div className="chatbot__container">
            {!isConversationMode ? (
              /* ── WELCOME STATE ── */
              <div className="chatbot__welcome-content">
                <div className="chatbot__icon-wrapper">
                  <div className="chatbot__icon chatbot__icon--gradient">
                    <Sparkles
                      className="chatbot__icon-svg"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <h1 className="chatbot__title">
                  Πώς μπορούμε να βοηθήσουμε;
                </h1>
                <div className="chatbot__suggestions-box">
                  {welcomeSuggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion${index + 1}`}
                      type="button"
                      className="chatbot__suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                  <div className="chatbot__input-wrapper">
                    <label
                      className="chatbot__label"
                      htmlFor="chat-input"
                    >
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
                      type="button"
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
              /* ── CONVERSATION STATE ── */
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
                  {hasUnreadSupportReply && !hasDetachedMessages && (
                    <div className="chatbot__support-pill">
                      Έχετε νέα απάντηση από την ομάδα υποστήριξης.
                    </div>
                  )}
                  <div className="chatbot__suggestion-tags">
                    {conversationSuggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion-tag${index + 1}`}
                        type="button"
                        className="chatbot__suggestion-tag"
                        disabled={isLoading}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <div className="chatbot__textarea-wrapper">
                    <label
                      className="chatbot__label"
                      htmlFor="chat-textarea"
                    >
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
                    <button
                      type="button"
                      className="chatbot__globe-button"
                      aria-label="Globe"
                    >
                      <Globe className="chatbot__globe-icon" />
                    </button>
                    <button
                      type="button"
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
