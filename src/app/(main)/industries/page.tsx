import type { Metadata } from "next";
import { ItemListSchema } from "@/lib/schema/ItemListSchema";
import { SITE_URL } from "@/lib/constants/aerofren";

export const metadata: Metadata = {
  title: "Κλάδοι που Εξυπηρετούμε | AEROFREN",
  description: "AEROFREN εξυπηρετεί βιομηχανία, αγροτικό τομέα, τρόφιμα & ποτά, κατασκευές, ναυτιλία. Industrial pneumatic and water systems for every sector.",
  alternates: { canonical: "https://aerofren.gr/industries" },
  openGraph: {
    title: "Κλάδοι που Εξυπηρετούμε | AEROFREN",
    description: "Πνευματικά εξαρτήματα για βιομηχανία, αγροτικό τομέα, τρόφιμα, κατασκευές, ναυτιλία.",
    url: "https://aerofren.gr/industries",
    siteName: "AEROFREN",
    locale: "el_GR",
    type: "website",
    images: [{ url: "/images/hero-fittings.jpg", width: 1200, height: 630, alt: "AEROFREN – Εξαρτήματα Νερού & Αέρα" }],
  },
};

const industries = [
  {
    name: "Βιομηχανία & Αυτοματισμός",
    nameEn: "Manufacturing & Automation",
    description: "Πνευματικά εξαρτήματα για γραμμές παραγωγής, ρομποτικά συστήματα, και βιομηχανικούς αυτοματισμούς.",
    products: ["Push-in ρακόρ", "Κύλινδροι", "Ηλεκτροβαλβίδες", "FRL μονάδες"],
  },
  {
    name: "Αγροτικός Τομέας",
    nameEn: "Agriculture",
    description: "Εξαρτήματα άρδευσης, υδροδότησης, και πνευματικών συστημάτων για αγροτικές εγκαταστάσεις.",
    products: ["Σωλήνες PE", "Ρακόρ νερού", "Βαλβίδες", "Συνδετήρες"],
  },
  {
    name: "Τρόφιμα & Ποτά",
    nameEn: "Food & Beverage",
    description: "Food-grade πνευματικά εξαρτήματα από ανοξείδωτο ατσάλι και εγκεκριμένα υλικά για βιομηχανίες τροφίμων.",
    products: ["Inox ρακόρ", "Food-grade σωλήνες", "Βαλβίδες inox"],
  },
  {
    name: "Κατασκευές",
    nameEn: "Construction",
    description: "Εξαρτήματα για πνευματικά εργαλεία, συστήματα αέρα, και υδραυλικές εγκαταστάσεις σε κατασκευαστικά έργα.",
    products: ["Ταχυσύνδεσμοι", "Σωλήνες υψηλής πίεσης", "Ρυθμιστές πίεσης"],
  },
  {
    name: "Ναυτιλία & Offshore",
    nameEn: "Marine & Offshore",
    description: "Ανθεκτικά εξαρτήματα για θαλάσσιες εφαρμογές με αντίσταση στη διάβρωση από αλατόνερο.",
    products: ["Marine-grade inox", "Ρακόρ ανθεκτικά σε αλάτι"],
  },
];

export default function IndustriesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <ItemListSchema
        name="Κλάδοι που Εξυπηρετεί η AEROFREN"
        description="B2B πνευματικά εξαρτήματα και συστήματα νερού για βιομηχανία, αγροτικό τομέα, τρόφιμα, κατασκευές, ναυτιλία."
        url={`${SITE_URL}/industries`}
        items={industries.map((ind) => ({
          name: ind.name,
          url: `${SITE_URL}/products`,
          description: ind.description,
        }))}
      />
      <h1 className="text-3xl font-bold mb-2">Κλάδοι που Εξυπηρετούμε</h1>
      <p className="text-muted-foreground mb-8">Industries We Serve</p>

      <div className="grid md:grid-cols-2 gap-6">
        {industries.map((industry) => (
          <div key={industry.name} className="border rounded-lg p-6">
            <h2 className="font-semibold text-xl mb-1">{industry.name}</h2>
            <p className="text-sm text-primary mb-3">{industry.nameEn}</p>
            <p className="text-muted-foreground mb-4">{industry.description}</p>
            <ul className="text-sm space-y-1">
              {industry.products.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="text-primary">→</span> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
