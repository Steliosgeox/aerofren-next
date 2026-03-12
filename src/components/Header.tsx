"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, memo, useCallback, useMemo, useSyncExternalStore } from "react";
import { catalogCategories } from "@/data/catalog-taxonomy";
import { UnifiedHeaderMenu } from "./UnifiedHeaderMenu";
import { LiquidGlassSwitcher } from "./LiquidGlassSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { MobileBottomNav, type MobileBottomNavItem } from "./header/MobileBottomNav";
import { SITE_NAV_ITEMS } from "./header/siteNav";
// Import from centralized GSAP config - plugins are pre-registered there
import { gsap, ScrollTrigger } from "@/lib/gsap/client";
import {
  Phone,
  ArrowRight,
  User,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { NotificationBell } from './NotificationBell';
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_HREF } from "@/lib/constants/aerofren";

const desktopNavItems = SITE_NAV_ITEMS.map(({ name, path, hasDropdown }) => ({
  name,
  path,
  hasDropdown,
}));

// Optimized Logo Component - Only loads ONE image based on theme
function LogoImage() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );

  // Logo configuration per theme
  const logoConfig = {
    dark: { src: "/images/LOGOdark.webp", width: 510, height: 144, className: "h-[9rem] -mt-2 ml-2" },
    dim: { src: "/images/LOGOdim.webp", width: 510, height: 144, className: "h-[9rem] -mt-2 ml-2" },
    light: { src: "/images/LOGOlight.webp", width: 620, height: 176, className: "h-[11rem] mt-2 -ml-2" },
  };

  // Keep SSR and first client render deterministic to avoid hydration mismatch.
  const themeKey = (mounted ? resolvedTheme : "dark") as keyof typeof logoConfig;
  const config = logoConfig[themeKey] || logoConfig.dark;

  return (
    <Image
      src={config.src}
      alt="AEROFREN"
      width={config.width}
      height={config.height}
      className={`${config.className} w-auto object-contain`}
      priority
    />
  );
}


// Glass header styles - iOS 26 Liquid Glass Effect
const glassHeaderStyles = {
  base: `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    contain: layout style;
    will-change: transform;
    transition: all var(--theme-transition, 0.4s cubic-bezier(0.4, 0, 0.2, 1));
    background-color: color-mix(in srgb, var(--c-glass) 12%, transparent);
    backdrop-filter: blur(20px) saturate(var(--saturation, 150%));
    -webkit-backdrop-filter: blur(20px) saturate(var(--saturation, 150%));
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 10%), transparent),
      inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 60%), transparent),
      inset -2px -2px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 50%), transparent),
      inset -0.3px -1px 4px 0px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent),
      0px 6px 24px 0px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 15%), transparent);
  `,
};

// Module-level style constants — CSS custom properties resolve at paint time,
// so these don't need to be inside the component or in useMemo
const MEGA_MENU_STYLES: React.CSSProperties = {
  background: "var(--theme-mega-bg)",
  backdropFilter: "blur(20px)",
  boxShadow: `inset 1px 1px 0 var(--theme-glass-inset-light), 0 20px 50px rgba(0, 0, 0, 0.5)`,
  border: "1px solid var(--theme-glass-border)",
  transition: "all var(--theme-transition)",
};

const USER_DROPDOWN_STYLES: React.CSSProperties = {
  background: "var(--theme-mega-bg)",
  backdropFilter: "blur(20px)",
  border: "1px solid var(--theme-glass-border)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
};

const LOGIN_BUTTON_STYLES: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.1)",
  color: "var(--theme-text)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
};

function HeaderComponent() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Unified click-outside listener for both menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(target)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup mega menu timeout on unmount
  useEffect(() => {
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
        megaMenuTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [signOut, router]);

  // GSAP scroll animation
  useEffect(() => {
    if (typeof window === "undefined" || !headerRef.current) return;

    const showAnim = gsap
      .from(headerRef.current, {
        yPercent: -100,
        paused: true,
        duration: 0.2,
      })
      .progress(1);

    const scrollTrigger = ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === -1) {
          showAnim.play();
        } else {
          showAnim.reverse();
        }
      },
    });

    return () => {
      scrollTrigger.kill();
      showAnim.kill();
    };
  }, []);

  // Scroll state for height transition - THROTTLED with requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    let lastY = 0;
    let rafId: number;

    const handleScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 10) return;
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          setIsScrolled(y > 20);
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const mobileDockItems = useMemo<readonly MobileBottomNavItem[]>(() => {
    const baseItems = SITE_NAV_ITEMS.map(({ mobileLabel, path, Icon }) => ({
      label: mobileLabel,
      path,
      Icon,
    }));

    const authItem = user
      ? {
          label: isAdmin ? "Admin" : "Προφίλ",
          path: isAdmin ? "/admin" : "/login",
          Icon: isAdmin ? Shield : User,
        }
      : {
          label: "Είσοδος",
          path: "/login",
          Icon: LogIn,
        };

    return [...baseItems, authItem];
  }, [user, isAdmin]);
  const handleMegaMenuEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setMegaMenuOpen(true);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  }, []);

  const handleNavDropdownHover = useCallback((
    item: { hasDropdown?: boolean },
    isHovering: boolean
  ) => {
    if (item.hasDropdown) {
      if (isHovering) {
        handleMegaMenuEnter();
      } else {
        handleMegaMenuLeave();
      }
    }
  }, [handleMegaMenuEnter, handleMegaMenuLeave]);


  const showMobileDock = !(pathname?.startsWith('/admin'));

  return (
    <>
      <style jsx global>{`
        .glass-header {
          ${glassHeaderStyles.base}
        }
        .glass-header--scrolled {
          height: 90px !important;
          background-color: color-mix(in srgb, var(--c-glass) 25%, transparent) !important;
          backdrop-filter: blur(28px) saturate(var(--saturation, 150%)) !important;
          -webkit-backdrop-filter: blur(28px) saturate(var(--saturation, 150%)) !important;
        }
        .logo-hover {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease;
          filter: drop-shadow(0 0 0px transparent);
          will-change: transform, filter;
        }
        .logo-hover:hover {
          transform: scale(1.08);
          filter: drop-shadow(0 0 20px rgba(0, 186, 226, 0.6)) drop-shadow(0 0 40px rgba(0, 186, 226, 0.3));
        }
        .logo-hover:active {
          transform: scale(0.98);
        }

      `}</style>

      <header
        ref={headerRef}
        className={`glass-header ${isScrolled ? "glass-header--scrolled" : ""}`}
        style={{
          height: isScrolled ? "90px" : "100px",
        }}
      >
        <div className="w-full px-8 h-full">
          <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-1 items-center h-full relative">
            {/* Logo - Theme-aware with premium hover effect */}
            <Link href="/" className="flex items-center gap-3 group logo-hover shrink-0 z-20 justify-self-start">
              <LogoImage />
            </Link>

            {/* Desktop Navigation with Glass Effect - Grid Centered */}
            <div className="hidden xl:flex justify-self-center z-10">
              {/*
                Unified hover zone: the wrapper div owns BOTH the nav pill AND
                the dropdown panel — there is NO dead zone between them.
                The invisible bridge div (h-4) also covers the visual gap so
                moving the mouse down from the pill to the panel never leaves
                the hover zone.
              */}
              <div
                ref={megaMenuRef}
                className="relative"
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
              >
                <nav className="flex items-center" aria-label="Primary navigation">
                  <UnifiedHeaderMenu
                    navItems={desktopNavItems}
                    onDropdownHover={handleNavDropdownHover}
                    dropdownOpen={megaMenuOpen}
                  />
                </nav>

                {/* Invisible bridge — fills the gap between pill bottom and dropdown top */}
                {megaMenuOpen && (
                  <div className="absolute top-full left-0 right-0 h-4" aria-hidden="true" />
                )}

                {/* Mega Menu for Products */}
                {megaMenuOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[820px] rounded-2xl overflow-hidden"
                    role="menu"
                    aria-label="Κατηγορίες προϊόντων"
                    style={MEGA_MENU_STYLES}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>
                          Κατηγορίες προϊόντων
                        </h3>
                        <TrackedLink
                          href="/products"
                          className="text-sm font-semibold hover:underline flex items-center gap-1"
                          style={{ color: 'var(--theme-accent)' }}
                          eventName="category_cta_click"
                          eventParams={{ location: "header_megamenu", page_type: "global" }}
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Δείτε όλα
                          <ArrowRight className="w-4 h-4" />
                        </TrackedLink>
                      </div>

                      <div className="mb-5 grid gap-1">
                        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--theme-text-muted)" }}>
                          Canonical Landing Pages
                        </p>
                        <p className="text-sm leading-6" style={{ color: "var(--theme-text-muted)" }}>
                          Περιηγηθείτε στις βασικές indexable κατηγορίες του καταλόγου και μεταβείτε στις επιμέρους landing pages για πιο στοχευμένο περιεχόμενο.
                        </p>
                      </div>

                      {/* Category Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {catalogCategories.map((category) => (
                          <TrackedLink
                            key={category.slug}
                            href={`/products/${category.slug}`}
                            role="menuitem"
                            className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-150"
                            eventName="category_cta_click"
                            eventParams={{
                              location: "header_megamenu",
                              page_type: "global",
                              category_slug: category.slug,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--theme-glass-bg)';
                              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-accent) 22%, transparent)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'transparent';
                            }}
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--c-glass)_60%,transparent)]">
                              <Image
                                src={category.image}
                                alt={category.nameEl}
                                fill
                                sizes="56px"
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="min-w-0">
                              <span
                                className="font-semibold text-sm block truncate"
                                style={{ color: 'var(--theme-text)' }}
                              >
                                {category.nameEl}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                {category.summaryEl}
                              </span>
                            </div>
                          </TrackedLink>
                        ))}
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--theme-glass-border)' }}>
                        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                          Δεν βλέπετε το προϊόν που αναζητάτε;
                        </p>
                        <TrackedLink
                          href={BUSINESS_PHONE_HREF}
                          className="text-sm font-bold hover:underline flex items-center gap-1"
                          style={{ color: 'var(--theme-accent)' }}
                          eventName="phone_click"
                          eventParams={{ location: "header_megamenu", page_type: "global" }}
                        >
                          <Phone className="w-4 h-4" />
                          {BUSINESS_PHONE_DISPLAY}
                        </TrackedLink>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop CTA - Theme Switcher + Notifications + User - Right Side Grid */}
            <div className="hidden xl:grid grid-cols-[1fr_auto_auto] items-center gap-2 z-20 justify-self-end w-full">
              {/* Theme Switcher - Centered in remaining space */}
              <div className="justify-self-center">
                <LiquidGlassSwitcher />
              </div>

              {/* Notification Bell - visible when logged in */}
              {user && !authLoading && <NotificationBell />}

              {/* Login / User Avatar - Anchored Right */}
              <div className="relative" ref={userMenuRef}>
                {user && !authLoading ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full transition-all hover:ring-2 hover:ring-[color-mix(in_srgb,var(--theme-accent)_30%,transparent)]"
                    >
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt=""
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full ring-2 ring-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[color-mix(in_srgb,var(--theme-accent)_30%,transparent)]">
                          {user.displayName?.[0] || user.email?.[0] || 'U'}
                        </div>
                      )}
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                        style={USER_DROPDOWN_STYLES}
                      >
                        <div className="p-3" style={{ borderBottom: "1px solid var(--theme-glass-border)" }}>
                          <p className="text-sm font-medium truncate" style={{ color: "var(--theme-text)" }}>
                            {user.displayName || 'Χρήστης'}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--theme-text-muted)" }}>
                            {user.email}
                          </p>
                        </div>
                        <div className="p-2">
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                              style={{ color: "var(--theme-text-muted)" }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--theme-glass-bg)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Shield className="w-4 h-4" />
                              Πίνακας Διαχείρισης
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                            style={{ color: "var(--theme-text-muted)" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--theme-glass-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <LogOut className="w-4 h-4" />
                            Αποσύνδεση
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={LOGIN_BUTTON_STYLES}
                  >
                    <User className="w-4 h-4" />
                    Σύνδεση
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showMobileDock && <MobileBottomNav items={mobileDockItems} />}
    </>
  );
}
// Memoize to prevent unnecessary re-renders
export const Header = memo(HeaderComponent);

