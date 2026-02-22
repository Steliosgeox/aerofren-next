"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "aerofren_cookie_consent_v1";
const COOKIE_CONSENT_VERSION = 1;
const COOKIE_CONSENT_DAYS = 180;
const OPEN_COOKIE_PREFERENCES_EVENT = "open-cookie-preferences";
const COOKIE_CONSENT_UPDATED_EVENT = "cookie-consent-updated";

type PersistedCookieConsent = {
  version: number;
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  method: "accept_all" | "reject_all" | "custom";
  consentedAt: string;
  expiresAt: string;
};

type CookieToggleState = {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentContextValue = {
  isReady: boolean;
  hasConsented: boolean;
  allowFunctional: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
  openPreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (choices: CookieToggleState) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);
let cachedConsentRaw: string | null | undefined = undefined;
let cachedConsent: PersistedCookieConsent | null = null;

const noConsentDefaults: CookieConsentContextValue = {
  isReady: false,
  hasConsented: false,
  allowFunctional: false,
  allowAnalytics: false,
  allowMarketing: false,
  openPreferences: () => undefined,
  acceptAll: () => undefined,
  rejectAll: () => undefined,
  saveCustom: () => undefined,
};

function toPersistedConsent(
  method: PersistedCookieConsent["method"],
  choices: CookieToggleState
): PersistedCookieConsent {
  const consentedAt = new Date();
  const expiresAt = new Date(consentedAt);
  expiresAt.setDate(expiresAt.getDate() + COOKIE_CONSENT_DAYS);

  return {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    functional: choices.functional,
    analytics: choices.analytics,
    marketing: choices.marketing,
    method,
    consentedAt: consentedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

function parseStoredConsent(raw: string | null): PersistedCookieConsent | null {
  if (!raw) return null;

  const parsed = JSON.parse(raw) as PersistedCookieConsent;
  if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
  if (!parsed.expiresAt || Number.isNaN(Date.parse(parsed.expiresAt))) return null;
  if (new Date(parsed.expiresAt).getTime() <= Date.now()) return null;

  return parsed;
}

function readStoredConsent(): PersistedCookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw === cachedConsentRaw) return cachedConsent;

    cachedConsentRaw = raw;
    cachedConsent = parseStoredConsent(raw);
    return cachedConsent;
  } catch {
    return null;
  }
}

function persistConsent(consent: PersistedCookieConsent) {
  const serialized = JSON.stringify(consent);
  localStorage.setItem(COOKIE_CONSENT_KEY, serialized);
  cachedConsentRaw = serialized;
  cachedConsent = consent;
}

function subscribeToConsentStore(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => onStoreChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleChange);
  };
}

function emitConsentChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COOKIE_CONSENT_UPDATED_EVENT));
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const consentSnapshot = useSyncExternalStore<
    PersistedCookieConsent | null | undefined
  >(subscribeToConsentStore, readStoredConsent, () => undefined);
  const isReady = consentSnapshot !== undefined;
  const consent = consentSnapshot ?? null;
  const [showModal, setShowModal] = useState(false);
  const [draftChoices, setDraftChoices] = useState<CookieToggleState>({
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const handleOpenPreferences = () => {
      setShowModal(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
  }, []);

  const applyConsent = useCallback((nextConsent: PersistedCookieConsent) => {
    persistConsent(nextConsent);
    emitConsentChanged();
    setShowModal(false);
  }, []);

  const acceptAll = useCallback(() => {
    const nextConsent = toPersistedConsent("accept_all", {
      functional: true,
      analytics: true,
      marketing: true,
    });
    setDraftChoices({
      functional: true,
      analytics: true,
      marketing: true,
    });
    applyConsent(nextConsent);
  }, [applyConsent]);

  const rejectAll = useCallback(() => {
    const nextConsent = toPersistedConsent("reject_all", {
      functional: false,
      analytics: false,
      marketing: false,
    });
    setDraftChoices({
      functional: false,
      analytics: false,
      marketing: false,
    });
    applyConsent(nextConsent);
  }, [applyConsent]);

  const saveCustom = useCallback((choices: CookieToggleState) => {
    const nextConsent = toPersistedConsent("custom", choices);
    setDraftChoices(choices);
    applyConsent(nextConsent);
  }, [applyConsent]);

  const openPreferences = useCallback(() => {
    setDraftChoices({
      functional: consent?.functional ?? false,
      analytics: consent?.analytics ?? false,
      marketing: consent?.marketing ?? false,
    });
    setShowModal(true);
  }, [consent]);

  const showBanner = isReady && !consent && !showModal;

  const contextValue = useMemo<CookieConsentContextValue>(() => {
    return {
      isReady,
      hasConsented: Boolean(consent),
      allowFunctional: consent?.functional ?? false,
      allowAnalytics: consent?.analytics ?? false,
      allowMarketing: consent?.marketing ?? false,
      openPreferences,
      acceptAll,
      rejectAll,
      saveCustom,
    };
  }, [acceptAll, consent, isReady, openPreferences, rejectAll, saveCustom]);

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}

      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-[110] mx-auto max-w-5xl rounded-2xl border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_94%,transparent)] p-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-base font-bold text-[var(--theme-text)]">Ρυθμίσεις cookies</p>
              <p className="mt-1 text-sm text-[var(--theme-text-muted)]">
                Χρησιμοποιούμε μόνο απολύτως απαραίτητα cookies ως προεπιλογή. Προαιρετικές κατηγορίες ενεργοποιούνται μόνο μετά από ρητή επιλογή σας.
                Διαβάστε περισσότερα στην{" "}
                <Link href="/privacy#cookies" prefetch={false} className="text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)]">
                  Πολιτική Απορρήτου
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={rejectAll}
                className="h-10 rounded-md border border-[var(--theme-glass-border)] bg-transparent px-4 text-sm font-semibold text-[var(--theme-text)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_96%,transparent)] transition-colors"
              >
                Απόρριψη όλων
              </button>
              <button
                onClick={openPreferences}
                className="h-10 rounded-md border border-[var(--theme-glass-border)] bg-transparent px-4 text-sm font-semibold text-[var(--theme-text)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_96%,transparent)] transition-colors"
              >
                Ρυθμίσεις
              </button>
              <button
                onClick={acceptAll}
                className="h-10 rounded-md bg-[var(--theme-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--theme-accent-hover)] transition-colors"
              >
                Αποδοχή όλων
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            aria-label="Κλείσιμο ρυθμίσεων cookies"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_97%,transparent)] p-5 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[var(--theme-text)]">Προτιμήσεις cookies</h2>
              <p className="mt-1 text-sm text-[var(--theme-text-muted)]">
                Επιλέξτε ποιες προαιρετικές κατηγορίες επιθυμείτε. Τα απαραίτητα cookies είναι πάντα ενεργά για ασφαλή λειτουργία.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--theme-glass-border)] p-4 bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--theme-text)]">Απαραίτητα</p>
                    <p className="text-xs text-[var(--theme-text-muted)]">Ασφάλεια, πλοήγηση και βασική λειτουργικότητα.</p>
                  </div>
                  <span className="inline-flex h-6 items-center rounded-full border border-[var(--theme-glass-border)] px-3 text-xs font-semibold text-[var(--theme-text-muted)]">
                    Πάντα ενεργά
                  </span>
                </div>
              </div>

              {[
                {
                  key: "functional",
                  title: "Λειτουργικά",
                  description: "Π.χ. αποθήκευση προτιμήσεων εμπειρίας χρήστη και συνεδρίας chatbot.",
                },
                {
                  key: "analytics",
                  title: "Αναλυτικά",
                  description: "Στατιστικά χρήσης για βελτίωση περιεχομένου και απόδοσης.",
                },
                {
                  key: "marketing",
                  title: "Marketing",
                  description: "Μετρήσεις καμπανιών και προσωποποιημένα διαφημιστικά σενάρια.",
                },
              ].map((item) => {
                const key = item.key as keyof CookieToggleState;
                const checked = draftChoices[key];

                return (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--theme-glass-border)] p-4 cursor-pointer bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--theme-text)]">{item.title}</p>
                      <p className="text-xs text-[var(--theme-text-muted)]">{item.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[var(--theme-accent)]"
                      checked={checked}
                      onChange={(event) =>
                        setDraftChoices((prev) => ({ ...prev, [key]: event.target.checked }))
                      }
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  onClick={rejectAll}
                  className="h-10 rounded-md border border-[var(--theme-glass-border)] bg-transparent px-3 text-sm font-semibold text-[var(--theme-text)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_96%,transparent)] transition-colors"
                >
                  Απόρριψη όλων
                </button>
                <button
                  onClick={acceptAll}
                  className="h-10 rounded-md border border-[var(--theme-glass-border)] bg-transparent px-3 text-sm font-semibold text-[var(--theme-text)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_96%,transparent)] transition-colors"
                >
                  Αποδοχή όλων
                </button>
              </div>

              <button
                onClick={() => saveCustom(draftChoices)}
                className="h-10 rounded-md bg-[var(--theme-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--theme-accent-hover)] transition-colors"
              >
                Αποθήκευση προτιμήσεων
              </button>
            </div>
          </div>
        </div>
      )}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  return context ?? noConsentDefaults;
}

export function triggerOpenCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
  }
}
