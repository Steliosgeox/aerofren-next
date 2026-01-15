import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users, Truck, Shield } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Ποιοι Είμαστε | AEROFREN",
    description:
        "Η AEROFREN είναι ο κορυφαίος B2B προμηθευτής εξαρτημάτων νερού και αέρα στην Ελλάδα. Μάθετε περισσότερα για την ιστορία και την αποστολή μας.",
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <span className="text-[#0066cc] font-bold tracking-widest uppercase text-sm mb-4 block">
                        About Us
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                        Η ΙΣΤΟΡΙΑ ΜΑΣ
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl">
                        Από το 1990, η AEROFREN είναι ο έμπιστος συνεργάτης επαγγελματιών σε
                        εξαρτήματα νερού και αέρα.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                            Αποκλειστικός Αντιπρόσωπος & Εισαγωγέας
                        </h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Η AEROFREN (Κουτελίδου Αικατερίνη Β.) ιδρύθηκε με στόχο την
                            εξυπηρέτηση επαγγελματιών του κλάδου με ποιοτικά εξαρτήματα και
                            άριστη τεχνική υποστήριξη.
                        </p>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Με έδρα το Μοσχάτο, εξυπηρετούμε πανελλαδικά εγκαταστάτες,
                            υδραυλικούς, βιομηχανίες και επιχειρήσεις που χρειάζονται
                            αξιόπιστα εξαρτήματα νερού και πνευματικών συστημάτων.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            {[
                                { icon: <Users className="w-6 h-6" />, text: "B2B Μόνο" },
                                { icon: <Truck className="w-6 h-6" />, text: "Πανελλαδική Κάλυψη" },
                                { icon: <Shield className="w-6 h-6" />, text: "Πιστοποιημένα Προϊόντα" },
                                { icon: <CheckCircle className="w-6 h-6" />, text: "Τεχνική Υποστήριξη" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#0066cc]/10 rounded-lg flex items-center justify-center text-[#0066cc]">
                                        {item.icon}
                                    </div>
                                    <span className="font-semibold text-slate-900">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/#quote-form">
                            <Button size="lg" className="font-bold">
                                Επικοινωνήστε Μαζί Μας
                            </Button>
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#0066cc]/20 to-transparent rounded-3xl blur-2xl" />
                        <Image
                            src="/images/fittings-brass.jpg"
                            alt="AEROFREN Products"
                            width={600}
                            height={400}
                            className="relative rounded-2xl shadow-2xl w-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-12 text-center">
                        Οι Αξίες Μας
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Ποιότητα",
                                desc: "Επιλέγουμε προσεκτικά κάθε προϊόν για να διασφαλίσουμε την αξιοπιστία του.",
                            },
                            {
                                title: "Εξυπηρέτηση",
                                desc: "Άμεση ανταπόκριση και τεχνική καθοδήγηση σε κάθε ανάγκη.",
                            },
                            {
                                title: "Εμπιστοσύνη",
                                desc: "Χτίζουμε μακροχρόνιες σχέσεις με τους συνεργάτες μας.",
                            },
                        ].map((value, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
                            >
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    {value.title}
                                </h3>
                                <p className="text-slate-600">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
