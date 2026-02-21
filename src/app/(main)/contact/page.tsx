"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
  type LucideIcon,
} from "lucide-react";

const DarkVeil = dynamic(() => import("@/components/DarkVeil"), { ssr: false });

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  honeypot: string;
};

type ContactCardConfig = {
  icon: LucideIcon;
  title: string;
  primary: string;
  secondary: string;
  href?: string;
  tags?: string[];
};

const INITIAL_FORM_DATA: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
  honeypot: "",
};

const CONTACT_CARDS: ContactCardConfig[] = [
  {
    icon: Phone,
    title: "Τηλέφωνο",
    primary: "210 3461645",
    secondary: "Δευτέρα - Παρασκευή",
    href: "tel:2103461645",
  },
  {
    icon: Mail,
    title: "E-mail",
    primary: "info@aerofren.gr",
    secondary: "Απάντηση εντός 24 ωρών",
    href: "mailto:info@aerofren.gr",
  },
  {
    icon: MapPin,
    title: "Διεύθυνση",
    primary: "Χρυσοστόμου Σμύρνης 26",
    secondary: "Μοσχάτο 18344, Αθήνα",
    href: "https://maps.google.com/?q=Χρυσοστόμου+Σμύρνης+26+Μοσχάτο",
  },
  {
    icon: Clock,
    title: "Ωράριο",
    primary: "08:00 - 16:00",
    secondary: "Σάββατο - Κυριακή: Κλειστά",
  },
  {
    icon: Building2,
    title: "Επωνυμία",
    primary: "AEROFREN",
    secondary: "Κουτελίδου Αικατερίνη Β.",
    tags: ["Μόνο B2B", "Από το 1990"],
  },
];

const CONTACT_ICON_BG =
  "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]";

export default function ContactPage() {
  const glowColor = "var(--theme-accent-rgb)";
  const [formData, setFormData] = useState<ContactFormState>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof ContactFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.honeypot) {
      setIsSubmitted(true);
      return;
    }

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
          honeypot: formData.honeypot,
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
    setFormData(INITIAL_FORM_DATA);
    setError(null);
  };

  return (
    <div className="min-h-screen text-[var(--contact-text)]">
      <PageBackground layer="base">
        <DarkVeil variant="contact" intensity="low" animated />
      </PageBackground>

      <section className="relative pt-24 pb-4 overflow-hidden z-10">
        <div className="relative max-w-7xl mx-auto px-6">
          <Breadcrumbs items={[{ label: "Επικοινωνία", href: "/contact" }]} />

          <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--contact-text)]">
                ΕΠΙΚΟΙΝΩΝΗΣΤΕ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-hover)] drop-shadow-sm">
                  ΜΑΖΙ ΜΑΣ
                </span>
              </h1>
              <p className="text-sm text-[var(--contact-muted)] mt-2 max-w-lg">
                Είμαστε εδώ για να σας εξυπηρετήσουμε. Επικοινωνήστε μαζί μας για
                προσφορές, τεχνικές πληροφορίες ή οποιαδήποτε απορία.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-6 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
            <div className="lg:w-[420px] lg:shrink-0 flex flex-col">
              <div className="flex-1">
                <MagicBento
                  enableSpotlight
                  spotlightRadius={250}
                  glowColor={glowColor}
                  pointerThrottle="raf"
                  cacheBounds
                >
                  <div className="space-y-3 flex flex-col justify-between h-full">
                    {CONTACT_CARDS.map((card) => (
                      <ParticleCard
                        key={card.title}
                        className="group cursor-pointer rounded-lg transition-all duration-300 hover:-translate-y-0.5 flex-1"
                        glowColor={glowColor}
                        enableBorderGlow
                        clickEffect
                        enableTilt={false}
                        enableMagnetism={false}
                        particleCount={5}
                      >
                        <div className="p-4 bg-[var(--contact-surface)] backdrop-blur-sm border border-[var(--contact-border)] rounded-lg h-full flex items-center">
                          {card.href ? (
                            <a
                              href={card.href}
                              className="flex items-center gap-3 w-full"
                              target={card.href.startsWith("http") ? "_blank" : undefined}
                              rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            >
                              <div className={`w-10 h-10 bg-gradient-to-br ${CONTACT_ICON_BG} rounded-lg flex items-center justify-center shrink-0`}>
                                <card.icon className="w-4 h-4 text-[var(--theme-accent)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-[var(--contact-text)]">{card.title}</h3>
                                <p className="text-xs font-bold text-[var(--theme-accent)] group-hover:text-[var(--theme-accent-hover)] transition-colors truncate">
                                  {card.primary}
                                </p>
                                <p className="text-[11px] text-[var(--contact-muted)]">{card.secondary}</p>
                              </div>
                            </a>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <div className={`w-10 h-10 bg-gradient-to-br ${CONTACT_ICON_BG} rounded-lg flex items-center justify-center shrink-0`}>
                                <card.icon className="w-4 h-4 text-[var(--theme-accent)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-[var(--contact-text)]">{card.title}</h3>
                                <p className="text-xs font-bold text-[var(--contact-text)]">{card.primary}</p>
                                <p className="text-[11px] text-[var(--contact-muted)]">{card.secondary}</p>
                                {card.tags && (
                                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                    {card.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-1.5 py-0.5 rounded text-[10px] bg-[color-mix(in_srgb,var(--contact-surface)_85%,transparent)] text-[var(--contact-muted)] border border-[var(--contact-border)]"
                                      >
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

            <div className="flex-1 flex flex-col">
              <div className="relative flex-1 flex flex-col rounded-xl overflow-hidden bg-[var(--contact-surface)] border border-[var(--contact-border)] shadow-xl">
                <div className="h-1 bg-gradient-to-r from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] to-[var(--theme-accent-hover)] shrink-0" />

                <div className="flex-1 p-4 md:p-5 flex flex-col overflow-auto">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-bold text-[var(--contact-text)] mb-2">
                        Ευχαριστούμε για το μήνυμά σας!
                      </h2>
                      <p className="text-sm text-[var(--contact-muted)] mb-4 max-w-md mx-auto">
                        Λάβαμε το αίτημά σας και θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό, εντός 24 ωρών.
                      </p>
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        size="sm"
                        className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)]"
                      >
                        Νέο μήνυμα
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h2 className="text-base font-bold text-[var(--contact-text)] mb-0.5">Στείλτε μας μήνυμα</h2>
                        <p className="text-xs text-[var(--contact-muted)]">
                          Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας το συντομότερο.
                        </p>
                      </div>

                      {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                          <span className="text-red-300 text-sm">{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                        <input
                          type="text"
                          name="honeypot"
                          value={formData.honeypot}
                          onChange={(e) => updateField("honeypot", e.target.value)}
                          className="hidden"
                          tabIndex={-1}
                          autoComplete="off"
                        />

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="name" className="text-xs text-[var(--contact-text)]">Ονοματεπώνυμο *</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => updateField("name", e.target.value)}
                              placeholder="Γιάννης Παπαδόπουλος"
                              className="bg-[color-mix(in_srgb,var(--contact-surface)_86%,transparent)] border-[var(--contact-border)] text-[var(--contact-text)] placeholder:text-[var(--contact-muted)]/70 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="company" className="text-xs text-[var(--contact-text)]">Εταιρεία</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => updateField("company", e.target.value)}
                              placeholder="Όνομα εταιρείας"
                              className="bg-[color-mix(in_srgb,var(--contact-surface)_86%,transparent)] border-[var(--contact-border)] text-[var(--contact-text)] placeholder:text-[var(--contact-muted)]/70 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs text-[var(--contact-text)]">E-mail *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => updateField("email", e.target.value)}
                              placeholder="email@example.com"
                              className="bg-[color-mix(in_srgb,var(--contact-surface)_86%,transparent)] border-[var(--contact-border)] text-[var(--contact-text)] placeholder:text-[var(--contact-muted)]/70 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="phone" className="text-xs text-[var(--contact-text)]">Τηλέφωνο</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => updateField("phone", e.target.value)}
                              placeholder="210 1234567"
                              className="bg-[color-mix(in_srgb,var(--contact-surface)_86%,transparent)] border-[var(--contact-border)] text-[var(--contact-text)] placeholder:text-[var(--contact-muted)]/70 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="subject" className="text-xs text-[var(--contact-text)]">Θέμα</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => updateField("subject", e.target.value)}
                            placeholder="π.χ. Αίτημα προσφοράς, Τεχνική ερώτηση..."
                            className="bg-[color-mix(in_srgb,var(--contact-surface)_86%,transparent)] border-[var(--contact-border)] text-[var(--contact-text)] placeholder:text-[var(--contact-muted)]/70 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="message" className="text-xs text-[var(--contact-text)]">Μήνυμα *</Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) => updateField("message", e.target.value)}
                            placeholder="Περιγράψτε το αίτημά σας, κωδικούς προϊόντων, ποσότητες..."
                            rows={3}
                            className="bg-[color-mix(in_srgb,var(--contact-surface)_86%,transparent)] border-[var(--contact-border)] text-[var(--contact-text)] placeholder:text-[var(--contact-muted)]/70 focus:border-[var(--theme-accent)] focus:ring-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] resize-none"
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

                        <p className="text-xs text-[var(--contact-muted)] text-center">
                          Με την αποστολή συμφωνείτε με την{" "}
                          <Link href="/privacy" className="underline hover:text-[var(--theme-accent)] transition-colors">
                            Πολιτική Απορρήτου
                          </Link>{" "}
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

      <section className="relative py-10 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--contact-text)] mb-1">Επισκεφθείτε μας</h2>
            <p className="text-sm text-[var(--contact-muted)]">Χρυσοστόμου Σμύρνης 26, Μοσχάτο 18344, Αθήνα</p>
          </div>

          <div className="rounded-xl overflow-hidden border border-[var(--contact-border)] shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3146.0458789285867!2d23.67820231531961!3d37.94829497972867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1bd5e5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sMoschato%2C%20Greece!5e0!3m2!1sen!2sgr!4v1234567890123!5m2!1sen!2sgr"
              title="Χάρτης τοποθεσίας AEROFREN - Μοσχάτο, Αθήνα"
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

      <section className="relative py-10 pb-16 z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] to-[var(--theme-accent-hover)] p-8 md:p-10 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] to-transparent animate-pulse" />

            <h2 className="relative text-2xl md:text-3xl font-bold text-white mb-3">
              Προτιμάτε να μιλήσετε απευθείας;
            </h2>
            <p className="relative text-lg text-white/85 mb-6">
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
