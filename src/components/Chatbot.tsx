/**
 * AEROFREN AI Chatbot Component
 * TWO-STATE LAYOUT:
 * 1. Welcome = Compact floating widget
 * 2. Conversation = EXPANDED with large textarea (matching original design)
 */

"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';
import { gsap } from '@/lib/gsap/client';
import { useAuth } from '@/contexts/AuthContext';
import { saveChatMessage, escalateChat } from '@/lib/firebase';
import Link from 'next/link';
import './Chatbot.scss';

// Types
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  error?: string;
}

// Storage key
const STORAGE_KEY = 'aerofren_chat_session';

// Custom Markdown components
const AIChatText = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="chatbot__message-text">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="chatbot__message-text">{children}</ul>
  ),
};

/**
 * AEROFREN Chatbot - Two-state layout matching original design
 */
export function Chatbot() {
  const chatScrollerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Auth context for user info
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [isEscalated, setIsEscalated] = useState<boolean>(false);
  const [escalationStatus, setEscalationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Dynamic padding for scrollbar
  const messagesStyle: React.CSSProperties = {
    paddingInlineEnd: `calc(1.5em - ${scrollbarWidth}px)`,
  };

  // Placeholder and suggestions
  const placeholder = 'Ρωτήστε οτιδήποτε...';
  const welcomeSuggestions: string[] = [
    'Τι προϊόντα έχετε;',
    'Πληροφορίες επικοινωνίας',
    'Κάνετε αποστολές;',
  ];
  const conversationSuggestions: string[] = [
    'Ρακόρ πνευματικά',
    'Φίλτρα νερού',
    'Τιμές',
  ];

  // Initialize session
  useEffect(() => {
    let storedSession = localStorage.getItem(STORAGE_KEY);
    if (!storedSession) {
      storedSession = uuidv4();
      localStorage.setItem(STORAGE_KEY, storedSession);
    }
    setSessionId(storedSession);
  }, []);

  // Generate random ID
  const randomID = useCallback(() => {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    return Math.floor(random * 2 ** 32).toString(16).padStart(8, '0');
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSubmit(suggestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit message
  const handleSubmit = useCallback(async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: randomID(),
      type: 'user',
      content: messageText,
    };

    setIsLoading(true);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Save user message to Firestore
    saveChatMessage(sessionId, 'user', messageText, user).catch(console.error);

    try {
      const history = messages.slice(-10).map((msg) => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, sessionId, history }),
      });

      const data: ChatResponse = await response.json();

      const aiContent = data.response || 'Λυπάμαι, δεν μπόρεσα να απαντήσω. Παρακαλώ δοκιμάστε ξανά.';

      const aiMessage: Message = {
        id: randomID(),
        type: 'ai',
        content: aiContent,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI response to Firestore
      saveChatMessage(sessionId, 'assistant', aiContent, user).catch(console.error);
    } catch (error) {
      console.error('Chat error:', error);
      const errorContent = 'Αντιμετώπισα ένα πρόβλημα. Παρακαλώ δοκιμάστε ξανά ή καλέστε μας στο 210 3461645.';
      const errorMessage: Message = {
        id: randomID(),
        type: 'ai',
        content: errorContent,
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Save error message to Firestore too
      saveChatMessage(sessionId, 'assistant', errorContent, user).catch(console.error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, randomID, sessionId, user]);

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Handle escalation to human support
  const handleEscalation = useCallback(async () => {
    // If user is not logged in, show login prompt
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    // Already escalated
    if (isEscalated) {
      return;
    }

    setEscalationStatus('loading');

    try {
      const success = await escalateChat(sessionId, user);

      if (success) {
        setIsEscalated(true);
        setEscalationStatus('success');

        // Add confirmation message to chat
        const confirmationMessage: Message = {
          id: randomID(),
          type: 'ai',
          content: `✅ **Το αίτημά σας καταχωρήθηκε!**\n\nΈνας εκπρόσωπός μας θα επικοινωνήσει μαζί σας σύντομα στο email **${user.email}**.\n\nΜπορείτε επίσης να μας καλέσετε απευθείας στο **210 3461645**.`,
        };
        setMessages((prev) => [...prev, confirmationMessage]);
        saveChatMessage(sessionId, 'assistant', confirmationMessage.content, user).catch(console.error);
      } else {
        setEscalationStatus('error');
      }
    } catch (error) {
      console.error('Escalation error:', error);
      setEscalationStatus('error');
    }
  }, [user, sessionId, isEscalated, randomID]);

  // Scroll to bottom when messages change (using GSAP for smoothness)
  useEffect(() => {
    if (chatScrollerRef.current) {
      const scroller = chatScrollerRef.current;
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        if (scroller) {
          gsap.to(scroller, {
            scrollTop: scroller.scrollHeight,
            duration: 0.8,
            ease: 'power2.out',
          });
        }
      }, 100);
    }
  }, [messages]);

  // Calculate scrollbar width
  useLayoutEffect(() => {
    const calculateWidth = () => {
      const scrollerWidth = chatScrollerRef.current?.offsetWidth || 0;
      const messagesWidth = chatMessagesRef.current?.offsetWidth || 0;
      const width = scrollerWidth - messagesWidth;
      setScrollbarWidth(width);
    };

    const frameId = requestAnimationFrame(calculateWidth);
    return () => cancelAnimationFrame(frameId);
  }, [messages]);

  // Simple scroll handling - normalizeScroll is now disabled in SmoothScrollProvider
  // so we only need to stop propagation, not intercept all events
  useEffect(() => {
    const scroller = chatScrollerRef.current;
    if (!scroller) return;

    const handleWheel = (e: WheelEvent) => {
      // Stop propagation to prevent ScrollSmoother from interfering
      e.stopPropagation();
    };

    scroller.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      scroller.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  // Determine if in conversation mode
  const isConversationMode = messages.length > 0;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle--open' : ''}`}
        aria-label={isOpen ? 'Κλείσιμο chat' : 'Άνοιγμα chat'}
      >
        {isOpen ? <X /> : <MessageCircle />}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <main className={`chatbot ${isConversationMode ? 'chatbot--conversation' : 'chatbot--welcome'}`}>
          {/* Header */}
          <div className="chatbot__header">
            <div className="chatbot__header-info">
              <div className="chatbot__header-icon">
                <Sparkles className="chatbot__header-icon-svg" />
              </div>
              <div className="chatbot__header-text">
                <h3 className="chatbot__header-title">Βοηθός AEROFREN</h3>
                <span className="chatbot__header-status">Online • AI Powered</span>
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

          {/* Quick Actions */}
          <div className="chatbot__quick-actions">
            <button className="chatbot__quick-action" onClick={() => window.open('/products', '_blank')}>
              <Package className="chatbot__quick-action-icon" />
              <span>Προϊόντα</span>
            </button>
            <button className="chatbot__quick-action" onClick={() => window.location.href = 'tel:+302103461645'}>
              <Phone className="chatbot__quick-action-icon" />
              <span>Κλήση</span>
            </button>
            <button className="chatbot__quick-action" onClick={() => window.location.href = 'mailto:info@aerofren.gr'}>
              <Mail className="chatbot__quick-action-icon" />
              <span>Email</span>
            </button>
            <button
              className={`chatbot__quick-action ${isEscalated ? 'chatbot__quick-action--success' : ''} ${escalationStatus === 'loading' ? 'chatbot__quick-action--loading' : ''}`}
              onClick={handleEscalation}
              disabled={isEscalated || escalationStatus === 'loading'}
            >
              {isEscalated ? (
                <CheckCircle className="chatbot__quick-action-icon chatbot__quick-action-icon--success" />
              ) : escalationStatus === 'loading' ? (
                <div className="chatbot__quick-action-spinner" />
              ) : (
                <User className="chatbot__quick-action-icon" />
              )}
              <span>{isEscalated ? 'Καταχωρήθηκε' : 'Μιλήστε με εκπρόσωπο'}</span>
            </button>
          </div>

          {/* Login Prompt Modal */}
          {showLoginPrompt && (
            <div className="chatbot__login-modal">
              <div className="chatbot__login-modal-backdrop" onClick={() => setShowLoginPrompt(false)} />
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
                <h3 className="chatbot__login-modal-title">Απαιτείται Σύνδεση</h3>
                <p className="chatbot__login-modal-text">
                  Για να μιλήσετε με εκπρόσωπο, παρακαλώ συνδεθείτε πρώτα στον λογαριασμό σας.
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
                      window.location.href = 'tel:+302103461645';
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
            {/* ========== WELCOME STATE ========== */}
            {!isConversationMode ? (
              <div className="chatbot__welcome-content">
                <div className="chatbot__icon-wrapper">
                  <div className="chatbot__icon chatbot__icon--gradient">
                    <Sparkles className="chatbot__icon-svg" strokeWidth={1.5} />
                  </div>
                </div>
                <h1 className="chatbot__title">Πώς μπορώ να βοηθήσω;</h1>
                <div className="chatbot__suggestions-box">
                  {welcomeSuggestions.map((suggestion, i) => (
                    <button
                      key={`suggestion${i + 1}`}
                      className="chatbot__suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                  <div className="chatbot__input-wrapper">
                    <label className="chatbot__label" htmlFor="chat-input">
                      Ερώτηση
                    </label>
                    <input
                      id="chat-input"
                      className="chatbot__input"
                      type="text"
                      placeholder={placeholder}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      className="chatbot__submit"
                      onClick={() => handleSubmit()}
                      disabled={!input.trim()}
                      aria-label="Αποστολή"
                    >
                      <ArrowRight className="chatbot__submit-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ========== CONVERSATION STATE - EXPANDED ========== */
              <div className="chatbot__conversation-content">
                {/* Scrollable Message Area */}
                <div className="chatbot__message-scroller" ref={chatScrollerRef}>
                  <div
                    className="chatbot__messages"
                    ref={chatMessagesRef}
                    style={messagesStyle}
                  >
                    {messages.map((message) => {
                      const messageClass = `chatbot__message chatbot__message--${message.type}`;

                      return (
                        <div key={`message${message.id}`} className={messageClass}>
                          {message.type === 'ai' && (
                            <div className="chatbot__message-icon">
                              <div className="chatbot__icon chatbot__icon--gradient chatbot__icon--small">
                                <Headset className="chatbot__icon-svg" />
                              </div>
                            </div>
                          )}
                          <div className="chatbot__message-content">
                            <ReactMarkdown components={AIChatText}>
                              {message.content}
                            </ReactMarkdown>
                            {/* Purple bubbles for user messages */}
                            {message.type === 'user' && (
                              <>
                                <div className="chatbot__message-bubble" />
                                <div className="chatbot__message-bubble chatbot__message-bubble--end" />
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {isLoading && (
                      <div className="chatbot__message chatbot__message--ai chatbot__message--ai-loading">
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

                {/* Input Box with LARGE TEXTAREA - matching original */}
                <div className="chatbot__input-box">
                  <div className="chatbot__suggestion-tags">
                    {conversationSuggestions.map((suggestion, i) => (
                      <button
                        key={`suggestion-tag${i + 1}`}
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
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <button className="chatbot__globe-button" aria-label="Globe">
                      <Globe className="chatbot__globe-icon" />
                    </button>
                    <button
                      className="chatbot__submit chatbot__submit--textarea"
                      onClick={() => handleSubmit()}
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

/**
 * Loading Spinner
 */
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
