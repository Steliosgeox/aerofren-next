// src/app/(main)/glossary/page.tsx
import type { Metadata } from "next";
import { GlossarySchema } from "@/lib/schema/GlossarySchema";

export const metadata: Metadata = {
  title: "Γλωσσάριο Πνευματικών Εξαρτημάτων | AEROFREN",
  description: "Πλήρες γλωσσάριο τεχνικών όρων για πνευματικά συστήματα, ρακόρ, βαλβίδες. Technical glossary for pneumatic fittings, valves, and industrial systems.",
  alternates: { canonical: "https://aerofren.gr/glossary" },
};

const terms = [
  { name: "Ρακόρ (Fitting)", alternateName: "Fitting", description: "Εξάρτημα σύνδεσης δύο ή περισσότερων σωλήνων ή αγωγών. Υπάρχουν διάφοροι τύποι: push-in, σπειρωτά, συμπίεσης (compression)." },
  { name: "Push-in Ρακόρ", alternateName: "Push-to-Connect Fitting", description: "Εξάρτημα σύνδεσης σωλήνα χωρίς εργαλεία. Ο σωλήνας εισάγεται απευθείας και κλειδώνει με εσωτερικό συνδετήρα (collet). Για αποσύνδεση πατάμε το δακτύλιο απελευθέρωσης." },
  { name: "Compression Fitting", alternateName: "Ρακόρ Συμπίεσης", description: "Εξάρτημα που χρησιμοποιεί δακτύλιο (ferrule) συμπιεσμένο από παξιμάδι για στεγανή σύνδεση. Ιδανικό για υψηλές πιέσεις και μόνιμες εγκαταστάσεις." },
  { name: "FRL Unit", alternateName: "Μονάδα Προετοιμασίας Αέρα", description: "Σύνολο Filter-Regulator-Lubricator. Φίλτρο αέρα, ρυθμιστής πίεσης, και λιπαντήρας σε ένα σύστημα. Εγκαθίσταται στην είσοδο πνευματικού συστήματος." },
  { name: "Βαλβίδα Ελέγχου Ροής", alternateName: "Flow Control Valve", description: "Βαλβίδα που ρυθμίζει την ταχύτητα ροής αέρα σε πνευματικό κύκλωμα, ελέγχοντας έτσι την ταχύτητα ενός κυλίνδρου ή άλλου ενεργοποιητή." },
  { name: "Πνευματικός Κύλινδρος", alternateName: "Pneumatic Cylinder / Actuator", description: "Ενεργοποιητής που μετατρέπει την πίεση αέρα σε γραμμική κίνηση. Διαθέτει έμβολο (piston) που κινείται εντός κυλινδρικού σώματος." },
  { name: "Ρυθμιστής Πίεσης", alternateName: "Pressure Regulator", description: "Συσκευή που διατηρεί σταθερή πίεση εξόδου ανεξάρτητα από διακυμάνσεις στην είσοδο. Απαραίτητος για την προστασία ευαίσθητων εξαρτημάτων." },
  { name: "Ταχυσύνδεσμος", alternateName: "Quick Connect / Quick Coupler", description: "Εξάρτημα που επιτρέπει γρήγορη σύνδεση/αποσύνδεση εύκαμπτων σωλήνων υπό πίεση. Χρησιμοποιείται σε αεροσυμπιεστές, πνευματικά εργαλεία." },
  { name: "Σωλήνας Πολυαιθυλενίου (PU/PA)", alternateName: "Polyurethane / Polyamide Tube", description: "Εύκαμπτος σωλήνας πνευματικών εφαρμογών από polyurethane (PU) ή polyamide (PA/nylon). Διατίθεται σε διάφορες διαμέτρους και χρώματα." },
  { name: "Πίεση Λειτουργίας (MAP)", alternateName: "Maximum Allowable Pressure", description: "Η μέγιστη ασφαλής πίεση λειτουργίας ενός εξαρτήματος. Πάντα να μην υπερβαίνετε το MAP που αναγράφεται στα τεχνικά χαρακτηριστικά." },
  { name: "Solenoid Valve", alternateName: "Ηλεκτροβαλβίδα", description: "Ηλεκτρομαγνητικά ελεγχόμενη βαλβίδα που ανοίγει/κλείνει με ηλεκτρικό σήμα. Χρησιμοποιείται για αυτοματισμό κυκλωμάτων αέρα ή νερού." },
  { name: "Air Preparation Unit", alternateName: "Μονάδα Προετοιμασίας Αέρα", description: "Γενικός όρος για εξαρτήματα που βελτιώνουν την ποιότητα πεπιεσμένου αέρα: φίλτρα, ρυθμιστές πίεσης, λιπαντήρες, αφυγραντήρες." },
  { name: "Ferrule", alternateName: "Δακτύλιος Συμπίεσης", description: "Μεταλλικός δακτύλιος που χρησιμοποιείται στα compression fittings. Συμπιέζεται γύρω από τον σωλήνα για να δημιουργήσει στεγανή σύνδεση." },
  { name: "Collet", alternateName: "Συνδετήρας Push-in", description: "Ο εσωτερικός μηχανισμός κράτησης στα push-in ρακόρ. Δαντελωτός δακτύλιος που κλειδώνει τον σωλήνα και αποτρέπει την αποσύνδεση υπό πίεση." },
  { name: "Manifold", alternateName: "Πολλαπλή Σύνδεση", description: "Μπλοκ διανομής που επιτρέπει σύνδεση πολλαπλών γραμμών σε ένα κεντρικό σημείο. Χρησιμοποιείται για οργάνωση πνευματικών κυκλωμάτων." },
  { name: "BSP Thread", alternateName: "Σπείρωμα BSP / BSPP", description: "British Standard Pipe thread — το πιο κοινό σύστημα σπειρωμάτων για υδραυλικά και πνευματικά εξαρτήματα στην Ευρώπη. Γνωστό και ως G-thread." },
  { name: "NPT Thread", alternateName: "Σπείρωμα NPT", description: "National Pipe Tapered thread — αμερικανικό σύστημα σπειρωμάτων. Δεν είναι συμβατό με BSP χωρίς adapter. Συνηθισμένο σε εισαγόμενο εξοπλισμό." },
  { name: "Pressure Drop", alternateName: "Πτώση Πίεσης", description: "Μείωση πίεσης κατά τη ροή αέρα ή υγρού μέσα από εξάρτημα ή σωλήνα. Υπολογίζεται για κάθε σύστημα ώστε να εξασφαλιστεί επαρκής πίεση στο τελικό σημείο." },
  { name: "Flow Rate", alternateName: "Παροχή / Ροή", description: "Ο ρυθμός ροής αέρα ή υγρού, συνήθως μετρούμενος σε l/min (λίτρα/λεπτό) ή m³/h. Κρίσιμος παράμετρος για επιλογή βαλβίδων και σωλήνων." },
  { name: "Working Pressure", alternateName: "Πίεση Εργασίας", description: "Η κανονική πίεση λειτουργίας ενός συστήματος ή εξαρτήματος. Πρέπει πάντα να παραμένει κάτω από τη μέγιστη επιτρεπόμενη πίεση (MAP)." },
];

export default function GlossaryPage() {
  const sortedTerms = [...terms].sort((a, b) => a.name.localeCompare(b.name, "el"));

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <GlossarySchema terms={terms} />

      <h1 className="text-3xl font-bold mb-2">Γλωσσάριο Τεχνικών Όρων</h1>
      <p className="text-muted-foreground mb-8">
        Technical Glossary — Ορισμοί εξαρτημάτων πνευματικών συστημάτων & νερού
      </p>

      <dl className="grid gap-6">
        {sortedTerms.map((term, i) => (
          <div key={i} id={term.name.toLowerCase().replace(/\s+/g, "-")} className="border-b pb-4">
            <dt className="font-semibold text-lg">{term.name}</dt>
            {term.alternateName && (
              <span className="text-sm text-primary">{term.alternateName}</span>
            )}
            <dd className="mt-1 text-muted-foreground leading-relaxed">{term.description}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
