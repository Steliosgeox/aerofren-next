"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Phone,
    MapPin,
    Mail,
    ChevronRight,
    Facebook,
    Instagram,
    Linkedin,
    Send,
    Shield,
    Truck,
    Award,
    Clock,
    ArrowRight,
} from "lucide-react";
import { gsap, useGSAP, DURATION, EASE, STAGGER } from "@/lib/gsap";

const navItems = [
    { name: "Αρχική", path: "/" },
    { name: "Προϊόντα", path: "/products" },
    { name: "Ποιοι Είμαστε", path: "/about" },
    { name: "Επικοινωνία", path: "/contact" },
];

const categoryLinks = [
    { name: "Ρακόρ Ταχυσυνδέσεις", path: "/products/push-in-fittings" },
    { name: "Πνευματικές Βαλβίδες", path: "/products/pneumatic-valves" },
    { name: "Σωλήνες & Σπιράλ", path: "/products/hoses-pipes" },
    { name: "Βάνες Σφαιρικές", path: "/products/ball-valves" },
    { name: "Ρυθμιστές Πίεσης", path: "/products/pressure-regulators" },
];

const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/aerofren", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/aerofren", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/aerofren", label: "LinkedIn" },
];

const trustBadges = [
    { icon: Shield, label: "Εγγύηση Ποιότητας" },
    { icon: Truck, label: "Αποστολή 24ωρο" },
    { icon: Award, label: "35+ Χρόνια" },
    { icon: Clock, label: "Άμεση Εξυπηρέτηση" },
];

/**
 * Premium Footer - Ultra Max Edition
 *
 * Features:
 * - Glass morphism matching site theme (#06101f)
 * - Animated gradient borders
 * - Social links with glow hover
 * - Newsletter signup with animated input
 * - Trust badges with icons
 * - Mobile sticky CTA
 * - WCAG 2.1 AA compliant
 */
export function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    useGSAP(
        () => {
            // Stagger all animated elements
            gsap.fromTo(
                "[data-footer-anim]",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: DURATION.normal,
                    stagger: STAGGER.fast,
                    ease: EASE.smooth,
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: "top 85%",
                    },
                }
            );

            // Trust badges special entrance
            gsap.fromTo(
                "[data-trust-badge]",
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: DURATION.normal,
                    stagger: 0.1,
                    ease: EASE.smooth,
                    scrollTrigger: {
                        trigger: "[data-trust-section]",
                        start: "top 90%",
                    },
                }
            );
        },
        { scope: footerRef }
    );

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setEmail("");
        }
    };

    return (
        <>
            {/* Mobile Sticky CTA Bar */}
            <div className="footer-mobile-cta">
                <a href="tel:2103461645" className="footer-mobile-cta__btn footer-mobile-cta__btn--primary">
                    <Phone className="w-5 h-5" />
                    <span>Καλέστε μας</span>
                </a>
                <Link href="/contact" className="footer-mobile-cta__btn footer-mobile-cta__btn--secondary">
                    <Mail className="w-5 h-5" />
                    <span>Επικοινωνία</span>
                </Link>
            </div>

            <footer ref={footerRef} className="footer">
                {/* Animated top border */}
                <div className="footer__top-border" />

                {/* Background effects */}
                <div className="footer__bg">
                    <div className="footer__bg-gradient" />
                    <div className="footer__bg-noise" />
                </div>

                {/* Trust Badges Section */}
                <div data-trust-section className="footer__trust">
                    <div className="footer__container">
                        <div className="footer__trust-grid">
                            {trustBadges.map((badge, i) => (
                                <div key={i} data-trust-badge className="footer__trust-badge">
                                    <div className="footer__trust-icon">
                                        <badge.icon className="w-6 h-6" />
                                    </div>
                                    <span className="footer__trust-label">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="footer__main">
                    <div className="footer__container">
                        <div className="footer__grid">
                            {/* Brand Column */}
                            <div data-footer-anim className="footer__brand">
                                <div className="footer__logo">
                                    <div className="footer__logo-icon">
                                        <span>A</span>
                                    </div>
                                    <div className="footer__logo-text">
                                        <span className="footer__logo-name">AEROFREN</span>
                                        <span className="footer__logo-tagline">Water & Air Systems</span>
                                    </div>
                                </div>

                                <p className="footer__description">
                                    Η κορυφαία επιλογή επαγγελματιών σε συστήματα επεξεργασίας νερού
                                    και αέρα. Αποκλειστικός αντιπρόσωπος εξειδικευμένων εξαρτημάτων.
                                </p>

                                {/* Social Links */}
                                <div className="footer__social">
                                    {socialLinks.map((social, i) => (
                                        <a
                                            key={i}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="footer__social-link"
                                            aria-label={social.label}
                                        >
                                            <social.icon className="w-5 h-5" />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div data-footer-anim className="footer__nav">
                                <h3 className="footer__heading">
                                    <span className="footer__heading-bar" />
                                    Πλοήγηση
                                </h3>
                                <ul className="footer__links">
                                    {navItems.map((item) => (
                                        <li key={item.path}>
                                            <Link href={item.path} className="footer__link">
                                                <ChevronRight className="footer__link-arrow" />
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Categories */}
                            <div data-footer-anim className="footer__nav">
                                <h3 className="footer__heading">
                                    <span className="footer__heading-bar" />
                                    Δημοφιλείς Κατηγορίες
                                </h3>
                                <ul className="footer__links">
                                    {categoryLinks.map((item) => (
                                        <li key={item.path}>
                                            <Link href={item.path} className="footer__link">
                                                <ChevronRight className="footer__link-arrow" />
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact + Newsletter */}
                            <div data-footer-anim className="footer__contact">
                                <h3 className="footer__heading">
                                    <span className="footer__heading-bar" />
                                    Επικοινωνία
                                </h3>

                                <div className="footer__contact-items">
                                    <a href="tel:2103461645" className="footer__contact-item">
                                        <div className="footer__contact-icon">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="footer__contact-label">Τηλέφωνο</span>
                                            <span className="footer__contact-value">210 3461645</span>
                                        </div>
                                    </a>

                                    <div className="footer__contact-item">
                                        <div className="footer__contact-icon">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="footer__contact-label">Διεύθυνση</span>
                                            <span className="footer__contact-value">
                                                Χρυσοστόμου Σμύρνης 26, Μοσχάτο
                                            </span>
                                        </div>
                                    </div>

                                    <a href="mailto:info@aerofren.gr" className="footer__contact-item">
                                        <div className="footer__contact-icon">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="footer__contact-label">Email</span>
                                            <span className="footer__contact-value">info@aerofren.gr</span>
                                        </div>
                                    </a>
                                </div>

                                {/* Newsletter */}
                                <div className="footer__newsletter">
                                    <h4 className="footer__newsletter-title">
                                        Ενημερωθείτε για προσφορές
                                    </h4>
                                    {isSubscribed ? (
                                        <div className="footer__newsletter-success">
                                            <span>Ευχαριστούμε για την εγγραφή!</span>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleNewsletterSubmit} className="footer__newsletter-form">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Το email σας..."
                                                className="footer__newsletter-input"
                                                required
                                                aria-label="Email για newsletter"
                                            />
                                            <button type="submit" className="footer__newsletter-btn" aria-label="Εγγραφή">
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer__bottom">
                    <div className="footer__container footer__bottom-content">
                        <p className="footer__copyright">
                            © {new Date().getFullYear()} AEROFREN (Κουτελίδου Αικατερίνη Β.). All rights reserved.
                        </p>
                        <div className="footer__legal">
                            <Link href="/terms" className="footer__legal-link">Όροι Χρήσης</Link>
                            <Link href="/privacy" className="footer__legal-link">Πολιτική Απορρήτου</Link>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                /* ============================================
                   FOOTER - ULTRA MAX PREMIUM EDITION
                   Glass morphism + Gradient borders + Animations
                   ============================================ */

                .footer {
                    position: relative;
                    background: linear-gradient(180deg, #06101f 0%, #0a1628 100%);
                    color: white;
                    overflow: hidden;
                    isolation: isolate;
                }

                /* Animated top border */
                .footer__top-border {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg,
                        transparent,
                        rgba(0, 102, 204, 0.8),
                        rgba(92, 184, 255, 0.8),
                        rgba(0, 102, 204, 0.8),
                        transparent
                    );
                    background-size: 200% 100%;
                    animation: footer-border-flow 4s linear infinite;
                }

                @keyframes footer-border-flow {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* Background effects */
                .footer__bg {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: -1;
                }

                .footer__bg-gradient {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 80% 50% at 20% 20%, rgba(0, 102, 204, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 80% 80%, rgba(92, 184, 255, 0.05) 0%, transparent 50%);
                }

                .footer__bg-noise {
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    opacity: 0.02;
                }

                .footer__container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* ============================================
                   TRUST BADGES SECTION
                   ============================================ */

                .footer__trust {
                    padding: 40px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .footer__trust-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }

                .footer__trust-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    text-align: center;
                    opacity: 0;
                }

                .footer__trust-icon {
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(92, 184, 255, 0.1));
                    border: 1px solid rgba(92, 184, 255, 0.2);
                    border-radius: 14px;
                    color: #5cb8ff;
                    transition: all 0.3s ease;
                }

                .footer__trust-badge:hover .footer__trust-icon {
                    background: linear-gradient(135deg, rgba(0, 102, 204, 0.3), rgba(92, 184, 255, 0.2));
                    border-color: rgba(92, 184, 255, 0.4);
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 102, 204, 0.2);
                }

                .footer__trust-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.8);
                }

                /* ============================================
                   MAIN FOOTER GRID
                   ============================================ */

                .footer__main {
                    padding: 64px 0;
                }

                .footer__grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
                    gap: 48px;
                }

                /* Brand Column */
                .footer__brand {
                    opacity: 0;
                }

                .footer__logo {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 20px;
                }

                .footer__logo-icon {
                    width: 52px;
                    height: 52px;
                    background: linear-gradient(135deg, #0066cc, #004999);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 800;
                    color: white;
                    box-shadow: 0 4px 16px rgba(0, 102, 204, 0.3);
                }

                .footer__logo-text {
                    display: flex;
                    flex-direction: column;
                }

                .footer__logo-name {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }

                .footer__logo-tagline {
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .footer__description {
                    font-size: 14px;
                    line-height: 1.7;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 24px;
                    max-width: 320px;
                }

                /* Social Links */
                .footer__social {
                    display: flex;
                    gap: 12px;
                }

                .footer__social-link {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    transition: all 0.3s ease;
                }

                .footer__social-link:hover {
                    background: rgba(0, 102, 204, 0.2);
                    border-color: rgba(0, 102, 204, 0.4);
                    color: #5cb8ff;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0, 102, 204, 0.25);
                }

                /* Navigation Columns */
                .footer__nav {
                    opacity: 0;
                }

                .footer__heading {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 20px;
                }

                .footer__heading-bar {
                    width: 3px;
                    height: 20px;
                    background: linear-gradient(180deg, #0066cc, #5cb8ff);
                    border-radius: 2px;
                }

                .footer__links {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer__link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    text-decoration: none;
                    transition: all 0.25s ease;
                }

                .footer__link:hover {
                    color: #5cb8ff;
                    transform: translateX(4px);
                }

                .footer__link-arrow {
                    width: 14px;
                    height: 14px;
                    color: #0066cc;
                    opacity: 0;
                    transform: translateX(-8px);
                    transition: all 0.25s ease;
                }

                .footer__link:hover .footer__link-arrow {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* Contact Column */
                .footer__contact {
                    opacity: 0;
                }

                .footer__contact-items {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .footer__contact-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    text-decoration: none;
                    color: inherit;
                    transition: transform 0.25s ease;
                }

                .footer__contact-item:hover {
                    transform: translateX(4px);
                }

                .footer__contact-icon {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #5cb8ff;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                }

                .footer__contact-item:hover .footer__contact-icon {
                    background: rgba(0, 102, 204, 0.2);
                    border-color: rgba(0, 102, 204, 0.3);
                    box-shadow: 0 4px 16px rgba(0, 102, 204, 0.2);
                }

                .footer__contact-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 2px;
                }

                .footer__contact-value {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                }

                /* Newsletter */
                .footer__newsletter {
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(0, 102, 204, 0.1), rgba(92, 184, 255, 0.05));
                    border: 1px solid rgba(92, 184, 255, 0.15);
                    border-radius: 14px;
                }

                .footer__newsletter-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 12px;
                }

                .footer__newsletter-form {
                    display: flex;
                    gap: 8px;
                }

                .footer__newsletter-input {
                    flex: 1;
                    height: 42px;
                    padding: 0 14px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    font-size: 13px;
                    outline: none;
                    transition: all 0.25s ease;
                }

                .footer__newsletter-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .footer__newsletter-input:focus {
                    border-color: rgba(0, 102, 204, 0.5);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
                }

                .footer__newsletter-btn {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0066cc, #004999);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .footer__newsletter-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 102, 204, 0.4);
                }

                .footer__newsletter-success {
                    padding: 12px;
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 10px;
                    color: #4ade80;
                    font-size: 13px;
                    font-weight: 500;
                    text-align: center;
                }

                /* ============================================
                   BOTTOM BAR
                   ============================================ */

                .footer__bottom {
                    padding: 24px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    background: rgba(0, 0, 0, 0.2);
                }

                .footer__bottom-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .footer__copyright {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .footer__legal {
                    display: flex;
                    gap: 24px;
                }

                .footer__legal-link {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    text-decoration: none;
                    transition: color 0.25s ease;
                }

                .footer__legal-link:hover {
                    color: #5cb8ff;
                }

                /* ============================================
                   MOBILE STICKY CTA
                   ============================================ */

                .footer-mobile-cta {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 40;
                    padding: 12px 16px;
                    background: linear-gradient(180deg, rgba(6, 16, 31, 0.95), rgba(6, 16, 31, 0.98));
                    backdrop-filter: blur(12px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    gap: 12px;
                }

                .footer-mobile-cta__btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    height: 48px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.25s ease;
                }

                .footer-mobile-cta__btn--primary {
                    background: linear-gradient(135deg, #0066cc, #004999);
                    color: white;
                }

                .footer-mobile-cta__btn--secondary {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: white;
                }

                /* ============================================
                   RESPONSIVE
                   ============================================ */

                @media (max-width: 1024px) {
                    .footer__grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 40px;
                    }

                    .footer__brand {
                        grid-column: span 2;
                    }
                }

                @media (max-width: 768px) {
                    .footer {
                        padding-bottom: 80px; /* Space for mobile CTA */
                    }

                    .footer__trust-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                    }

                    .footer__trust-badge {
                        flex-direction: row;
                        text-align: left;
                        gap: 10px;
                    }

                    .footer__trust-icon {
                        width: 44px;
                        height: 44px;
                    }

                    .footer__grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }

                    .footer__brand {
                        grid-column: span 1;
                    }

                    .footer__bottom-content {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }

                    .footer-mobile-cta {
                        display: flex;
                    }
                }

                @media (max-width: 480px) {
                    .footer__trust-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
