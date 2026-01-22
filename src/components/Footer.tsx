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
// CONSTANTS (Extracted for maintainability)
// =============================================================================

const NAV_ITEMS: NavItem[] = [
    { name: "Αρχική", path: "/" },
    { name: "Προϊόντα", path: "/products" },
    { name: "Ποιοι Είμαστε", path: "/about" },
    { name: "Επικοινωνία", path: "/contact" },
    { name: "Όροι Χρήσης", path: "/terms" },
    { name: "Πολιτική Απορρήτου", path: "/privacy" },
] as const;

const CATEGORY_LINKS: NavItem[] = [
    { name: "Ρακόρ Ταχυσυνδέσεις", path: "/products/push-in-fittings" },
    { name: "Πνευματικές Βαλβίδες", path: "/products/pneumatic-valves" },
    { name: "Σωλήνες & Σπιράλ", path: "/products/hoses-pipes" },
    { name: "Βάνες Σφαιρικές", path: "/products/ball-valves" },
] as const;

const SOCIAL_LINKS: SocialLink[] = [
    { icon: Facebook, href: "https://facebook.com/aerofren", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/aerofren", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/aerofren", label: "LinkedIn" },
] as const;

const TRUST_BADGES: TrustBadge[] = [
    { icon: Shield, label: "Εγγύηση Ποιότητας", desc: "ISO 9001:2015" },
    { icon: Truck, label: "Αποστολή 24ωρο", desc: "Πανελλαδική" },
    { icon: Award, label: "35+ Χρόνια", desc: "Since 1989" },
    { icon: Clock, label: "Support", desc: "Τεχνική Κάλυψη" },
] as const;

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
// SUB-COMPONENTS (Extracted for better separation of concerns)
// =============================================================================

/** Film grain noise texture overlay */
const NoiseOverlay = memo(function NoiseOverlay() {
    return (
        <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-20 mix-blend-overlay"
            aria-hidden="true"
        >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <filter id="footerNoiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#footerNoiseFilter)" />
            </svg>
        </div>
    );
});

/** Animated fluid mesh background blobs */
const FluidBackground = memo(function FluidBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[150px] rounded-full animate-blob mix-blend-screen" />
            <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[180px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
            <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-indigo-900/20 blur-[160px] rounded-full animate-blob animation-delay-4000 mix-blend-screen" />
        </div>
    );
});

/** Architectural watermark text */
const WatermarkText = memo(function WatermarkText() {
    return (
        <div
            className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-[0.02]"
            aria-hidden="true"
        >
            <div className="absolute -left-20 top-20 text-[20vw] font-black leading-none text-white tracking-tighter select-none">
                AERO
            </div>
        </div>
    );
});

/** Social media link button */
const SocialButton = memo(function SocialButton({ social }: { social: SocialLink }) {
    const Icon = social.icon;
    return (
        <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow us on ${social.label}`}
            className="group relative w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/20 group-hover:to-transparent transition-all duration-500" />
            <Icon className="w-5 h-5 text-white/70 group-hover:text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
        </a>
    );
});

/** Trust badge card */
const TrustBadgeCard = memo(function TrustBadgeCard({ badge }: { badge: TrustBadge }) {
    const Icon = badge.icon;
    return (
        <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all">
            <Icon className="w-5 h-5 text-cyan-500/60 mb-3 group-hover:text-cyan-400 transition-colors" aria-hidden="true" />
            <div className="font-medium text-white/90 text-sm">{badge.label}</div>
            <div className="text-[10px] text-white/30 font-mono mt-1 uppercase">{badge.desc}</div>
        </div>
    );
});

/** Navigation link with animated underline */
const NavLink = memo(function NavLink({ item, showIndicator = false }: { item: NavItem; showIndicator?: boolean }) {
    return (
        <li>
            <Link
                href={item.path}
                className={`text-sm text-white/60 hover:text-white transition-colors block leading-tight ${showIndicator ? "flex items-center gap-2 group" : ""
                    }`}
            >
                {showIndicator && (
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300" aria-hidden="true" />
                )}
                {item.name}
            </Link>
        </li>
    );
});

/** Newsletter subscription form */
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
    isSubscribed
}: NewsletterFormProps) {
    if (isSubscribed) {
        return (
            <div
                className="mb-12 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3"
                role="status"
                aria-live="polite"
            >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                You are on the list.
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="relative group mb-12">
            <label htmlFor="footer-email" className="sr-only">
                Email address for newsletter
            </label>
            <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="email@aerofren.gr"
                required
                aria-required="true"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 hover:scale-105 transition-all shadow-lg shadow-cyan-900/20 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
                <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
            </button>
        </form>
    );
});

/** Contact details row */
const ContactRow = memo(function ContactRow({
    label,
    value,
    href,
    multiline = false
}: {
    label: string;
    value: React.ReactNode;
    href?: string;
    multiline?: boolean;
}) {
    const content = (
        <>
            <span className="text-sm text-white/50 group-hover:text-white transition-colors">
                {label}
            </span>
            <span className={`${multiline ? "text-right font-light" : "text-lg font-mono"} text-white leading-tight`}>
                {value}
            </span>
        </>
    );

    const className = `flex items-${multiline ? "start" : "center"} justify-between group py-2 border-b border-white/5 ${href ? "cursor-pointer hover:border-white/20" : ""
        } transition-all`;

    if (href) {
        return <a href={href} className={className}>{content}</a>;
    }
    return <div className={className}>{content}</div>;
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * AEROSPACE LUXURY FOOTER
 * Concept: "Orbital Station"
 * 
 * Features:
 * - NanoBanana Liquid Mesh Background (Animated)
 * - Film Grain Texture (Materiality)
 * - Architectural Typography (Editorial Layout)
 * - Liquid Glass Panels with diffuse reflections
 * 
 * @refactored Extracted sub-components for maintainability
 * @refactored Added proper TypeScript types
 * @refactored Improved accessibility (aria-labels, sr-only, focus states)
 * @refactored Removed unused imports
 * @refactored Memoized static components
 */
export function Footer() {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const validateEmail = useCallback((email: string): boolean => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }, []);

    const handleNewsletterSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        }
        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }
        // TODO: Integrate with actual newsletter API
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
            className="relative bg-[#02040a] text-white overflow-hidden isolate selection:bg-cyan-500/30"
            role="contentinfo"
            aria-label="Site footer"
        >
            {/* === ATMOSPHERE LAYER === */}
            <NoiseOverlay />
            <FluidBackground />
            <WatermarkText />

            {/* === CONTENT LAYER === */}
            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-24">
                <MagicBento
                    enableSpotlight={true}
                    spotlightRadius={600}
                    glowColor="100, 200, 255"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* LEFT COLUMN: IDENTITY & MANIFESTO */}
                        <div className="lg:col-span-4 flex flex-col justify-between h-full min-h-[400px]">
                            <div>
                                <div className="mb-10">
                                    <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50">
                                        AEROFREN
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="h-px w-12 bg-cyan-500/50" aria-hidden="true" />
                                        <p className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase">
                                            Est. 1989
                                        </p>
                                    </div>
                                </div>

                                <p className="text-lg text-white/50 leading-relaxed font-light max-w-sm">
                                    Engineering the flow of tomorrow.
                                    <span className="block mt-4 text-white/30 text-sm">
                                        Premium water &amp; air systems for professional industrial applications.
                                    </span>
                                </p>
                            </div>

                            <nav className="mt-auto pt-12" aria-label="Social media links">
                                <div className="flex gap-4">
                                    {SOCIAL_LINKS.map((social) => (
                                        <SocialButton key={social.label} social={social} />
                                    ))}
                                </div>
                            </nav>
                        </div>

                        {/* MIDDLE COLUMN: NAVIGATION & DATA */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            {/* Trust Grid */}
                            <div className="grid grid-cols-2 gap-3" role="list" aria-label="Trust indicators">
                                {TRUST_BADGES.map((badge) => (
                                    <TrustBadgeCard key={badge.label} badge={badge} />
                                ))}
                            </div>

                            {/* Navigation Lists */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-8">
                                    <nav aria-label="Site navigation">
                                        <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
                                            Explore
                                        </h3>
                                        <ul className="space-y-4">
                                            {NAV_ITEMS.map((item) => (
                                                <NavLink key={item.path} item={item} showIndicator />
                                            ))}
                                        </ul>
                                    </nav>
                                    <nav aria-label="Product categories">
                                        <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
                                            Systems
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

                        {/* RIGHT COLUMN: CONTACT & INTERACTION */}
                        <div className="lg:col-span-4 pl-0 lg:pl-12">
                            <ParticleCard
                                enableBorderGlow={true}
                                glowColor="255, 255, 255"
                                className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 p-1"
                            >
                                <div className="relative bg-[#050A14] rounded-[22px] p-8 h-full">
                                    {/* Inner ambient light */}
                                    <div
                                        className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none"
                                        aria-hidden="true"
                                    />

                                    <h3 className="text-2xl font-light mb-2 text-white">
                                        Let&apos;s Connect
                                    </h3>
                                    <p className="text-sm text-white/40 mb-8 font-light">
                                        Subscribe to our technical briefing or reach our engineering team directly.
                                    </p>

                                    <NewsletterForm
                                        email={email}
                                        onEmailChange={handleEmailChange}
                                        onSubmit={handleNewsletterSubmit}
                                        isSubscribed={isSubscribed}
                                    />

                                    {/* Contact Details */}
                                    <address className="space-y-6 not-italic">
                                        <ContactRow
                                            label="Call Us"
                                            value={CONTACT_INFO.phone}
                                            href={CONTACT_INFO.phoneHref}
                                        />
                                        <ContactRow
                                            label="Email"
                                            value={CONTACT_INFO.email}
                                            href={CONTACT_INFO.emailHref}
                                        />
                                        <ContactRow
                                            label="Visit"
                                            value={
                                                <>
                                                    {CONTACT_INFO.address.street}
                                                    <br />
                                                    <span className="text-white/40">{CONTACT_INFO.address.city}</span>
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

                {/* === FOOTER BOTTOM === */}
                <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-white/30 font-mono">
                    <p>
                        <span className="sr-only">Copyright </span>
                        AEROFREN © {currentYear} / ALL SYSTEMS OPERATIONAL
                    </p>
                    <nav aria-label="Legal links" className="flex gap-8">
                        <Link href="/terms" className="hover:text-white transition-colors focus:text-white focus:outline-none">
                            Terms of Ops
                        </Link>
                        <Link href="/privacy" className="hover:text-white transition-colors focus:text-white focus:outline-none">
                            Privacy Protocol
                        </Link>
                        <Link href="/sitemap" className="hover:text-white transition-colors focus:text-white focus:outline-none">
                            Sitemap
                        </Link>
                    </nav>
                </div>
            </div>

            {/* CSS Animations - Consider moving to tailwind.config.js */}
            <style jsx global>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 10s infinite ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </footer>
    );
}
