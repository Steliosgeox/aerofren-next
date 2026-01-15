"use client";

import { useRef } from "react";
import Link from "next/link";
import { Phone, MapPin, Mail, ChevronRight } from "lucide-react";
import { gsap, useGSAP, DURATION, EASE, STAGGER } from "@/lib/gsap";

const navItems = [
    { name: "Αρχική", path: "/" },
    { name: "Προϊόντα", path: "/products" },
    { name: "Ποιοι Είμαστε", path: "/about" },
    { name: "Επικοινωνία", path: "/contact" },
];

/**
 * Footer with GSAP scroll-triggered animations
 */
export function Footer() {
    const footerRef = useRef<HTMLElement>(null);

    // GSAP plugins registered at import time

    useGSAP(
        () => {
            // Brand reveal
            gsap.fromTo(
                "[data-anim='footer-brand']",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: DURATION.normal,
                    ease: EASE.smooth,
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: "top 90%",
                    },
                }
            );

            // Nav links stagger
            gsap.fromTo(
                "[data-anim='footer-nav'] a",
                { opacity: 0, x: -10 },
                {
                    opacity: 1,
                    x: 0,
                    duration: DURATION.fast,
                    stagger: STAGGER.fast,
                    ease: EASE.smooth,
                    scrollTrigger: {
                        trigger: "[data-anim='footer-nav']",
                        start: "top 90%",
                    },
                }
            );

            // Contact items
            gsap.fromTo(
                "[data-anim='footer-contact-item']",
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: DURATION.normal,
                    stagger: STAGGER.normal,
                    ease: EASE.smooth,
                    scrollTrigger: {
                        trigger: "[data-anim='footer-contact']",
                        start: "top 90%",
                    },
                }
            );

            // Bottom bar
            gsap.fromTo(
                "[data-anim='footer-bottom']",
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: DURATION.normal,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: "[data-anim='footer-bottom']",
                        start: "top 95%",
                    },
                }
            );
        },
        { scope: footerRef }
    );

    return (
        <footer ref={footerRef} className="bg-slate-900 text-white pt-24 pb-12 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 border-b border-slate-800 pb-16">
                    {/* Brand */}
                    <div data-anim="footer-brand" className="lg:col-span-5 space-y-8 opacity-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#0066cc] rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">A</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold">AEROFREN</span>
                                <span className="text-xs font-medium text-slate-400">Water & Air Systems</span>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed max-w-md">
                            Η κορυφαία επιλογή επαγγελματιών σε συστήματα επεξεργασίας νερού
                            και αέρα. Αποκλειστικός αντιπρόσωπος εξειδικευμένων εξαρτημάτων.
                        </p>
                        <div className="flex gap-4">
                            <div className="px-3 py-1 rounded-full border border-slate-700 text-xs font-medium text-slate-400 bg-slate-800/50">
                                B2B Only
                            </div>
                            <div className="px-3 py-1 rounded-full border border-slate-700 text-xs font-medium text-slate-400 bg-slate-800/50">
                                Established 1990
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3 lg:pl-8">
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#0066cc] rounded-full" />
                            Πλοήγηση
                        </h3>
                        <ul data-anim="footer-nav" className="space-y-4">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        className="text-slate-400 hover:text-[#0066cc] transition-all duration-300 flex items-center gap-2 group opacity-0"
                                    >
                                        <ChevronRight className="w-3 h-3 text-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="lg:col-span-4 lg:pl-8">
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#0066cc] rounded-full" />
                            Επικοινωνία
                        </h3>
                        <div data-anim="footer-contact" className="space-y-6">
                            <div data-anim="footer-contact-item" className="group flex items-start gap-4 opacity-0">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-[#0066cc] transition-colors">
                                    <Phone className="w-5 h-5 text-[#0066cc] group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Τηλέφωνο</span>
                                    <a href="tel:2103461645" className="text-lg font-bold text-white hover:text-[#0066cc] transition-colors">
                                        210 3461645
                                    </a>
                                </div>
                            </div>

                            <div data-anim="footer-contact-item" className="group flex items-start gap-4 opacity-0">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-[#0066cc] transition-colors">
                                    <MapPin className="w-5 h-5 text-[#0066cc] group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Διεύθυνση</span>
                                    <p className="text-slate-300 leading-snug">
                                        Χρυσοστόμου Σμύρνης 26,<br />Μοσχάτο, 18344, Αθήνα
                                    </p>
                                </div>
                            </div>

                            <div data-anim="footer-contact-item" className="group flex items-start gap-4 opacity-0">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-[#0066cc] transition-colors">
                                    <Mail className="w-5 h-5 text-[#0066cc] group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</span>
                                    <a href="mailto:info@aerofren.gr" className="text-slate-300 hover:text-white transition-colors">
                                        info@aerofren.gr
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div data-anim="footer-bottom" className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium opacity-0">
                    <p>© {new Date().getFullYear()} AEROFREN (Κουτελίδου Αικατερίνη Β.). All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Όροι Χρήσης</Link>
                        <Link href="#" className="hover:text-white transition-colors">Πολιτική Απορρήτου</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
