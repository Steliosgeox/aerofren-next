# Οδηγός Συνεισφοράς — AEROFREN

> Καλώς ήρθες! Ευχαριστούμε που ενδιαφέρεσαι να συνεισφέρεις στο AEROFREN.
> Αυτό το έγγραφο εξηγεί πώς δουλεύουμε μαζί.

---

## Πριν Ξεκινήσεις

Το AEROFREN είναι **private B2B production project**. Η πρόσβαση στο
repository δίνεται μόνο σε εγκεκριμένους collaborators (Sword-Group Greece).
Αν δεν έχεις πρόσβαση και θέλεις να συνεισφέρεις, επικοινώνησε με τον
maintainer: **dev@aerofren.gr**

---

## Περιβάλλον Ανάπτυξης

### Απαιτήσεις

- Node.js ≥ 22.x
- npm ≥ 10.x
- Πρόσβαση στα απαραίτητα `.env.local` secrets (ζήτησέ τα από τον maintainer)

### Εγκατάσταση

```bash
# Κλωνοποίησε το repo (μόνο αν έχεις πρόσβαση)
git clone https://github.com/Steliosgeox/aerofren.git

# Πλοήγηση στον φάκελο του Next.js project
cd aerofren/aerofren-next

# Εγκατάσταση dependencies
npm install

# Εκκίνηση development server
npm run dev
```

Το development server ξεκινά στη διεύθυνση http://localhost:3000.

---

## Ροή Εργασίας (Git Workflow)

Ακολουθούμε **trunk-based development** με feature branches.

```
main ── feat/my-feature ──▶ Pull Request ──▶ main
```

### Κανόνες:

1. **Δεν κάνουμε ποτέ push απευθείας στο `main`.**
2. Κάθε αλλαγή γίνεται μέσω **Pull Request** με τουλάχιστον 1 approval.
3. Τα branches ακολουθούν την ονοματολογία:
   - `feat/description` — νέο feature
   - `fix/description` — bug fix
   - `chore/description` — maintenance, updates
   - `docs/description` — αλλαγές τεκμηρίωσης
   - `refactor/description` — refactoring χωρίς λειτουργικές αλλαγές

---

## Σύμβαση Commit Messages

Χρησιμοποιούμε [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <περιγραφή στα αγγλικά>

Παραδείγματα:
feat(navigation): add mobile hamburger menu
fix(scroll-animation): correct frame index calculation
chore(deps): update gsap to 3.14.3
docs(readme): add setup instructions
refactor(header): extract theme switcher to separate component
```

### Τύποι (types):

| Type | Πότε χρησιμοποιείται |
| ---- | -------------------- |
| `feat` | Νέο feature |
| `fix` | Διόρθωση bug |
| `chore` | Maintenance, tooling, deps |
| `docs` | Αλλαγές σε documentation |
| `refactor` | Refactoring κώδικα |
| `test` | Προσθήκη/τροποποίηση tests |
| `perf` | Βελτίωση performance |
| `style` | Αλλαγές formatting (μόνο whitespace/σχόλια) |

---

## Πρότυπα Κώδικα

### TypeScript / React

- Χρησιμοποιούμε **TypeScript strict mode** — απαγορεύονται `any` χωρίς δικαιολογία.
- Όλα τα components είναι functional (hooks, όχι class components).
- Props typing: πάντα `interface`, όχι `type` για component props.
- Client components: πάντα `'use client'` directive στην κορυφή.

### Animations (GSAP)

- Χρησιμοποιούμε μόνο τα registered plugins που βρίσκονται στο `src/lib/gsap/client.ts`.
- **Απαγορεύεται** η απευθείας εισαγωγή GSAP plugins εκτός του central registry.
- Όλες οι animations σέβονται το `prefers-reduced-motion`.

### Styling

- **Tailwind CSS v4** — CSS-first configuration.
- Δεν χρησιμοποιούμε inline styles παρά μόνο για δυναμικές τιμές animation.
- Τα CSS variables του design system βρίσκονται στο `src/app/globals.css`.

---

## Testing

Πριν από κάθε PR, τρέξε:

```bash
# Lint
npm run lint

# Unit tests
npm run test:run

# Build check
npm run build
```

Αν γράφεις νέο feature, πρόσθεσε και τα αντίστοιχα tests (Vitest).

---

## Pull Request Checklist

Πριν ανοίξεις PR, βεβαιώσου ότι:

- [ ] Ο κώδικας κάνει build (`npm run build`) χωρίς errors
- [ ] Το lint περνά (`npm run lint`) χωρίς warnings
- [ ] Τα tests περνούν (`npm run test:run`)
- [ ] Έχεις προσθέσει screenshots/video αν αφορά UI αλλαγή
- [ ] Έχεις ενημερώσει το `ARCHITECTURE.md` αν άλλαξε η δομή
- [ ] Δεν έχεις commit `.env.local` ή οποιοδήποτε secret

---

## Επικοινωνία

Έχεις ερώτηση; Μην ανοίξεις Issue — στείλε απευθείας μήνυμα:

- **Stylianos Georgoulis** (Lead Developer & Maintainer) — dev@aerofren.gr
- **Sword-Group Greece** (Εταιρικοί Συνεργάτες) — συνεννόηση μέσω email

---

_Ευχαριστούμε που κρατάς το AEROFREN σε υψηλό επίπεδο!_
