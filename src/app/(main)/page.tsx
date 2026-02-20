import HomePageClient from "@/components/HomePageClient";

export const metadata = {
  title: "AEROFREN | Industrial Water & Air Systems",
  description: "Ηγέτης στα εξαρτήματα νερού και αέρα από το 1989. Καινοτόμες λύσεις για τον αγροτικό και βιομηχανικό τομέα.",
};

export default function HomePage() {
  return (
    <main>
      <HomePageClient />
    </main>
  );
}
