"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

export interface MobileBottomNavItem {
  label: string;
  path: string;
  Icon: LucideIcon;
}

interface MobileBottomNavProps {
  items: readonly MobileBottomNavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();
  const gridStyle = {
    "--mobile-nav-count": String(items.length),
  } as CSSProperties;

  const isActivePath = (path: string) => {
    if (!pathname) {
      return false;
    }

    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
        <div className="mobile-bottom-nav__shell" style={gridStyle}>
          <div className="mobile-bottom-nav__glow" aria-hidden="true" />

          {items.map((item) => {
            const isActive = isActivePath(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`mobile-bottom-nav__item ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="mobile-bottom-nav__sheen" aria-hidden="true" />
                <item.Icon className="mobile-bottom-nav__icon" strokeWidth={1.9} aria-hidden="true" />
                <span className="mobile-bottom-nav__label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx>{`
        .mobile-bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: calc(14px + env(safe-area-inset-bottom, 0px));
          z-index: 70;
          width: min(428px, calc(100dvw - 18px));
          margin-inline: auto;
          pointer-events: none;
          transition: opacity 180ms ease;
        }

        .mobile-bottom-nav__shell {
          position: relative;
          display: grid;
          grid-template-columns: repeat(var(--mobile-nav-count, 5), minmax(0, 1fr));
          gap: 6px;
          align-items: stretch;
          padding: 8px;
          border-radius: 28px;
          pointer-events: auto;
          overflow: hidden;
          isolation: isolate;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04)),
            rgba(4, 16, 31, 0.88);
          border: 1px solid rgba(167, 217, 255, 0.2);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            inset 0 -1px 0 rgba(255, 255, 255, 0.04);
        }

        .mobile-bottom-nav__shell::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01));
          pointer-events: none;
          z-index: -1;
        }

        .mobile-bottom-nav__glow {
          position: absolute;
          left: 18%;
          right: 18%;
          bottom: -18px;
          height: 42px;
          background: radial-gradient(circle, rgba(0, 186, 226, 0.35) 0%, rgba(0, 186, 226, 0) 72%);
          filter: blur(20px);
          pointer-events: none;
          z-index: -2;
        }

        .mobile-bottom-nav__item {
          position: relative;
          z-index: 0;
          display: flex;
          min-height: 60px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border-radius: 22px;
          padding: 8px 4px 9px;
          color: rgba(224, 238, 255, 0.76);
          text-decoration: none;
          transition:
            transform 180ms ease,
            color 180ms ease;
        }

        .mobile-bottom-nav__item::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid transparent;
          background: linear-gradient(180deg, rgba(55, 92, 134, 0.3), rgba(10, 24, 41, 0.52));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 12px 24px rgba(0, 0, 0, 0.18);
          opacity: 0;
          transform: translateY(2px);
          transition:
            opacity 180ms ease,
            transform 180ms ease,
            border-color 180ms ease;
          z-index: -1;
        }

        .mobile-bottom-nav__sheen {
          position: absolute;
          inset: 1px 12px auto;
          height: 16px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px);
          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }

        .mobile-bottom-nav__item:focus-visible {
          outline: 2px solid rgba(0, 186, 226, 0.9);
          outline-offset: 2px;
        }

        .mobile-bottom-nav__item.is-active,
        .mobile-bottom-nav__item:active {
          color: rgba(248, 252, 255, 0.98);
          transform: translateY(-1px);
        }

        .mobile-bottom-nav__item.is-active::before,
        .mobile-bottom-nav__item:active::before {
          opacity: 1;
          transform: translateY(0);
          border-color: rgba(127, 205, 255, 0.22);
        }

        .mobile-bottom-nav__item.is-active .mobile-bottom-nav__sheen,
        .mobile-bottom-nav__item:active .mobile-bottom-nav__sheen {
          opacity: 1;
          transform: translateY(0);
        }

        .mobile-bottom-nav__icon {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
        }

        .mobile-bottom-nav__label {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1;
        }

        @supports ((backdrop-filter: blur(18px)) or (-webkit-backdrop-filter: blur(18px))) {
          .mobile-bottom-nav__shell {
            background:
              linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.03)),
              rgba(5, 19, 36, 0.56);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }
        }

        :global(body.perf-no-blur) .mobile-bottom-nav__shell {
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02)),
            rgba(4, 16, 31, 0.92);
        }

        @media (hover: hover) {
          .mobile-bottom-nav__item:hover {
            color: rgba(248, 252, 255, 0.98);
            transform: translateY(-1px);
          }

          .mobile-bottom-nav__item:hover::before {
            opacity: 1;
            transform: translateY(0);
            border-color: rgba(127, 205, 255, 0.16);
          }

          .mobile-bottom-nav__item:hover .mobile-bottom-nav__sheen {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 420px) {
          .mobile-bottom-nav {
            width: calc(100dvw - 14px);
            bottom: calc(10px + env(safe-area-inset-bottom, 0px));
          }

          .mobile-bottom-nav__shell {
            gap: 4px;
            padding: 7px;
            border-radius: 24px;
          }

          .mobile-bottom-nav__item {
            min-height: 56px;
            padding-inline: 2px;
          }

          .mobile-bottom-nav__label {
            font-size: 0.58rem;
          }
        }

        @media (min-width: 1024px) {
          .mobile-bottom-nav {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
