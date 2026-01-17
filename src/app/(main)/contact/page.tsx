"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  Building2,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 pt-32">
        <div className="max-w-7xl mx-auto px-6">
          <Breadcrumbs items={[{ label: "Επικοινωνία", href: "/contact" }]} />

          <div className="mt-6">
            <span className="text-[#0066cc] font-bold tracking-widest uppercase text-sm mb-4 block">
              Επικοινωνία
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              ΕΠΙΚΟΙΝΩΝΗΣΤΕ
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066cc] to-blue-400">
                ΜΑΖΙ ΜΑΣ
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              Είμαστε εδώ για να σας εξυπηρετήσουμε. Επικοινωνήστε μαζί μας για
              προσφορές, τεχνικές πληροφορίες ή οποιαδήποτε απορία.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Phone */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#0066cc]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-[#0066cc]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">
                        Τηλέφωνο
                      </h3>
                      <a
                        href="tel:2103461645"
                        className="text-2xl font-bold text-[#0066cc] hover:underline"
                      >
                        210 3461645
                      </a>
                      <p className="text-sm text-slate-500 mt-1">
                        Δευτέρα - Παρασκευή
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[hsl(var(--secondary))]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-[hsl(var(--secondary))]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:info@aerofren.gr"
                        className="text-lg font-semibold text-slate-700 hover:text-[#0066cc] transition-colors"
                      >
                        info@aerofren.gr
                      </a>
                      <p className="text-sm text-slate-500 mt-1">
                        Απάντηση εντός 24 ωρών
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">
                        Διεύθυνση
                      </h3>
                      <p className="text-slate-700 font-medium">
                        Χρυσοστόμου Σμύρνης 26
                        <br />
                        Μοσχάτο, 18344
                        <br />
                        Αθήνα
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">
                        Ωράριο Λειτουργίας
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Δευτέρα - Παρασκευή</span>
                          <span className="font-semibold text-slate-900">
                            08:00 - 16:00
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Σάββατο - Κυριακή</span>
                          <span className="font-semibold text-red-500">Κλειστά</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card className="border-0 shadow-lg bg-slate-900 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Επωνυμία</h3>
                      <p className="text-slate-300">
                        AEROFREN
                        <br />
                        Κουτελίδου Αικατερίνη Β.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 rounded text-xs bg-white/10">
                          B2B Only
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-white/10">
                          Από το 1990
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#0066cc] to-blue-400" />
                <CardContent className="p-8 md:p-10">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        Ευχαριστούμε για το μήνυμά σας!
                      </h2>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Λάβαμε το αίτημά σας και θα επικοινωνήσουμε μαζί σας το
                        συντομότερο δυνατό, εντός 24 ωρών.
                      </p>
                      <Button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: "",
                            email: "",
                            phone: "",
                            company: "",
                            subject: "",
                            message: "",
                          });
                        }}
                      >
                        Νέο Μήνυμα
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                          Στείλτε μας Μήνυμα
                        </h2>
                        <p className="text-slate-500">
                          Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας
                          το συντομότερο.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Ονοματεπώνυμο *</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              placeholder="Γιάννης Παπαδόπουλος"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company">Εταιρεία</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  company: e.target.value,
                                })
                              }
                              placeholder="Όνομα εταιρείας"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Τηλέφωνο</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                              placeholder="210 1234567"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Θέμα</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({ ...formData, subject: e.target.value })
                            }
                            placeholder="π.χ. Αίτημα προσφοράς, Τεχνική ερώτηση..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Μήνυμα *</Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) =>
                              setFormData({ ...formData, message: e.target.value })
                            }
                            placeholder="Περιγράψτε το αίτημά σας, κωδικούς προϊόντων, ποσότητες..."
                            rows={6}
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-14 font-bold"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Αποστολή...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-5 h-5" />
                              Αποστολή Μηνύματος
                            </span>
                          )}
                        </Button>

                        <p className="text-xs text-slate-500 text-center">
                          Με την αποστολή συμφωνείτε με την{" "}
                          <a
                            href="#"
                            className="underline hover:text-[hsl(var(--primary))]"
                          >
                            Πολιτική Απορρήτου
                          </a>{" "}
                          μας.
                        </p>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Επισκεφτείτε μας
            </h2>
            <p className="text-slate-500">
              Χρυσοστόμου Σμύρνης 26, Μοσχάτο 18344, Αθήνα
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3146.0458789285867!2d23.67820231531961!3d37.94829497972867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1bd5e5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sMoschato%2C%20Greece!5e0!3m2!1sen!2sgr!4v1234567890123!5m2!1sen!2sgr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[hsl(var(--primary))] to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Προτιμάτε να μιλήσετε απευθείας;
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Η τεχνική μας ομάδα είναι διαθέσιμη για να απαντήσει σε κάθε σας
            ερώτηση.
          </p>
          <a
            href="tel:2103461645"
            className="inline-flex items-center justify-center h-16 px-10 bg-white text-[hsl(var(--primary))] font-bold text-lg rounded-xl hover:bg-slate-100 transition-colors shadow-xl"
          >
            <Phone className="w-6 h-6 mr-3" />
            Καλέστε: 210 3461645
          </a>
        </div>
      </section>
    </div>
  );
}
