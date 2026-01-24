"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { MagicBento, ParticleCard } from "@/components/MagicBento";
import { PageBackground } from "@/components/ui/PageBackground";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Building2,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Dynamic import to avoid SSR issues with WebGL
const DarkVeil = dynamic(() => import("@/components/DarkVeil"), { ssr: false });

/**
 * Contact Page - Premium Redesign
 * 
 * Features:
 * - Theme-compliant glassmorphic dark design
 * - MagicBento cards with GSAP spotlight/particle effects
 * - Working contact form with API submission
 * - Premium animations and micro-interactions
 */
export default function ContactPage() {
  const glowColor = "var(--theme-accent-rgb)";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    honeypot: "", // Spam protection
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Honeypot check (if filled, it's a bot)
    if (formData.honeypot) {
      setIsSubmitted(true);
      return;
    }

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Παρακαλώ εισάγετε έγκυρο e-mail.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Αποτυχία αποστολής. Δοκιμάστε ξανά.");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Αποτυχία αποστολής. Δοκιμάστε ξανά.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: "",
      honeypot: "",
    });
    setError(null);
  };

  // Contact info data
  const contactCards = [
    {
      icon: Phone,
      title: "Τηλέφωνο",
      primary: "210 3461645",
      secondary: "Δευτέρα - Παρασκευή",
      href: "tel:2103461645",
      iconBg: "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]",
      iconColor: "text-[var(--theme-accent)]",
    },
    {
      icon: Mail,
      title: "E-mail",
      primary: "info@aerofren.gr",
      secondary: "Απάντηση εντός 24 ωρών",
      href: "mailto:info@aerofren.gr",
      iconBg: "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]",
      iconColor: "text-[var(--theme-accent)]",
    },
    {
      icon: MapPin,
      title: "Διεύθυνση",
      primary: "Χρυσοστόμου Σμύρνης 26",
      secondary: "Μοσχάτο 18344, Αθήνα",
      href: "https://maps.google.com/?q=Χρυσοστόμου+Σμύρνης+26+Μοσχάτο",
      iconBg: "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]",
      iconColor: "text-[var(--theme-accent)]",
    },
    {
      icon: Clock,
      title: "Ωράριο",
      primary: "08:00 - 16:00",
      secondary: "Σάββατο - Κυριακή: Κλειστά",
      iconBg: "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]",
      iconColor: "text-[var(--theme-accent)]",
    },
    {
      icon: Building2,
      title: "Επωνυμία",
      primary: "AEROFREN",
      secondary: "Κουτελίδου Αικατερίνη Β.",
      tags: ["Μόνο B2B", "Από το 1990"],
      iconBg: "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]",
      iconColor: "text-[var(--theme-accent)]",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* DarkVeil WebGL Background - PORTALED OUTSIDE SCROLL SMOOTHER */}
      <PageBackground className="z-[-1]">
        {/* Base background color - kept here so it's also fixed */}
        <div className="absolute inset-0 bg-[var(--theme-bg-solid)]" />

        {/* The Veil itself */}
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          speed={0.5}
        />
      </PageBackground>

      {/* Hero Section - Streamlined */}
      <section className="relative pt-24 pb-4 overflow-hidden z-10">
        <div className="relative max-w-7xl mx-auto px-6">
          <Breadcrumbs items={[{ label: "Επικοινωνία", href: "/contact" }]} />

          <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--theme-text)]">
                ΕΠΙΚΟΙΝΩΝΗΣΤΕ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-hover)]">
                  ΜΑΖΙ ΜΑΣ
                </span>
              </h1>
              <p className="text-sm text-[var(--theme-text-muted)] mt-2 max-w-lg">
                Είμαστε εδώ για να σας εξυπηρετήσουμε. Επικοινωνήστε μαζί μας για
                προσφορές, τεχνικές πληροφορίες ή οποιαδήποτε απορία.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Height-Aligned Layout */}
      <section className="relative py-6 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
            {/* Contact Info Cards - Left Column - Wider for balance */}
            <div className="lg:w-[420px] lg:shrink-0 flex flex-col">
              <div className="flex-1">
                <MagicBento
                  enableSpotlight
                  spotlightRadius={250}
                  glowColor={glowColor}
                >
                  <div className="space-y-3 flex flex-col justify-between h-full">
                    {contactCards.map((card, index) => (
                      <ParticleCard
                        key={index}
                        className="group cursor-pointer rounded-lg transition-all duration-300 hover:-translate-y-0.5 flex-1"
                        glowColor={glowColor}
                        enableBorderGlow
                        clickEffect
                        enableTilt={false}
                        enableMagnetism={false}
                        particleCount={5}
                      >
                        <div className="p-4 bg-[var(--glass-dark-bg)] backdrop-blur-xl border border-[var(--glass-dark-border)] rounded-lg h-full flex items-center">
                          {card.href ? (
                            <a
                              href={card.href}
                              className="flex items-center gap-3 w-full"
                              target={card.href.startsWith('http') ? '_blank' : undefined}
                              rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                              <div className={`w-10 h-10 bg-gradient-to-br ${card.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-[var(--theme-text)]">{card.title}</h3>
                                <p className="text-xs font-bold text-[var(--theme-accent)] group-hover:text-[var(--theme-accent-hover)] transition-colors truncate">
                                  {card.primary}
                                </p>
                                <p className="text-[11px] text-[var(--theme-text-muted)]">{card.secondary}</p>
                              </div>
                            </a>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <div className={`w-10 h-10 bg-gradient-to-br ${card.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-[var(--theme-text)]">{card.title}</h3>
                                <p className="text-xs font-bold text-[var(--theme-text)]">{card.primary}</p>
                                <p className="text-[11px] text-[var(--theme-text-muted)]">{card.secondary}</p>
                                {card.tags && (
                                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                    {card.tags.map((tag, i) => (
                                      <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] text-[var(--theme-text-muted)] border border-[var(--theme-glass-border)]">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </ParticleCard>
                    ))}
                  </div>
                </MagicBento>
              </div>
            </div>

            {/* Contact Form - Right Column - Matches cards height */}
            <div className="flex-1 flex flex-col">
              <div
                className="relative flex-1 flex flex-col rounded-xl overflow-hidden bg-[var(--glass-dark-bg)] backdrop-blur-xl border border-[var(--glass-dark-border)] shadow-xl transition-opacity duration-500"
                style={{ opacity: mounted ? 1 : 0 }}
              >
                {/* Gradient top bar */}
                <div className="h-1 bg-gradient-to-r from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] to-[var(--theme-accent-hover)] shrink-0" />

                <div className="flex-1 p-4 md:p-5 flex flex-col overflow-auto">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">
                        Ευχαριστούμε για το μήνυμά σας!
                      </h2>
                      <p className="text-sm text-[var(--theme-text-muted)] mb-4 max-w-md mx-auto">
                        Λάβαμε το αίτημά σας και θα επικοινωνήσουμε μαζί σας το
                        συντομότερο δυνατό, εντός 24 ωρών.
                      </p>
                      <Button onClick={resetForm} variant="outline" size="sm" className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)]">
                        Νέο μήνυμα
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h2 className="text-base font-bold text-[var(--theme-text)] mb-0.5">
                          Στείλτε μας μήνυμα
                        </h2>
                        <p className="text-xs text-[var(--theme-text-muted)]">
                          Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας το συντομότερο.
                        </p>
                      </div>

                      {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                          <span className="text-red-300 text-sm">{error}</span>
                        </div>
                      )}

                      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3" noValidate>
                        {/* Honeypot - invisible to users */}
                        <input
                          type="text"
                          name="honeypot"
                          value={formData.honeypot}
                          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                          className="hidden"
                          tabIndex={-1}
                          autoComplete="off"
                        />

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="name" className="text-xs text-[var(--theme-text)]">Ονοματεπώνυμο *</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Γιάννης Παπαδόπουλος"
                              className="bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]/50 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="company" className="text-xs text-[var(--theme-text)]">Εταιρεία</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                              placeholder="Όνομα εταιρείας"
                              className="bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]/50 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs text-[var(--theme-text)]">E-mail *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="email@example.com"
                              className="bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]/50 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="phone" className="text-xs text-[var(--theme-text)]">Τηλέφωνο</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="210 1234567"
                              className="bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]/50 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="subject" className="text-xs text-[var(--theme-text)]">Θέμα</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="π.χ. Αίτημα προσφοράς, Τεχνική ερώτηση..."
                            className="bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]/50 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="message" className="text-xs text-[var(--theme-text)]">Μήνυμα *</Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Περιγράψτε το αίτημά σας, κωδικούς προϊόντων, ποσότητες..."
                            rows={3}
                            className="bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]/50 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-9 text-sm font-semibold bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-hover)] hover:from-[var(--theme-accent-hover)] hover:to-[var(--theme-accent)] text-white shadow-md shadow-black/20 transition-all hover:shadow-black/30 hover:-translate-y-0.5"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Αποστολή...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-5 h-5" />
                              Αποστολή μηνύματος
                            </span>
                          )}
                        </Button>

                        <p className="text-xs text-[var(--theme-text-muted)] text-center">
                          Με την αποστολή συμφωνείτε με την{" "}
                          <a href="/privacy" className="underline hover:text-[var(--theme-accent)] transition-colors">
                            Πολιτική Απορρήτου
                          </a>{" "}
                          μας.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Compact */}
      <section className="relative py-10 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-1">
              Επισκεφθείτε μας
            </h2>
            <p className="text-sm text-[var(--theme-text-muted)]">
              Χρυσοστόμου Σμύρνης 26, Μοσχάτο 18344, Αθήνα
            </p>
          </div>

          <div className="rounded-xl overflow-hidden border border-[var(--glass-dark-border)] shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3146.0458789285867!2d23.67820231531961!3d37.94829497972867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1bd5e5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sMoschato%2C%20Greece!5e0!3m2!1sen!2sgr!4v1234567890123!5m2!1sen!2sgr"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[50%] hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="relative py-10 pb-16 z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] to-[var(--theme-accent-hover)] p-8 md:p-10 text-center">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] to-transparent animate-pulse" />

            <h2 className="relative text-2xl md:text-3xl font-bold text-[var(--theme-text)] mb-3">
              Προτιμάτε να μιλήσετε απευθείας;
            </h2>
            <p className="relative text-lg text-[var(--theme-text-muted)] mb-6">
              Η τεχνική μας ομάδα είναι διαθέσιμη για να απαντήσει σε κάθε σας ερώτηση.
            </p>
            <a
              href="tel:2103461645"
              className="relative inline-flex items-center justify-center h-12 px-8 bg-[var(--theme-accent)] text-white font-semibold rounded-lg hover:bg-[var(--theme-accent-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Phone className="w-5 h-5 mr-2" />
              Καλέστε: 210 3461645
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
