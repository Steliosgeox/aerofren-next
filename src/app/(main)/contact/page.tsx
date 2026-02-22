"use client";

import { ContactCallToAction } from "@/components/contact/ContactCallToAction";
import { ContactFormPanel } from "@/components/contact/ContactFormPanel";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactInfoPanel } from "@/components/contact/ContactInfoPanel";
import { ContactMapCard } from "@/components/contact/ContactMapCard";

export default function ContactPage() {
  const glowColor = "var(--theme-accent-rgb)";

  return (
    <div className="min-h-screen text-[var(--contact-text)]">
      <ContactHero />

      <section className="relative py-6 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
            <ContactInfoPanel glowColor={glowColor} />
            <ContactFormPanel />
          </div>
        </div>
      </section>

      <ContactMapCard />
      <ContactCallToAction />
    </div>
  );
}
