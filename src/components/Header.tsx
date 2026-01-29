"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import { categories } from "@/data/categories";
import { UnifiedHeaderMenu } from "./UnifiedHeaderMenu";
import { LiquidGlassSwitcher } from "./LiquidGlassSwitcher";
import GlassSurface from "./ui/GlassSurface";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
// Import from centralized GSAP config - plugins are pre-registered there
import { gsap, ScrollTrigger } from "@/lib/gsap/client";
import {
  Phone,
  Home,
  ArrowRight,
  Plug,
  Wrench,
  Link as LinkIcon,
  CircleDot,
  Disc,
  Gauge,
  Cog,
  Cylinder,
  Wind,
  Package,
  Droplet,
  Hammer,
  User,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  plug: <Plug className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
  link: <LinkIcon className="w-5 h-5" />,
  tube: <CircleDot className="w-5 h-5" />,
  valve: <Disc className="w-5 h-5" />,
  gauge: <Gauge className="w-5 h-5" />,
  cog: <Cog className="w-5 h-5" />,
  cylinder: <Cylinder className="w-5 h-5" />,
  wind: <Wind className="w-5 h-5" />,
  package: <Package className="w-5 h-5" />,
  droplet: <Droplet className="w-5 h-5" />,
  tool: <Hammer className="w-5 h-5" />,
};

const navItems = [
  { name: "Αρχική", path: "/" },
  { name: "Προϊόντα", path: "/products", hasDropdown: true },
  { name: "Η Εταιρεία", path: "/about" },
  { name: "Επικοινωνία", path: "/contact" },
];

// Optimized Logo Component - Only loads ONE image based on theme
function LogoImage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logo configuration per theme
  const logoConfig = {
    dark: { src: "/images/LOGOdark.webp", width: 510, height: 144, className: "h-[9rem] -mt-2 ml-2" },
    dim: { src: "/images/LOGOdim.webp", width: 510, height: 144, className: "h-[9rem] -mt-2 ml-2" },
    light: { src: "/images/LOGOlight.webp", width: 620, height: 176, className: "h-[11rem] mt-2 -ml-2" },
  };

  // Default to dark during SSR/before mount
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

function HeaderComponent() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
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
    await signOut();
    setUserMenuOpen(false);
    router.push('/');
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
      // Kill ScrollTrigger first, then the tween
      scrollTrigger.kill();
      showAnim.kill();
    };
  }, []);

  // Scroll state for height transition - THROTTLED with requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    let lastY = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 10) return; // Ignore < 10px changes
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(y > 20);
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActivePath = useCallback(
    (path: string) => {
      if (!pathname) return false;
      if (path === "/") return pathname === "/";
      return pathname.startsWith(path);
    },
    [pathname]
  );

  const mobileDockItems = useMemo(() => {
    const baseItems = [
      { label: "Αρχική", path: "/", Icon: Home },
      { label: "Προϊόντα", path: "/products", Icon: Package },
      { label: "Επικοινωνία", path: "/contact", Icon: Phone },
    ];

    const authItem = user
      ? {
          label: isAdmin ? "Admin" : "Λογαριασμός",
          path: isAdmin ? "/admin" : "/login",
          Icon: User,
        }
      : {
          label: "Σύνδεση",
          path: "/login",
          Icon: LogIn,
        };

    return [...baseItems, authItem];
  }, [user, isAdmin]);

  const dockIconProps = {
    className: "mobile-dock-icon",
    strokeWidth: 1.6,
  } as const;

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node)
      ) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMegaMenuEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setMegaMenuOpen(true);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
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

  // Memoized style objects to prevent recreation on every render
  const megaMenuStyles = useMemo(() => ({
    background: "var(--theme-mega-bg)",
    backdropFilter: "blur(20px)",
    boxShadow: `inset 1px 1px 0 var(--theme-glass-inset-light), 0 20px 50px rgba(0, 0, 0, 0.5)`,
    border: "1px solid var(--theme-glass-border)",
    transition: "all var(--theme-transition)",
  }), []);

  const userDropdownStyles = useMemo(() => ({
    background: "var(--theme-mega-bg)",
    backdropFilter: "blur(20px)",
    border: "1px solid var(--theme-glass-border)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
  }), []);

  const loginButtonStyles = useMemo(() => ({
    background: "rgba(255, 255, 255, 0.1)",
    color: "var(--theme-text)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
  }), []);

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

        .mobile-dock-wrapper {
          position: fixed;
          left: 50%;
          bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          transform: translateX(-50%);
          z-index: 70;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .mobile-dock-wrapper > * {
          pointer-events: auto;
        }

        .mobile-dock-surface {
          width: min(360px, calc(100vw - 56px));
          height: 64px;
        }

        .mobile-dock-inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
        }

        .mobile-dock-items {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          width: 100%;
          height: 100%;
        }

        .mobile-dock-item {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 6px;
          border-radius: 999px;
          color: var(--theme-text-muted);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: color 200ms ease, transform 200ms ease;
        }

        .mobile-dock-item::before {
          content: "";
          position: absolute;
          inset: 6px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--theme-glass-bg) 55%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--theme-glass-border) 80%, transparent);
          opacity: 0;
          transition: opacity 200ms ease;
          z-index: -1;
        }

        .mobile-dock-item.is-active {
          color: var(--theme-text);
          transform: translateY(-1px);
        }

        .mobile-dock-item.is-active::before {
          opacity: 1;
        }

        .mobile-dock-icon {
          width: 20px;
          height: 20px;
        }

        @media (min-width: 1024px) {
          .mobile-dock-wrapper {
            display: none;
          }
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
              <nav
                className="flex items-center relative"
                ref={megaMenuRef}
                onMouseLeave={handleMegaMenuLeave}
              >
                <UnifiedHeaderMenu
                  navItems={navItems}
                  onDropdownHover={handleNavDropdownHover}
                />

                {/* Mega Menu for Products */}
                {megaMenuOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 max-w-[800px] w-[90vw] xl:w-[800px] rounded-2xl overflow-hidden"
                    style={megaMenuStyles}
                    onMouseEnter={handleMegaMenuEnter}
                    onMouseLeave={handleMegaMenuLeave}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                        <h3 className="font-bold" style={{ color: 'var(--theme-text)' }}>
                          Κατηγορίες προϊόντων
                        </h3>
                        <Link
                          href="/products"
                          className="text-sm font-semibold hover:underline flex items-center gap-1"
                          style={{ color: 'var(--theme-accent)' }}
                        >
                          Δείτε όλα
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Categories Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {categories.slice(0, 12).map((category) => (
                          <Link
                            key={category.id}
                            href={`/products/${category.slug}`}
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors group"
                            style={{ ['--hover-bg' as string]: 'var(--theme-glass-bg)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--theme-glass-bg)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            <div
                              className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              {iconMap[category.icon] || (
                                <Package className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span
                                className="font-semibold text-sm block truncate transition-colors"
                                style={{ color: 'var(--theme-text)' }}
                              >
                                {category.nameEl}
                              </span>
                              <span style={{ color: 'var(--theme-text-muted)', fontSize: '0.75rem' }}>
                                {category.productCount.toLocaleString("el-GR")}{" "}
                                προϊόντα
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--theme-glass-border)' }}>
                        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                          Δεν βρίσκετε αυτό που χρειάζεστε;
                        </p>
                        <a
                          href="tel:2103461645"
                          className="text-sm font-bold hover:underline flex items-center gap-1"
                          style={{ color: 'var(--theme-accent)' }}
                        >
                          <Phone className="w-4 h-4" />
                          210 3461645
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </nav>
            </div>

            {/* Desktop CTA - Theme Switcher + User - Right Side Grid */}
            <div className="hidden xl:grid grid-cols-[1fr_auto] items-center z-20 justify-self-end w-full">
              {/* Theme Switcher - Centered in remaining space */}
              <div className="justify-self-center">
                <LiquidGlassSwitcher />
              </div>

              {/* Login / User Avatar - Anchored Right */}
              <div className="relative justify-self-end" ref={userMenuRef}>
                {user && !authLoading ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full transition-all hover:ring-2 hover:ring-[color-mix(in_srgb,var(--theme-accent)_30%,transparent)]"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt=""
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
                        style={userDropdownStyles}
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
                    style={loginButtonStyles}
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

      <div className="mobile-dock-wrapper">
        <GlassSurface
          className="mobile-dock-surface"
          width="min(360px, calc(100vw - 56px))"
          height={64}
          borderRadius={999}
          blur={12}
          displace={0.5}
          distortionScale={-180}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          brightness={49}
          opacity={0.93}
          mixBlendMode="screen"
          backgroundOpacity={0.16}
          saturation={1.4}
        >
          <div className="mobile-dock-inner">
            <div className="mobile-dock-items" aria-label="Mobile primary navigation">
              {mobileDockItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`mobile-dock-item ${isActivePath(item.path) ? "is-active" : ""}`}
                  aria-current={isActivePath(item.path) ? "page" : undefined}
                >
                  <item.Icon {...dockIconProps} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </GlassSurface>
      </div>
    </>
  );
}
// Memoize to prevent unnecessary re-renders
export const Header = memo(HeaderComponent);
