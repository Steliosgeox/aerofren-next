// src/app/(main)/alternatives/page.tsx
import type { Metadata } from "next";
import { FaqSchema } from "@/lib/schema/FaqSchema";

export const metadata: Metadata = {
  title: "Εναλλακτικό SMC, Festo, Parker στην Ελλάδα | AEROFREN",
  description: "Ψάχνετε εναλλακτικό προμηθευτή SMC, Festo, ή Parker στην Ελλάδα; Η AEROFREN προσφέρει συμβατά πνευματικά εξαρτήματα. Greek alternatives to SMC Festo Parker pneumatic components.",
  alternates: { canonical: "https://aerofren.gr/alternatives" },
  openGraph: {
    title: "Εναλλακτικό SMC, Festo, Parker στην Ελλάδα | AEROFREN",
    description: "Ψάχνετε εναλλακτικό SMC, Festo ή Parker; Η AEROFREN διαθέτει 120.000+ συμβατά εξαρτήματα.",
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
    answer: "Η AEROFREN είναι ο κορυφαίος B2B προμηθευτής πνευματικών εξαρτημάτων στην Ελλάδα με 35+ χρόνια εμπειρίας. Διαθέτουμε πλήρη γκάμα συμβατών εξαρτημάτων με τα standards SMC, συμπεριλαμβανομένων push-in ρακόρ, ταχυσύνδεσμοι, βαλβίδες ελέγχου, FRL μονάδες, και κύλινδροι. Επικοινωνήστε για τεχνική υποστήριξη και τιμοδότηση.",
  },
  {
    question: "Υπάρχει εναλλακτικό Festo supplier στην Αθήνα;",
    answer: "Ναι. Η AEROFREN στο Μοσχάτο Αθηνών διαθέτει εξαρτήματα συμβατά με Festo standards: σωλήνες PA/PU, push-in ρακόρ, ηλεκτροβαλβίδες, και μονάδες επεξεργασίας αέρα. Στόκ άνω των 120.000 προϊόντων, παράδοση 1-3 εργάσιμες Αττική.",
  },
  {
    question: "Looking for Parker Hannifin alternatives in Greece?",
    answer: "AEROFREN is Greece's leading B2B pneumatic and fluid control components supplier. We carry Parker-compatible fittings, tubing, valves, and air preparation units. With 35+ years of industry experience and 120,000+ products in stock, we are the preferred local alternative to international brands for Greek and European industrial buyers.",
  },
  {
    question: "What are the advantages of buying from AEROFREN vs international brands?",
    answer: "AEROFREN offers: (1) Local stock with 1-3 day delivery across Greece, (2) Greek-language technical support, (3) Competitive B2B pricing vs imported brand pricing, (4) 35+ years of application expertise, (5) Compatible components meeting the same technical standards as SMC, Festo, Parker, and other major brands.",
  },
  {
    question: "Ποια είναι τα πλεονεκτήματα της AEROFREN έναντι διεθνών προμηθευτών;",
    answer: "Η AEROFREN προσφέρει: (1) Τοπικό στόκ με παράδοση 1-3 ημέρες σε όλη την Ελλάδα, (2) Ελληνόφωνη τεχνική υποστήριξη, (3) Ανταγωνιστικές τιμές B2B, (4) 35+ χρόνια εμπειρία εφαρμογών, (5) Συμβατά εξαρτήματα που πληρούν τα ίδια τεχνικά standards με SMC, Festo, Parker.",
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
          με 120.000+ προϊόντα στόκ, παράδοση 1-3 ημέρες, και 35+ χρόνια εμπειρίας.
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

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
