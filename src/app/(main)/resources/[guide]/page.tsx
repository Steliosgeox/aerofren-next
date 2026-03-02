// src/app/(main)/resources/[guide]/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleSchema } from "@/lib/schema/ArticleSchema";

interface GuidePageProps {
  params: Promise<{ guide: string }>;
}

const guides: Record<
  string,
  {
    title: string;
    description: string;
    content: string;
  }
> = {
  "odigos-epilogis-rakor": {
    title: "Οδηγός Επιλογής Πνευματικών Ρακόρ",
    description: "Πώς να επιλέξετε το σωστό τύπο ρακόρ για την εφαρμογή σας — push-in, compression, σπειρωτά.",
    content: `
## Βήμα 1: Ορίστε την εφαρμογή σας

Πριν επιλέξετε ρακόρ, απαντήστε:
- **Τι ρευστό;** Αέρας, νερό, λάδι, χημικό;
- **Ποια πίεση;** Έως 6 bar, 10 bar, ή 16+ bar;
- **Μόνιμη ή εύκολα αφαιρούμενη σύνδεση;**
- **Τι διάμετρος σωλήνα;** 4mm, 6mm, 8mm, 10mm, 12mm;

## Βήμα 2: Επιλογή τύπου ρακόρ

**Push-in (Ταχυσύνδεσμοι):**
Ιδανικά για πνευματικά συστήματα, αυτοματισμούς, και εφαρμογές που απαιτούν συχνή αποσύνδεση. Εγκατάσταση χωρίς εργαλεία. Πίεση έως 16 bar.

**Compression Fittings:**
Για μόνιμες εγκαταστάσεις υψηλής πίεσης, υδραυλικά, και εφαρμογές που απαιτούν μέγιστη ασφάλεια. Απαιτούν κλειδί για εγκατάσταση.

**Σπειρωτά (Threaded):**
Για σύνδεση σωλήνων με σπείρωμα. Τύποι BSP (G-thread) για ευρωπαϊκό εξοπλισμό, NPT για αμερικανικό.

## Βήμα 3: Επιλογή υλικού

| Υλικό | Κατάλληλο για | Αποφύγετε |
|-------|--------------|-----------|
| Πλαστικό (PA/POM) | Αέρας, νερό, γενική χρήση | Χημικά, υψηλή θερμοκρασία |
| Ορείχαλκος | Αέρας, νερό, λάδι | Θαλάσσιες εφαρμογές |
| Ανοξείδωτο (316L) | Τρόφιμα, χημικά, θάλασσα | Τίποτα — universal |

## Επικοινωνία για τεχνική υποστήριξη

Για εξειδικευμένη βοήθεια: **210 3461645** | info@aerofren.gr
    `,
  },
  "plastica-vs-oreichalkos-vs-anoxeidoto": {
    title: "Πλαστικά vs Ορείχαλκος vs Ανοξείδωτο: Πλήρης Σύγκριση",
    description: "Αναλυτική σύγκριση υλικών ρακόρ — πλαστικό, ορείχαλκος, ανοξείδωτο. Βρείτε το σωστό υλικό για κάθε εφαρμογή.",
    content: `
## Σύγκριση Υλικών Ρακόρ

### Πλαστικά Ρακόρ (PA / POM / PP)

**Πλεονεκτήματα:**
- Χαμηλότερο κόστος
- Ελαφριά κατασκευή
- Αντίσταση σε πολλά χημικά
- Εξαιρετική για πνευματικές εφαρμογές

**Μειονεκτήματα:**
- Χαμηλότερη μηχανική αντοχή
- Δεν κατάλληλο για υψηλές θερμοκρασίες (>80°C)
- Μπορεί να γίνει ψαθυρό με την πάροδο του χρόνου

**Ιδανικό για:** Πνευματικά συστήματα, αυτοματισμοί, γενική βιομηχανική χρήση

---

### Ορείχαλκος (Brass)

**Πλεονεκτήματα:**
- Εξαιρετική αντοχή σε πίεση
- Καλή θερμοκρασιακή αντίσταση (έως 120°C)
- Μεγαλύτερη διάρκεια ζωής από πλαστικό
- Κοινό και οικονομικό

**Μειονεκτήματα:**
- Μέτρια αντίσταση στη διάβρωση (αποφεύγετε θαλάσσια περιβάλλοντα)
- Δεν κατάλληλο για τρόφιμα/φαρμακευτική χρήση χωρίς επίστρωση

**Ιδανικό για:** Αέρας, νερό, λάδι, βιομηχανικές εφαρμογές γενικής χρήσης

---

### Ανοξείδωτο Ατσάλι (316L Stainless)

**Πλεονεκτήματα:**
- Ανώτατη αντίσταση στη διάβρωση
- Food-grade (κατάλληλο για τρόφιμα/ποτά)
- Αντέχει σε -200°C έως +400°C
- Κατάλληλο για θαλάσσιες εφαρμογές και χημικά

**Μειονεκτήματα:**
- Υψηλότερο κόστος
- Βαρύτερο από άλλα υλικά

**Ιδανικό για:** Τρόφιμα & ποτά, φαρμακευτική, χημική βιομηχανία, ναυτιλία, offshore

---

## Γρήγορος Οδηγός Επιλογής

| Εφαρμογή | Συνιστώμενο Υλικό |
|----------|------------------|
| Πνευματικά (αέρας) | Πλαστικό ή Ορείχαλκος |
| Νερό (βιομηχανικό) | Ορείχαλκος |
| Τρόφιμα & ποτά | Ανοξείδωτο 316L |
| Θάλασσα / Offshore | Ανοξείδωτο 316L |
| Χημικά | Ανοξείδωτο 316L ή PP |
| Υψηλή θερμοκρασία | Ανοξείδωτο ή Ορείχαλκος |
    `,
  },
  "sxediasmos-pneumatikoy-kyklomatos": {
    title: "Πώς να Σχεδιάσετε ένα Πνευματικό Κύκλωμα",
    description: "Βήμα-βήμα οδηγός σχεδίασης πνευματικού κυκλώματος — από τον αεροσυμπιεστή ώς τον ενεργοποιητή.",
    content: `
## Βασικές Αρχές Πνευματικού Κυκλώματος

Κάθε πνευματικό κύκλωμα αποτελείται από:

1. **Πηγή αέρα** — αεροσυμπιεστής
2. **Μονάδα προετοιμασίας (FRL)** — φίλτρο, ρυθμιστής, λιπαντήρας
3. **Κατεύθυνση ροής** — βαλβίδες κατεύθυνσης (directional control valves)
4. **Έλεγχος ταχύτητας** — βαλβίδες ροής (flow control valves)
5. **Ενεργοποιητής** — κύλινδρος ή στροφικός κινητήρας

## Βήμα 1: Υπολογισμός απαιτήσεων

Πριν σχεδιάσετε, ορίστε:
- **Δύναμη που απαιτείται** (N ή kg)
- **Ταχύτητα κίνησης** (mm/s)
- **Διαδρομή** (stroke) του κυλίνδρου (mm)
- **Κύκλοι ανά λεπτό**

## Βήμα 2: Επιλογή κυλίνδρου

Τύπος κυλίνδρου = Δύναμη / Πίεση
- Πίεση συστήματος: συνήθως 6-10 bar
- Προσθέστε 20% safety factor

## Βήμα 3: Μονάδα FRL

Τοποθετείτε πάντα FRL unit στην είσοδο:
- **Φίλτρο:** 40 micron για γενική χρήση, 5 micron για ευαίσθητες εφαρμογές
- **Ρυθμιστής:** ρυθμίστε 0.5-1 bar κάτω από max πίεση συστήματος
- **Λιπαντήρας:** χρησιμοποιείτε μόνο αν οι κύλινδροι/βαλβίδες το απαιτούν

## Βήμα 4: Σωλήνωση

- Διάμετρος σωλήνα ≥ flow requirement
- Ελαχιστοποιείτε κάμψεις και μήκη
- Χρησιμοποιείτε push-in ρακόρ για εύκολη εγκατάσταση

## Επικοινωνία για σχεδιασμό

Η AEROFREN παρέχει τεχνική υποστήριξη για σχεδίαση κυκλωμάτων:
**210 3461645** | info@aerofren.gr
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ guide: slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { guide: guideSlug } = await params;
  const guide = guides[guideSlug];
  if (!guide) return { title: "Οδηγός δεν βρέθηκε | AEROFREN" };
  return {
    title: `${guide.title} | AEROFREN`,
    description: guide.description,
    alternates: { canonical: `https://aerofren.gr/resources/${guideSlug}` },
    openGraph: {
      title: `${guide.title} | AEROFREN`,
      description: guide.description,
      url: `https://aerofren.gr/resources/${guideSlug}`,
      siteName: "AEROFREN",
      locale: "el_GR",
      type: "article",
      images: [{ url: "/images/hero-fittings.jpg", width: 1200, height: 630, alt: "AEROFREN – Εξαρτήματα Νερού & Αέρα" }],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { guide: guideSlug } = await params;
  const guide = guides[guideSlug];
  const nonce = (await headers()).get("x-nonce");
  if (!guide) notFound();
  const lineOccurrences = new Map<string, number>();
  const keyedLines = guide.content.split("\n").map((line) => {
    const nextOccurrence = (lineOccurrences.get(line) ?? 0) + 1;
    lineOccurrences.set(line, nextOccurrence);
    return {
      line,
      key: `line-${nextOccurrence}-${line.trim().slice(0, 40)}`,
    };
  });

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <ArticleSchema
        title={guide.title}
        description={guide.description}
        url={`https://aerofren.gr/resources/${guideSlug}`}
        datePublished="2026-02-27"
        dateModified="2026-02-27"
        nonce={nonce}
      />

      <h1 className="text-3xl font-bold mb-4">{guide.title}</h1>
      <p className="text-muted-foreground mb-8">{guide.description}</p>

      <div className="prose prose-invert max-w-none">
        {keyedLines.map(({ line, key }) => {
          if (line.startsWith("## ")) {
            return <h2 key={key} className="text-2xl font-bold mt-8 mb-4">{line.slice(3)}</h2>;
          }
          if (line.startsWith("### ")) {
            return <h3 key={key} className="text-xl font-semibold mt-6 mb-3">{line.slice(4)}</h3>;
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return <p key={key} className="font-semibold mt-4">{line.slice(2, -2)}</p>;
          }
          if (line.startsWith("- ")) {
            return <li key={key} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
          }
          if (line.startsWith("|")) {
            return null; // tables rendered as plain text for now
          }
          if (line === "---") {
            return <hr key={key} className="my-6 border-border" />;
          }
          if (line.trim() === "") {
            return <br key={key} />;
          }
          return <p key={key} className="text-muted-foreground leading-relaxed">{line}</p>;
        })}
      </div>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
