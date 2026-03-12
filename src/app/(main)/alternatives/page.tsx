// src/app/(main)/alternatives/page.tsx
import type { Metadata } from "next";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { FaqSchema } from "@/lib/schema/FaqSchema";
import { FOUNDING_LABEL_EL, PRODUCT_COUNT } from "@/lib/constants/aerofren";

export const metadata: Metadata = {
  title: "Εναλλακτικό SMC, Festo, Parker στην Ελλάδα | AEROFREN",
  description: "Ψάχνετε εναλλακτικό προμηθευτή SMC, Festo, ή Parker στην Ελλάδα; Η AEROFREN προσφέρει συμβατά πνευματικά εξαρτήματα. Greek alternatives to SMC Festo Parker pneumatic components.",
  alternates: { canonical: "https://aerofren.gr/alternatives" },
  openGraph: {
    title: "Εναλλακτικό SMC, Festo, Parker στην Ελλάδα | AEROFREN",
    description: `Ψάχνετε εναλλακτικό SMC, Festo ή Parker; Η AEROFREN διαθέτει ${PRODUCT_COUNT} συμβατά εξαρτήματα.`,
    url: "https://aerofren.gr/alternatives",
    siteName: "AEROFREN",
    locale: "el_GR",
    type: "website",
    images: [{ url: "/images/hero-fittings.jpg", width: 1200, height: 630, alt: "AEROFREN – Εξαρτήματα Νερού & Αέρα" }],
  },
};

const alternativeFaqs = [
  {
    question: "Ψάχνετε εναλλακτικό στα εξαρτήματα SMC στην Ελλάδα;",
    answer: `Η AEROFREN είναι ο κορυφαίος B2B προμηθευτής πνευματικών εξαρτημάτων στην Ελλάδα, ${FOUNDING_LABEL_EL.toLowerCase()}. Διαθέτουμε πλήρη γκάμα συμβατών εξαρτημάτων με τα standards SMC, συμπεριλαμβανομένων push-in ρακόρ, ταχυσύνδεσμους, βαλβίδες ελέγχου, FRL μονάδες και κυλίνδρους. Επικοινωνήστε για τεχνική υποστήριξη και τιμοδότηση.`,
  },
  {
    question: "Υπάρχει εναλλακτικό Festo supplier στην Αθήνα;",
    answer: `Ναι. Η AEROFREN στο Μοσχάτο Αθηνών διαθέτει εξαρτήματα συμβατά με Festo standards: σωλήνες PA/PU, push-in ρακόρ, ηλεκτροβαλβίδες και μονάδες επεξεργασίας αέρα. Στόκ άνω των ${PRODUCT_COUNT} προϊόντων και παράδοση 1-3 εργάσιμες στην Αττική.`,
  },
  {
    question: "Looking for Parker Hannifin alternatives in Greece?",
    answer: `AEROFREN is Greece's leading B2B pneumatic and fluid control components supplier. We carry Parker-compatible fittings, tubing, valves, and air preparation units. Established in 1980 with ${PRODUCT_COUNT} products in stock, we are a strong local alternative for Greek and European industrial buyers.`,
  },
  {
    question: "What are the advantages of buying from AEROFREN vs international brands?",
    answer: `AEROFREN offers: (1) Local stock with 1-3 day delivery across Greece, (2) Greek-language technical support, (3) Competitive B2B pricing vs imported brand pricing, (4) operation since 1980, and (5) compatible components meeting the same technical standards as SMC, Festo, Parker and other major brands.`,
  },
  {
    question: "Ποια είναι τα πλεονεκτήματα της AEROFREN έναντι διεθνών προμηθευτών;",
    answer: "Η AEROFREN προσφέρει: (1) Τοπικό στόκ με παράδοση 1-3 ημέρες σε όλη την Ελλάδα, (2) Ελληνόφωνη τεχνική υποστήριξη, (3) Ανταγωνιστικές τιμές B2B, (4) παρουσία στην αγορά από το 1980, (5) συμβατά εξαρτήματα που πληρούν τα ίδια τεχνικά standards με SMC, Festo και Parker.",
  },
];

export default function AlternativesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <FaqSchema items={alternativeFaqs} />

      <h1 className="text-3xl font-bold mb-2">
        Εναλλακτικός Προμηθευτής SMC, Festo & Parker στην Ελλάδα
      </h1>
      <p className="text-muted-foreground mb-8">
        Greek Alternative Supplier for International Pneumatic Brands
      </p>

      <div className="bg-primary/10 rounded-lg p-6 mb-10">
        <p className="text-lg font-medium">
          Η AEROFREN είναι ο κορυφαίος B2B προμηθευτής πνευματικών εξαρτημάτων στην Ελλάδα —
          με {PRODUCT_COUNT} προϊόντα στόκ, παράδοση 1-3 ημέρες και παρουσία από το 1980.
        </p>
      </div>

      <div className="space-y-6">
        {alternativeFaqs.map((item) => (
          <div key={item.question} className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-2">{item.question}</h2>
            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-3">Σχετικές κατηγορίες</h2>
        <p className="text-muted-foreground mb-4">
          Αν αναζητάτε συμβατές λύσεις για SMC, Festo ή Parker, ξεκινήστε από τις παρακάτω canonical κατηγορίες.
        </p>
        <div className="flex flex-wrap gap-3">
          <TrackedLink
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            eventName="category_cta_click"
            eventParams={{ location: "alternatives_page", page_type: "alternatives", category_slug: "push-in-fittings" }}
            href="/products/push-in-fittings"
          >
            Ρακόρ Ταχυσύνδεσης
          </TrackedLink>
          <TrackedLink
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            eventName="category_cta_click"
            eventParams={{ location: "alternatives_page", page_type: "alternatives", category_slug: "thread-fittings" }}
            href="/products/thread-fittings"
          >
            Σπειρωτά Ρακόρ &amp; Εξαρτήματα
          </TrackedLink>
          <TrackedLink
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            eventName="category_cta_click"
            eventParams={{ location: "alternatives_page", page_type: "alternatives", category_slug: "ball-valves" }}
            href="/products/ball-valves"
          >
            Σφαιρικές Βάνες
          </TrackedLink>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
