export interface ProductShowcaseItem {
  id: string;
  slug: string;
  nameEl: string;
  image: string;
  tagEl: string;
  summaryEl: string;
  highlightsEl: [string, string, string];
}

export const productShowcaseItems: ProductShowcaseItem[] = [
  {
    id: "solines-inox-thermou-aera",
    slug: "solines-inox-thermou-aera",
    nameEl: "ΣΩΛΗΝΕΣ ΙΝΟΧ ΘΕΡΜΟΥ ΑΕΡΑ",
    image: "/images/new-categories/ΣΩΛΗΝΕΣ_ΙΝΟΧ_ΘΕΡΜΟΥ_ΑΕΡΑ.webp",
    tagEl: "Θερμική Αντοχή",
    summaryEl:
      "Ανοξείδωτοι σωλήνες υψηλής αντοχής για απαιτητικά δίκτυα θερμού αέρα. Εξασφαλίζουν σταθερή ροή, μέγιστη θερμική αντοχή και κορυφαία βιομηχανική αξιοπιστία.",
    highlightsEl: [
      "Για απαιτητικές θερμοκρασίες λειτουργίας",
      "Αντοχή σε βιομηχανική καταπόνηση",
      "Αξιόπιστη επιλογή για σταθερές εγκαταστάσεις",
    ],
  },
  {
    id: "pollapla-stirigmata",
    slug: "pollapla-stirigmata",
    nameEl: "ΠΟΛΛΑΠΛΑ ΣΤΗΡΙΓΜΑΤΑ",
    image: "/images/new-categories/ΠΟΛΛΑΠΛΑ_ΣΤΗΡΙΓΜΑΤΑ.webp",
    tagEl: "Οργάνωση Δικτύου",
    summaryEl:
      "Ολοκληρωμένα συστήματα στήριξης για οργανωμένα και ασφαλή βιομηχανικά δίκτυα. Προσφέρουν σταθερότητα και ευκολία στη συντήρηση ακόμα και στις πιο απαιτητικές διαδρομές.",
    highlightsEl: [
      "Καθαρή στήριξη πολλαπλών γραμμών",
      "Βελτιώνει την τάξη της εγκατάστασης",
      "Μειώνει πρόχειρες πατέντες στο πεδίο",
    ],
  },
  {
    id: "mproutzina-taf",
    slug: "mproutzina-taf",
    nameEl: "ΜΠΡΟΥΤΖΙΝΑ ΤΑΦ",
    image: "/images/new-categories/ΜΠΡΟΥΤΖΙΝΑ_ΤΑΦ.webp",
    tagEl: "Σύνδεση Ροής",
    summaryEl:
      "Ορειχάλκινα εξαρτήματα (ταφ) βαρέως τύπου για ασφαλείς διακλαδώσεις. Σχεδιασμένα για μακροχρόνια αντοχή στις πιέσεις και βέλτιστη μηχανική συμπεριφορά.",
    highlightsEl: [
      "Σταθερές διακλαδώσεις χωρίς συμβιβασμούς",
      "Σώμα με βιομηχανική αίσθηση και αντοχή",
      "Κατάλληλα για καθαρές και σοβαρές συνδέσεις",
    ],
  },
  {
    id: "koftis",
    slug: "koftis",
    nameEl: "ΚΟΦΤΗΣ",
    image: "/images/new-categories/ΚΟΦΤΗΣ.webp",
    tagEl: "Εργαλείο Ακρίβειας",
    summaryEl:
      "Επαγγελματικά εργαλεία κοπής σωλήνων για απόλυτη ακρίβεια. Εξασφαλίζουν καθαρές τομές χωρίς γρέζια, προετοιμάζοντας τέλεια τη σύνδεση για κάθε δίκτυο.",
    highlightsEl: [
      "Καθαρό τελείωμα στην κοπή",
      "Καλύτερη προετοιμασία για τοποθέτηση",
      "Λιγότερα λάθη στο στάδιο της συναρμολόγησης",
    ],
  },
  {
    id: "thermosystellomena",
    slug: "thermosystellomena",
    nameEl: "ΘΕΡΜΟΣΥΣΤΕΛΛΟΜΕΝΑ",
    image: "/images/new-categories/ΘΕΡΜΟΣΥΣΤΕΛΛΟΜΕΝΑ.webp",
    tagEl: "Προστασία",
    summaryEl:
      "Θερμοσυστελλόμενα υλικά κορυφαίας ποιότητας για μόνωση και προστασία. Διασφαλίζουν στεγανότητα και επαγγελματικό φινίρισμα στις ευαίσθητες συνδέσεις.",
    highlightsEl: [
      "Ενισχύει την προστασία της σύνδεσης",
      "Αναβαθμίζει το τελικό φινίρισμα",
      "Χρήσιμο σε απαιτημένα τεχνικά σημεία",
    ],
  },
  {
    id: "epexergasia-nerou",
    slug: "epexergasia-nerou",
    nameEl: "ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ",
    image: "/images/new-categories/ΕΠΕΞΕΡΓΑΣΙΑ_ΝΕΡΟΥ.webp",
    tagEl: "Καθαρότητα Δικτύου",
    summaryEl:
      "Εξειδικευμένος εξοπλισμός επεξεργασίας και φίλτρανσης νερού. Προστατεύει τα βιομηχανικά δίκτυα, βελτιώνει την απόδοση και επιμηκύνει τη διάρκεια ζωής των συστημάτων.",
    highlightsEl: [
      "Βοηθά στη σταθερότητα της παροχής",
      "Στηρίζει την προστασία του εξοπλισμού",
      "Ιδανικό για δίκτυα που απαιτούν έλεγχο ποιότητας",
    ],
  },
  {
    id: "exartimata-solinon",
    slug: "exartimata-solinon",
    nameEl: "ΕΞΑΡΤΗΜΑΤΑ ΣΩΛΗΝΩΝ",
    image: "/images/new-categories/ΕΞΑΡΤΗΜΑΤΑ_ΣΩΛΗΝΩΝ.webp",
    tagEl: "Συμβατότητα",
    summaryEl:
      "Πλήρης σειρά εξαρτημάτων σωληνώσεων για εφαρμογές βιομηχανικών προδιαγραφών. Απόλυτη ερμητικότητα κατασκευής που εκμηδενίζει τις διαρροές.",
    highlightsEl: [
      "Καθημερινά εξαρτήματα με ουσιαστική σημασία",
      "Σωστή εφαρμογή σε τεχνικές διαδρομές",
      "Αξιοπιστία εκεί που χτίζεται όλο το δίκτυο",
    ],
  },
  {
    id: "exartimata-pollaplon-xriseon",
    slug: "exartimata-pollaplon-xriseon",
    nameEl: "ΕΞΑΡΤΗΜΑΤΑ ΠΟΛΛΑΠΛΩΝ ΧΡΗΣΕΩΝ",
    image: "/images/new-categories/ΕΞΑΡΤΗΜΑΤΑ_ΠΟΛΛΑΠΛΩΝ_ΧΡΗΣΕΩΝ.webp",
    tagEl: "Ευελιξία",
    summaryEl:
      "Εξαρτήματα και σύνδεσμοι ειδικών απαιτήσεων. Προσφέρουν ευελιξία και αξιοπιστία σε σύνθετες εγκαταστάσεις και μικτά βιομηχανικά δίκτυα υψηλών προδιαγραφών.",
    highlightsEl: [
      "Χρήσιμα σε μικτές τεχνικές ανάγκες",
      "Πρακτική λύση για πολλές εφαρμογές",
      "Ιδανικά όταν ζητείται ευελιξία",
    ],
  },
  {
    id: "exartimata-aeros",
    slug: "exartimata-aeros",
    nameEl: "ΕΞΑΡΤΗΜΑΤΑ ΑΕΡΟΣ",
    image: "/images/new-categories/ΕΞΑΡΤΗΜΑΤΑ_ΑΕΡΟΣ.webp",
    tagEl: "Πνευματικά Δίκτυα",
    summaryEl:
      "Πιστοποιημένα εξαρτήματα πνευματικών δικτύων για βέλτιστη ροή και σταθερή πίεση. Σχεδιασμένα για συνεχή και απρόσκοπτη βιομηχανική λειτουργία εντατικής χρήσης.",
    highlightsEl: [
      "Κατάλληλα για πνευματικές εφαρμογές",
      "Σταθερή απόδοση στην καθημερινή χρήση",
      "Στήριξη αξιόπιστων συνδέσεων αέρα",
    ],
  },
  {
    id: "goniakoi-odigoi",
    slug: "goniakoi-odigoi",
    nameEl: "ΓΩΝΙΑΚΟΙ ΟΔΗΓΟΙ",
    image: "/images/new-categories/ΓΩΝΙΑΚΟΙ_ΟΔΗΓΟΙ.webp",
    tagEl: "Κατεύθυνση Ροής",
    summaryEl:
      "Γωνιακοί σύνδεσμοι προδιαγραφών για ομαλή αλλαγή κατεύθυνσης ροής. Βελτιστοποιούν τη χάραξη του δικτύου περιορίζοντας αισθητά τις βαρυτικές και τριβικές πτώσεις πίεσης.",
    highlightsEl: [
      "Ομαλή διαχείριση αλλαγής κατεύθυνσης",
      "Πιο καθαρή γεωμετρία εγκατάστασης",
      "Χρήσιμοι όπου ο χώρος είναι απαιτητικός",
    ],
  },
  {
    id: "ball-valve-aeros-ygrown",
    slug: "ball-valve-aeros-ygrown",
    nameEl: "BALL VALVE ΑΕΡΟΣ & ΥΓΡΩΝ",
    image: "/images/new-categories/BALL_VALVA_ΑΕΡΟΣ&ΥΓΡΩΝ.webp",
    tagEl: "Έλεγχος Ροής",
    summaryEl:
      "Σφαιρικοί κρουνοί (ball valves) υψηλής αντοχής για δίκτυα αέρα και υγρών. Εξασφαλίζουν άμεσο και ασφαλή έλεγχο ροής, με εγγυημένη στεγανότητα.",
    highlightsEl: [
      "Άμεσος χειρισμός της ροής",
      "Χρήση σε αέρα και υγρά",
      "Βιομηχανικός χαρακτήρας με ξεκάθαρη λειτουργία",
    ],
  },
];

export function getProductBySlug(slug: string) {
  return productShowcaseItems.find((item) => item.slug === slug);
}

export function getProductShowcaseCount() {
  return productShowcaseItems.length;
}

const horizontalGalleryImageById: Record<string, string> = {
  "solines-inox-thermou-aera":
    "/images/Scroll-second/Add_background_to_spiral_picture_bfb0a65da2-ezgif.com-jpg-to-webp-converter.webp",
  "pollapla-stirigmata":
    "/images/Scroll-second/Beautiful_blue_background_c399f712b1-ezgif.com-jpg-to-webp-converter.webp",
  "mproutzina-taf":
    "/images/Scroll-second/Brass_fittings_blue_background_3576546b97-ezgif.com-jpg-to-webp-converter.webp",
  koftis:
    "/images/Scroll-second/Beautiful_blue_background_835f5f2fe6-ezgif.com-jpg-to-webp-converter.webp",
  thermosystellomena:
    "/images/Scroll-second/Beautiful_blue_background_a7c70edb85-ezgif.com-jpg-to-webp-converter.webp",
  "epexergasia-nerou":
    "/images/Scroll-second/Beautiful_blue_background_3c191d233a-ezgif.com-jpg-to-webp-converter.webp",
  "exartimata-solinon":
    "/images/Scroll-second/Beautiful_blue_background_1c5f461a95-ezgif.com-jpg-to-webp-converter.webp",
  "exartimata-pollaplon-xriseon":
    "/images/Scroll-second/Beautiful_blue_background_ce1a72e4ef-ezgif.com-jpg-to-webp-converter.webp",
  "exartimata-aeros":
    "/images/Scroll-second/Beautiful_blue_background_81fbc00005-ezgif.com-jpg-to-webp-converter.webp",
  "goniakoi-odigoi":
    "/images/Scroll-second/Add_background_to_spiral_picture_38425f93ea-ezgif.com-jpg-to-webp-converter.webp",
  "ball-valve-aeros-ygrown":
    "/images/Scroll-second/Change_background_of_ball_valve_ae99b75fb4-ezgif.com-jpg-to-webp-converter.webp",
};

export const productShowcaseNavigationItems = productShowcaseItems.map((item) => ({
  id: item.id,
  slug: item.slug,
  nameEl: item.nameEl,
  image: horizontalGalleryImageById[item.id] ?? item.image,
  href: `/products#${item.slug}`,
}));
