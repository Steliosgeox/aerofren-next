"use client";

import { MagicBento, ParticleCard } from "@/components/MagicBento";
import { CONTACT_CARDS, CONTACT_ICON_BG } from "@/components/contact/constants";

type ContactInfoPanelProps = {
  glowColor: string;
};

export function ContactInfoPanel({ glowColor }: ContactInfoPanelProps) {
  return (
    <div className="lg:w-[420px] lg:shrink-0 flex flex-col">
      <div className="flex-1">
        <MagicBento
          enableSpotlight
          spotlightRadius={250}
          glowColor={glowColor}
          pointerThrottle="raf"
          cacheBounds
        >
          <div className="space-y-3 flex flex-col justify-between h-full">
            {CONTACT_CARDS.map((card) => (
              <ParticleCard
                key={card.title}
                className="group cursor-pointer rounded-lg transition-all duration-300 hover:-translate-y-0.5 flex-1"
                glowColor={glowColor}
                enableBorderGlow
                clickEffect
                enableTilt={false}
                enableMagnetism={false}
                particleCount={5}
              >
                <div className="p-4 bg-[var(--contact-surface)] border border-[var(--contact-border)] rounded-lg h-full flex items-center">
                  {card.href ? (
                    <a
                      href={card.href}
                      className="flex items-center gap-3 w-full"
                      target={card.href.startsWith("http") ? "_blank" : undefined}
                      rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${CONTACT_ICON_BG} rounded-lg flex items-center justify-center shrink-0`}>
                        <card.icon className="w-4 h-4 text-[var(--theme-accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--contact-text)]">{card.title}</h3>
                        <p className="text-xs font-bold text-[var(--theme-accent)] group-hover:text-[var(--theme-accent-hover)] transition-colors truncate">
                          {card.primary}
                        </p>
                        <p className="text-[11px] text-[var(--contact-muted)]">{card.secondary}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-10 h-10 bg-gradient-to-br ${CONTACT_ICON_BG} rounded-lg flex items-center justify-center shrink-0`}>
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
