import type { Metadata } from "next"
import { headers } from "next/headers"
import { FounderPersonSchema } from "@/lib/schema/PersonSchema"
import AboutCinematicPage from "@/components/AboutCinematicPage"

export const metadata: Metadata = {
  title: "Η Ιστορία μας | AEROFREN",
  description:
    "Ανακαλύψτε την ιστορία της AEROFREN από το 1980. Η διαδρομή μας ξεκίνησε από τον Βασίλειο Κουτελίδη και συνεχίζεται σήμερα με την ίδια αφοσίωση στην ποιότητα και την αξιοπιστία.",
  alternates: {
    canonical: "https://aerofren.gr/about",
  },
}

export default async function AboutPage() {
  const nonce = (await headers()).get("x-nonce")
  return (
    <>
      <FounderPersonSchema nonce={nonce} />
      <AboutCinematicPage />
    </>
  )
}
