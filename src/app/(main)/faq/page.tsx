// src/app/(main)/faq/page.tsx
import type { Metadata } from "next";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { FaqSchema } from "@/lib/schema/FaqSchema";
import {
  BUSINESS_ADDRESS_FULL_EL,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_WEEKDAY_HOURS_EL,
} from "@/lib/constants/aerofren";

export const metadata: Metadata = {
  title: "Συχνές Ερωτήσεις | AEROFREN",
  description: "Απαντήσεις στις πιο συχνές ερωτήσεις για πνευματικά εξαρτήματα, ρακόρ, βαλβίδες και συστήματα νερού. FAQ for pneumatic fittings, valves, and water systems.",
  alternates: { canonical: "https://aerofren.gr/faq" },
  openGraph: {
    title: "Συχνές Ερωτήσεις | AEROFREN",
    description: "Απαντήσεις στις πιο συχνές ερωτήσεις για πνευματικά εξαρτήματα, ρακόρ, βαλβίδες.",
    url: "https://aerofren.gr/faq",
    siteName: "AEROFREN",
    locale: "el_GR",
    type: "website",
    images: [{ url: "/images/hero-fittings.jpg", width: 1200, height: 630, alt: "AEROFREN – Εξαρτήματα Νερού & Αέρα" }],
  },
};

const faqItems: Array<{ question: string; answer: string; lang: "el" | "en" }> = [
  // GREEK SECTION
  {
    lang: "el",
    question: "Τι είναι τα push-in ρακόρ και πού χρησιμοποιούνται;",
    answer: "Τα push-in ρακόρ (ή ταχυσύνδεσμοι) είναι εξαρτήματα σύνδεσης σωλήνων που επιτρέπουν γρήγορη εγκατάσταση χωρίς εργαλεία — απλά ωθείτε τον σωλήνα μέσα. Χρησιμοποιούνται εκτενώς σε πνευματικά συστήματα, αυτοματισμούς, και βιομηχανικές εφαρμογές. Η AEROFREN διαθέτει πλαστικά, ορείχαλκα, και ανοξείδωτα push-in ρακόρ για πίεση έως 16 bar.",
  },
  {
    lang: "el",
    question: "Ποια η διαφορά μεταξύ ορείχαλκου και ανοξείδωτου ρακόρ;",
    answer: "Τα ορείχαλκα ρακόρ είναι οικονομικά, ανθεκτικά στην πίεση και κατάλληλα για γενική χρήση. Τα ανοξείδωτα (inox) ρακόρ έχουν ανώτερη αντίσταση στη διάβρωση και υψηλές θερμοκρασίες — ιδανικά για τρόφιμα, ποτά, χημικά, και παράκτιες εγκαταστάσεις. Η AEROFREN διαθέτει και τα δύο υλικά σε πλήρη γκάμα μεγεθών.",
  },
  {
    lang: "el",
    question: "Τι πίεση αντέχουν τα πνευματικά εξαρτήματα της AEROFREN;",
    answer: "Η τυπική γκάμα λειτουργεί σε πίεση 0-16 bar. Ορισμένες κατηγορίες (υψηλής πίεσης ρυθμιστές, ειδικοί κύλινδροι) φτάνουν έως 40 bar. Κάθε προϊόν φέρει τη μέγιστη επιτρεπόμενη πίεση λειτουργίας (MAP) στα τεχνικά χαρακτηριστικά του.",
  },
  {
    lang: "el",
    question: "Η AEROFREN εξυπηρετεί μόνο επαγγελματίες ή και ιδιώτες;",
    answer: "Η AEROFREN είναι αποκλειστικά B2B (business-to-business) προμηθευτής. Εξυπηρετούμε επαγγελματίες, εταιρείες, τεχνικούς, και κατασκευαστές. Για αγορά απαιτείται επαγγελματικό προφίλ.",
  },
  {
    lang: "el",
    question: "Ποιες μάρκες διαθέτει η AEROFREN;",
    answer: "Η AEROFREN αντιπροσωπεύει ή είναι συμβατή με τις κορυφαίες μάρκες πνευματικών συστημάτων παγκοσμίως. Διαθέτουμε εξαρτήματα συμβατά με SMC, Festo, Parker Hannifin, και άλλους κατασκευαστές, καθώς και premium ανεξάρτητες γκάμες.",
  },
  {
    lang: "el",
    question: "Πού βρίσκεται η AEROFREN και πώς μπορώ να επικοινωνήσω;",
    answer: `Τα κεντρικά γραφεία και η αποθήκη βρίσκονται στη διεύθυνση ${BUSINESS_ADDRESS_FULL_EL}. Τηλέφωνο: ${BUSINESS_PHONE_DISPLAY}. Email: ${BUSINESS_EMAIL}. ${BUSINESS_WEEKDAY_HOURS_EL}.`,
  },
  {
    lang: "el",
    question: "Τι είναι η FRL μονάδα σε πνευματικό σύστημα;",
    answer: "FRL σημαίνει Filter-Regulator-Lubricator (Φίλτρο-Ρυθμιστής-Λιπαντήρας). Είναι η βασική μονάδα προετοιμασίας αέρα που εγκαθίσταται στην είσοδο κάθε πνευματικού συστήματος: καθαρίζει τον αέρα, ρυθμίζει την πίεση, και λιπαίνει τα κινούμενα μέρη για μεγαλύτερη διάρκεια ζωής.",
  },
  {
    lang: "el",
    question: "Ποιος είναι ο χρόνος παράδοσης;",
    answer: "Τα διαθέσιμα προϊόντα παραδίδονται σε 1-3 εργάσιμες ημέρες στην Αττική. Εξωτερικοί νομοί: 2-5 εργάσιμες. Για παραγγελίες εκτός αποθέματος ή ειδικές προδιαγραφές, επικοινωνήστε για ενημέρωση.",
  },
  // ENGLISH SECTION
  {
    lang: "en",
    question: "What is a push-in fitting and how does it work?",
    answer: "A push-in fitting (also called a push-to-connect or instant fitting) is a tube connector that requires no tools — you simply push the tube into the fitting body and a collet grips it securely. To release, press the release button and pull. Push-in fittings are used extensively in pneumatic systems, automation, and industrial plumbing. AEROFREN offers plastic, brass, and stainless steel push-in fittings for pressures up to 16 bar.",
  },
  {
    lang: "en",
    question: "What is the difference between push-in and compression fittings?",
    answer: "Push-in (push-to-connect) fittings use an internal collet mechanism for tool-free installation — ideal for pneumatics and automation. Compression fittings use a ferrule compressed by a nut against the tube, creating a leak-proof seal — ideal for hydraulics, high-pressure, and permanent installations. Compression fittings are generally stronger but take longer to install.",
  },
  {
    lang: "en",
    question: "What is an FRL unit in pneumatics?",
    answer: "An FRL unit (Filter-Regulator-Lubricator) is the air preparation assembly installed at the inlet of a pneumatic system. The Filter removes moisture and particulates, the Regulator controls supply pressure, and the Lubricator adds a fine oil mist to protect downstream actuators and valves. AEROFREN supplies complete FRL units and individual components from leading manufacturers.",
  },
  {
    lang: "en",
    question: "Do you ship internationally?",
    answer: "AEROFREN primarily serves the Greek market and EU buyers. For international orders, please contact us directly at aerofren@gmail.com with your requirements and we will provide a quotation including shipping.",
  },
];

export default function FaqPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <FaqSchema items={faqItems} />

      <h1 className="text-3xl font-bold mb-2">Συχνές Ερωτήσεις</h1>
      <p className="text-muted-foreground mb-8">
        Frequently Asked Questions — Απαντήσεις στις πιο συχνές ερωτήσεις
      </p>

      {/* Greek Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-primary">Ελληνικά</h2>
        <div className="space-y-6">
          {faqItems.filter((item) => item.lang === "el").map((item) => (
            <div key={item.question} className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-3">Σχετικές κατηγορίες</h2>
        <p className="text-muted-foreground mb-4">
          Για τις πιο συχνές ερωτήσεις γύρω από ρακόρ, βάνες και επεξεργασία νερού, δείτε τις παρακάτω landing pages.
        </p>
        <div className="flex flex-wrap gap-3">
          <TrackedLink
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            eventName="category_cta_click"
            eventParams={{ location: "faq_page", page_type: "faq", category_slug: "push-in-fittings" }}
            href="/products/push-in-fittings"
          >
            Ρακόρ Ταχυσύνδεσης
          </TrackedLink>
          <TrackedLink
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            eventName="category_cta_click"
            eventParams={{ location: "faq_page", page_type: "faq", category_slug: "ball-valves" }}
            href="/products/ball-valves"
          >
            Σφαιρικές Βάνες
          </TrackedLink>
          <TrackedLink
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            eventName="category_cta_click"
            eventParams={{ location: "faq_page", page_type: "faq", category_slug: "water-filtration" }}
            href="/products/water-filtration"
          >
            Φίλτρανση &amp; Επεξεργασία Νερού
          </TrackedLink>
        </div>
      </section>

      {/* English Section */}
      <section>
        <h2 className="text-xl font-semibold mb-6 text-primary">English</h2>
        <div className="space-y-6">
          {faqItems.filter((item) => item.lang === "en").map((item) => (
            <div key={item.question} className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026 · Last updated: February 2026
      </p>
    </main>
  );
}
