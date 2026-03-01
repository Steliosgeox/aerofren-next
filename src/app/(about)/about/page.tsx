import type { Metadata } from "next"
import AboutHistoryGrid from "@/components/AboutHistoryGrid"
import { FounderPersonSchema } from "@/lib/schema/PersonSchema"

export const metadata: Metadata = {
    title: "Η Ιστορία μας | AEROFREN",
    description:
        "Ανακαλύψτε την ιστορία της AEROFREN από το 1980. Η διαδρομή μας ξεκίνησε από τον Βασίλειο Κουτελίδη και συνεχίζεται σήμερα με την ίδια αφοσίωση στην ποιότητα και την αξιοπιστία.",
    alternates: {
        canonical: "https://aerofren.gr/about",
    },
}

export default function AboutPage() {
    return (
        <>
            <FounderPersonSchema />
            <AboutHistoryGrid />
        </>
    )
}
