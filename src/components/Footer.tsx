"use client";

import { useState, useCallback, memo } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Shield,
  Truck,
  Award,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { MagicBento, ParticleCard } from "@/components/MagicBento";

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  name: string;
  path: string;
}

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

interface TrustBadge {
  icon: LucideIcon;
  label: string;
  desc: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const NAV_ITEMS: NavItem[] = [
  { name: "Αρχική", path: "/" },
  { name: "Προϊόντα", path: "/products" },
  { name: "Η Εταιρεία", path: "/about" },
  { name: "Επικοινωνία", path: "/contact" },
  { name: "Όροι Χρήσης", path: "/terms" },
  { name: "Πολιτική Απορρήτου", path: "/privacy" },
];

const CATEGORY_LINKS: NavItem[] = [
  { name: "Ρακόρ ταχυσύνδεσης", path: "/products/push-in-fittings" },
  { name: "Πνευματικές βαλβίδες", path: "/products/pneumatic-valves" },
  { name: "Σωλήνες & σπιράλ", path: "/products/hoses-pipes" },
  { name: "Σφαιρικές βάνες", path: "/products/ball-valves" },
];

const SOCIAL_LINKS: SocialLink[] = [
  { icon: Facebook, href: "https://facebook.com/aerofren", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/aerofren", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/aerofren", label: "LinkedIn" },
];

const TRUST_BADGES: TrustBadge[] = [
  { icon: Shield, label: "Εγγύηση ποιότητας", desc: "ISO 9001:2015" },
  { icon: Truck, label: "Αποστολή 24ωρη", desc: "Πανελλαδική" },
  { icon: Award, label: "35+ χρόνια", desc: "Από το 1989" },
  { icon: Clock, label: "Άμεση διαθεσιμότητα", desc: "Τεχνική κάλυψη" },
];

const CONTACT_INFO = {
  phone: "210 3461645",
  phoneHref: "tel:2103461645",
  email: "info@aerofren.gr",
  emailHref: "mailto:info@aerofren.gr",
  address: {
    street: "Χρυσοστόμου Σμύρνης 26",
    city: "Μοσχάτο, Αθήνα",
  },
} as const;

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// REMOVED: NoiseOverlay - SVG feTurbulence is GPU-intensive
// REMOVED: FluidBackground - blur-[150px]+ blobs are GPU killers on 4K

// Simple gradient replacement for visual interest (no blur, no animation)
const SimpleGradientBg = memo(function SimpleGradientBg() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none opacity-30"
      aria-hidden="true"
      style={{
        background: `radial-gradient(ellipse 80% 50% at 20% 20%, color-mix(in srgb, var(--theme-accent) 15%, transparent), transparent),
                     radial-gradient(ellipse 60% 40% at 80% 80%, color-mix(in srgb, var(--theme-accent) 10%, transparent), transparent)`
      }}
    />
  );
});

const WatermarkText = memo(function WatermarkText() {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-[0.02]"
      aria-hidden="true"
    >
      <div className="absolute -left-20 top-20 text-[20vw] font-black leading-none text-[var(--theme-text)] tracking-tighter select-none">
        AERO
      </div>
    </div>
  );
});

const SocialButton = memo(function SocialButton({ social }: { social: SocialLink }) {
  const Icon = social.icon;
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Επισκεφθείτε μας στο ${social.label}`}
      className="group relative w-14 h-14 flex items-center justify-center rounded-full bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] hover:border-[color-mix(in_srgb,var(--theme-accent)_40%,transparent)] transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)]"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-transparent group-hover:from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] group-hover:to-transparent transition-all duration-500" />
      <Icon className="w-5 h-5 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] relative z-10 transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
});

const TrustBadgeCard = memo(function TrustBadgeCard({ badge }: { badge: TrustBadge }) {
  const Icon = badge.icon;
  return (
    <div className="group p-4 rounded-xl bg-[color-mix(in_srgb,var(--theme-glass-bg)_80%,transparent)] border border-[var(--theme-glass-border)] hover:border-[color-mix(in_srgb,var(--theme-accent)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] transition-all">
      <Icon className="w-5 h-5 text-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] mb-3 group-hover:text-[var(--theme-accent)] transition-colors" aria-hidden="true" />
      <div className="font-medium text-[var(--theme-text)] text-sm">{badge.label}</div>
      <div className="text-[10px] text-[var(--theme-text-muted)] font-mono mt-1 uppercase">{badge.desc}</div>
    </div>
  );
});

const NavLink = memo(function NavLink({ item, showIndicator = false }: { item: NavItem; showIndicator?: boolean }) {
  return (
    <li>
      <Link
        href={item.path}
        className={`text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors block leading-tight ${showIndicator ? "flex items-center gap-2 group" : ""
          }`}
      >
        {showIndicator && (
          <span className="w-0 group-hover:w-2 h-px bg-[var(--theme-accent)] transition-all duration-300" aria-hidden="true" />
        )}
        {item.name}
      </Link>
    </li>
  );
});

interface NewsletterFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubscribed: boolean;
}

const NewsletterForm = memo(function NewsletterForm({
  email,
  onEmailChange,
  onSubmit,
  isSubscribed,
}: NewsletterFormProps) {
  if (isSubscribed) {
    return (
      <div
        className="mb-12 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        Η εγγραφή ολοκληρώθηκε.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative group mb-12">
      <label htmlFor="footer-email" className="sr-only">
        E-mail για ενημερώσεις
      </label>
      <input
        id="footer-email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="email@aerofren.gr"
        required
        aria-required="true"
        className="w-full bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border border-[var(--theme-glass-border)] rounded-xl px-5 py-4 text-[var(--theme-text)] text-sm outline-none focus:border-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)] focus:bg-[color-mix(in_srgb,var(--theme-glass-bg)_95%,transparent)] transition-all placeholder:text-[var(--theme-text-muted)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
      />
      <button
        type="submit"
        aria-label="Εγγραφή στο ενημερωτικό"
        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-hover)] hover:scale-105 transition-all shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--theme-accent)_35%,transparent)]"
      >
        <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </form>
  );
});

const ContactRow = memo(function ContactRow({
  label,
  value,
  href,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
  multiline?: boolean;
}) {
  const content = (
    <>
      <span className="text-sm text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors">
        {label}
      </span>
      <span className={`${multiline ? "text-right font-light" : "text-lg font-mono"} text-[var(--theme-text)] leading-tight`}>
        {value}
      </span>
    </>
  );

  const className = `flex items-${multiline ? "start" : "center"} justify-between group py-2 border-b border-[var(--theme-glass-border)] ${href ? "cursor-pointer hover:border-[color-mix(in_srgb,var(--theme-accent)_35%,transparent)]" : ""
    } transition-all`;

  if (href) {
    return <a href={href} className={className}>{content}</a>;
  }
  return <div className={className}>{content}</div>;
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function Footer() {
  const glowColor = "var(--theme-accent-rgb)";
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = useCallback((value: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  }, []);

  const handleNewsletterSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Το e-mail είναι υποχρεωτικό.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Παρακαλώ εισάγετε έγκυρο e-mail.");
      return;
    }
    setIsSubscribed(true);
    setEmail("");
    setEmailError(null);
  }, [email, validateEmail]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError(null);
    }
  }, [emailError]);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative bg-[var(--theme-bg-solid)] text-[var(--theme-text)] overflow-hidden isolate selection:bg-[color-mix(in_srgb,var(--theme-accent)_30%,transparent)]"
      role="contentinfo"
      aria-label="Υποσέλιδο"
    >
      <SimpleGradientBg />
      <WatermarkText />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-24">
        {/* PERF: Disabled spotlight - getBoundingClientRect on every mouse move kills 4K */}
        <MagicBento
          enableSpotlight={false}
          disableAnimations={true}
          glowColor={glowColor}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 flex flex-col justify-between h-full min-h-[400px]">
              <div>
                <div className="mb-10">
                  <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-br from-[var(--theme-text)] via-[var(--theme-text)] to-[var(--theme-text-muted)]">
                    AEROFREN
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)]" aria-hidden="true" />
                    <p className="text-[var(--theme-accent)] font-mono text-sm tracking-[0.3em] uppercase">
                      Από το 1989
                    </p>
                  </div>
                </div>

                <p className="text-lg text-[var(--theme-text-muted)] leading-relaxed font-light max-w-sm">
                  Σχεδιάζουμε ροές αέρα και νερού με ακρίβεια.
                  <span className="block mt-4 text-[var(--theme-text-muted)] text-sm">
                    Εξαρτήματα υψηλής ποιότητας για απαιτητικές βιομηχανικές εφαρμογές.
                  </span>
                </p>
              </div>

              <nav className="mt-auto pt-12" aria-label="Κοινωνικά δίκτυα">
                <div className="flex gap-4">
                  {SOCIAL_LINKS.map((social) => (
                    <SocialButton key={social.label} social={social} />
                  ))}
                </div>
              </nav>
            </div>

            {/* MIDDLE COLUMN */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="grid grid-cols-2 gap-3" role="list" aria-label="Διαπιστεύσεις">
                {TRUST_BADGES.map((badge) => (
                  <TrustBadgeCard key={badge.label} badge={badge} />
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--theme-glass-border)]">
                <div className="grid grid-cols-2 gap-8">
                  <nav aria-label="Κύρια πλοήγηση">
                    <h3 className="text-xs font-mono text-[var(--theme-text-muted)] uppercase tracking-widest mb-6">
                      Πλοήγηση
                    </h3>
                    <ul className="space-y-4">
                      {NAV_ITEMS.map((item) => (
                        <NavLink key={item.path} item={item} showIndicator />
                      ))}
                    </ul>
                  </nav>
                  <nav aria-label="Κατηγορίες προϊόντων">
                    <h3 className="text-xs font-mono text-[var(--theme-text-muted)] uppercase tracking-widest mb-6">
                      Κατηγορίες
                    </h3>
                    <ul className="space-y-4">
                      {CATEGORY_LINKS.map((item) => (
                        <NavLink key={item.path} item={item} />
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 pl-0 lg:pl-12">
              {/* PERF: Disabled particles and glow for 4K performance */}
              <ParticleCard
                enableBorderGlow={false}
                disableAnimations={true}
                glowColor={glowColor}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] to-transparent border border-[var(--theme-glass-border)] p-1"
              >
                <div className="relative bg-[var(--theme-bg-solid)] rounded-[22px] p-8 h-full">
                  <div
                    className="absolute top-0 right-0 w-64 h-64 bg-[color-mix(in_srgb,var(--theme-accent)_8%,transparent)] blur-[80px] rounded-full pointer-events-none"
                    aria-hidden="true"
                  />

                  <h3 className="text-2xl font-light mb-2 text-[var(--theme-text)]">
                    Μείνετε ενημερωμένοι
                  </h3>
                  <p className="text-sm text-[var(--theme-text-muted)] mb-8 font-light">
                    Σύντομες ενημερώσεις για νέα προϊόντα και τεχνικές λύσεις.
                  </p>

                  <NewsletterForm
                    email={email}
                    onEmailChange={handleEmailChange}
                    onSubmit={handleNewsletterSubmit}
                    isSubscribed={isSubscribed}
                  />

                  {emailError && (
                    <p className="text-xs text-red-300 mb-6">{emailError}</p>
                  )}

                  <address className="space-y-6 not-italic">
                    <ContactRow
                      label="Τηλέφωνο"
                      value={CONTACT_INFO.phone}
                      href={CONTACT_INFO.phoneHref}
                    />
                    <ContactRow
                      label="E-mail"
                      value={CONTACT_INFO.email}
                      href={CONTACT_INFO.emailHref}
                    />
                    <ContactRow
                      label="Διεύθυνση"
                      value={
                        <>
                          {CONTACT_INFO.address.street}
                          <br />
                          <span className="text-[var(--theme-text-muted)]">{CONTACT_INFO.address.city}</span>
                        </>
                      }
                      multiline
                    />
                  </address>
                </div>
              </ParticleCard>
            </div>
          </div>
        </MagicBento>

        {/* FOOTER BOTTOM */}
        <div className="mt-24 pt-8 border-t border-[var(--theme-glass-border)] flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] font-mono">
          <p>
            <span className="sr-only">Copyright </span>
            AEROFREN © {currentYear} / ΟΛΑ ΤΑ ΣΥΣΤΗΜΑΤΑ ΕΝΕΡΓΑ
          </p>
          <nav aria-label="Νομικές πληροφορίες" className="flex gap-8">
            <Link href="/terms" className="hover:text-[var(--theme-text)] transition-colors focus:text-[var(--theme-text)] focus:outline-none">
              Όροι χρήσης
            </Link>
            <Link href="/privacy" className="hover:text-[var(--theme-text)] transition-colors focus:text-[var(--theme-text)] focus:outline-none">
              Πολιτική απορρήτου
            </Link>
            <Link href="/sitemap" className="hover:text-[var(--theme-text)] transition-colors focus:text-[var(--theme-text)] focus:outline-none">
              Χάρτης ιστότοπου
            </Link>
          </nav>
        </div>
      </div>

      {/* REMOVED: Blob animation CSS - FluidBackground removed for 4K performance */}
    </footer>
  );
}
