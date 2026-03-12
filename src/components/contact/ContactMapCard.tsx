"use client";

import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import {
  CONTACT_ADDRESS_LINE_1,
  CONTACT_ADDRESS_LINE_2,
  CONTACT_MAP_DIRECTIONS_URL,
  CONTACT_MAP_EMBED_URL,
  CONTACT_MAP_URL,
} from "@/components/contact/constants";

export function ContactMapCard() {
  return (
    <section
      className="relative py-10 z-10 [content-visibility:auto] [contain-intrinsic-size:500px]"
      aria-labelledby="contact-map-title"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <h2 id="contact-map-title" className="text-2xl font-bold text-[var(--contact-text)] mb-1">
            Επισκεφθείτε μας
          </h2>
          <p className="text-sm text-[var(--contact-muted)]">
            {CONTACT_ADDRESS_LINE_1}, {CONTACT_ADDRESS_LINE_2}
          </p>
        </div>

        <article className="overflow-hidden rounded-xl border border-[var(--contact-border)] bg-[var(--contact-surface)] shadow-xl">
          <div className="relative h-[320px] w-full sm:h-[360px] lg:h-[420px]">
            <iframe
              src={CONTACT_MAP_EMBED_URL}
              title="Χάρτης τοποθεσίας AEROFREN - Μοσχάτο, Αθήνα"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent"
            />
          </div>

          <div className="border-t border-[var(--contact-border)] bg-[color-mix(in_srgb,var(--contact-surface)_94%,transparent)] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--contact-text)]">
                  <MapPin className="h-4 w-4 text-[var(--theme-accent)]" />
                  AEROFREN • Μοσχάτο
                </p>
                <p className="mt-1 text-sm text-[var(--contact-muted)]">
                  {CONTACT_ADDRESS_LINE_1}, {CONTACT_ADDRESS_LINE_2}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <TrackedLink
                  href={CONTACT_MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--contact-border)] px-3 py-2 text-sm font-semibold text-[var(--contact-text)] hover:border-[color-mix(in_srgb,var(--theme-accent)_55%,transparent)] hover:text-[var(--theme-accent)] transition-colors"
                  eventName="map_directions_click"
                  eventParams={{ location: "contact_map", page_type: "contact" }}
                >
                  Οδηγίες
                  <Navigation className="h-4 w-4" />
                </TrackedLink>
                <TrackedLink
                  href={CONTACT_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-hover)] transition-colors"
                  eventName="map_directions_click"
                  eventParams={{ location: "contact_map", page_type: "contact" }}
                >
                  Google Maps
                  <ExternalLink className="h-4 w-4" />
                </TrackedLink>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
