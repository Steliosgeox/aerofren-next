"use client";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { MagicBento, ParticleCard } from "@/components/MagicBento";
import { CONTACT_CARDS, CONTACT_ICON_BG } from "@/components/contact/constants";

type ContactInfoPanelProps = {
  glowColor: string;
};

export function ContactInfoPanel({ glowColor }: ContactInfoPanelProps) {
  const getEventName = (href: string) => {
    if (href.startsWith("tel:")) return "phone_click" as const;
    if (href.startsWith("mailto:")) return "email_click" as const;
    return "map_directions_click" as const;
  };

  return (
    <div className="lg:w-[420px] lg:shrink-0 flex flex-col [content-visibility:auto] [contain-intrinsic-size:700px]">
      <div className="flex-1">
        <MagicBento
          enableSpotlight
          spotlightRadius={220}
          glowColor={glowColor}
          pointerThrottle="raf"
          cacheBounds
        >
          <div className="space-y-3 flex flex-col justify-between h-full">
            {CONTACT_CARDS.map((card, index) => (
              <ParticleCard
                key={card.title}
                className="group cursor-pointer rounded-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 flex-1"
                glowColor={glowColor}
                enableBorderGlow
                clickEffect
                enableTilt
                enableMagnetism={false}
                particleCount={index === 0 ? 6 : 5}
              >
                <div className="relative p-4 bg-[var(--contact-surface)] border border-[var(--contact-border)] rounded-lg h-full flex items-center shadow-[0_10px_30px_rgba(0,10,22,0.2)] transition-[border-color,box-shadow,background-color] duration-300 group-hover:border-[color-mix(in_srgb,var(--theme-accent)_58%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--contact-surface)_94%,transparent)] group-hover:shadow-[0_16px_34px_rgba(0,10,22,0.3)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(112deg,color-mix(in_srgb,var(--theme-accent)_14%,transparent)_0%,transparent_48%,color-mix(in_srgb,var(--theme-accent)_16%,transparent)_100%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_58%,transparent)] to-transparent opacity-75 group-hover:opacity-100 transition-opacity"
                  />
                  {card.href ? (
                    <TrackedLink
                      href={card.href}
                      className="relative flex items-center gap-3 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--theme-accent)_55%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--contact-surface)] rounded-md"
                      target={card.href.startsWith("http") ? "_blank" : undefined}
                      rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      eventName={getEventName(card.href)}
                      eventParams={{ location: "contact_info_panel", page_type: "contact" }}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${CONTACT_ICON_BG} rounded-lg flex items-center justify-center shrink-0 shadow-[0_6px_18px_rgba(0,10,22,0.24)]`}>
                        <card.icon className="w-4 h-4 text-[var(--theme-accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--contact-text)]">{card.title}</h3>
                        <p className="text-xs font-bold text-[var(--theme-accent)] group-hover:text-[var(--theme-accent-hover)] transition-colors truncate [text-shadow:0_0_14px_color-mix(in_srgb,var(--theme-accent)_18%,transparent)]">
                          {card.primary}
                        </p>
                        <p className="text-[11px] text-[var(--contact-muted)]">{card.secondary}</p>
                      </div>
                    </TrackedLink>
                  ) : (
                    <div className="relative flex items-center gap-3 w-full">
                      <div className={`w-10 h-10 bg-gradient-to-br ${CONTACT_ICON_BG} rounded-lg flex items-center justify-center shrink-0 shadow-[0_6px_18px_rgba(0,10,22,0.24)]`}>
                        <card.icon className="w-4 h-4 text-[var(--theme-accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--contact-text)]">{card.title}</h3>
                        <p className="text-xs font-bold text-[var(--contact-text)]">{card.primary}</p>
                        <p className="text-[11px] text-[var(--contact-muted)]">{card.secondary}</p>
                        {card.tags && (
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {card.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-[color-mix(in_srgb,var(--contact-surface)_85%,transparent)] text-[var(--contact-muted)] border border-[var(--contact-border)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ParticleCard>
            ))}
          </div>
        </MagicBento>
      </div>
    </div>
  );
}
