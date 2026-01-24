"use client";

import { useState } from "react";
import { X, Send, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productSku?: string;
  categoryName?: string;
}

export function QuoteModal({
  isOpen,
  onClose,
  productName,
  productSku,
  categoryName,
}: QuoteModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: productName
      ? `Ενδιαφέρομαι για: ${productName}${productSku ? ` (${productSku})` : ""}`
      : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--theme-bg-solid)_70%,transparent)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--theme-bg-solid)] rounded-2xl border border-[var(--theme-glass-border)] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--theme-bg-solid)] border-b border-[var(--theme-glass-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-text)]">Ζητήστε Προσφορά</h2>
            {categoryName && (
              <p className="text-sm text-[var(--theme-text-muted)]">{categoryName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--theme-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-[var(--theme-text)] mb-2">
                Ευχαριστούμε!
              </h3>
              <p className="text-[var(--theme-text-muted)]">
                Το αίτημά σας καταχωρήθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας
                σύντομα.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {productName && (
                <div className="bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] rounded-xl p-4 border border-[var(--theme-glass-border)]">
                  <span className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">
                    Προϊόν
                  </span>
                  <p className="font-medium text-[var(--theme-text)] mt-1">{productName}</p>
                  {productSku && (
                    <p className="text-sm text-[var(--theme-text-muted)]">Κωδικός: {productSku}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote-name">Ονοματεπώνυμο *</Label>
                  <Input
                    id="quote-name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Γιάννης Παπαδόπουλος"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-company">Εταιρεία</Label>
                  <Input
                    id="quote-company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Όνομα εταιρείας"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote-email">Email *</Label>
                  <Input
                    id="quote-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-phone">Τηλέφωνο</Label>
                  <Input
                    id="quote-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="210 1234567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote-message">Μήνυμα / Ποσότητες</Label>
                <Textarea
                  id="quote-message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Περιγράψτε τι χρειάζεστε, ποσότητες, ερωτήσεις..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                      <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[color-mix(in_srgb,var(--theme-text)_30%,transparent)] border-t-white rounded-full animate-spin" />
                      Αποστολή...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Αποστολή Αιτήματος
                    </span>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <p className="text-sm text-[var(--theme-text-muted)]">
                  ή καλέστε μας απευθείας στο{" "}
                  <a
                    href="tel:2103461645"
                    className="font-bold text-[var(--theme-accent)] hover:underline"
                  >
                    210 3461645
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
