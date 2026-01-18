"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, memo } from "react";
import { categories } from "@/data/categories";
import { GlassNavigation } from "./GlassNavigation";
import { SocialTooltips } from "./SocialTooltips";
import { LiquidGlassSwitcher } from "./LiquidGlassSwitcher";
import { useAuth } from "@/contexts/AuthContext";
// Import from centralized GSAP config - plugins are pre-registered there
import { gsap, ScrollTrigger } from "@/lib/gsap/client";
import {
  Phone,
  Menu,
  X,
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
  { name: "Ποιοι Είμαστε", path: "/about" },
  { name: "Επικοινωνία", path: "/contact" },
];

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

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

  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
  };

  const handleNavDropdownHover = (
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
  };

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
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo - Theme-aware with premium hover effect */}
            <Link href="/" className="flex items-center gap-3 group logo-hover">
              {/* Dark theme logo */}
              <Image
                src="/images/LOGOdark.webp"
                alt="AEROFREN"
                width={510}
                height={144}
                className="h-[9rem] w-auto object-contain hidden [html[data-theme='dark']_&]:block -mt-2 ml-2"
                priority
              />
              {/* Light theme logo - slightly larger & shifted down for visual balance */}
              <Image
                src="/images/LOGOlight.webp"
                alt="AEROFREN"
                width={620}
                height={176}
                className="h-[11rem] w-auto object-contain hidden [html[data-theme='light']_&]:block mt-2 -ml-2"
                priority
              />
              {/* Dim theme logo */}
              <Image
                src="/images/LOGOdim.webp"
                alt="AEROFREN"
                width={510}
                height={144}
                className="h-[9rem] w-auto object-contain hidden [html[data-theme='dim']_&]:block -mt-2 ml-2"
                priority
              />
              {/* Default (no theme set = dark) */}
              <Image
                src="/images/LOGOdark.webp"
                alt="AEROFREN"
                width={510}
                height={144}
                className="h-[9rem] w-auto object-contain [html[data-theme]_&]:hidden -mt-2 ml-2"
                priority
              />
            </Link>

            {/* Desktop Navigation with Glass Effect */}
            <nav
              className="hidden lg:flex items-center relative"
              ref={megaMenuRef}
              onMouseLeave={handleMegaMenuLeave}
            >
              <GlassNavigation
                items={navItems}
                onDropdownHover={handleNavDropdownHover}
              />

              {/* Mega Menu for Products */}
              {megaMenuOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[800px] rounded-2xl overflow-hidden"
                  style={{
                    background: "var(--theme-mega-bg)",
                    backdropFilter: "blur(20px)",
                    boxShadow: `
                      inset 1px 1px 0 var(--theme-glass-inset-light),
                      0 20px 50px rgba(0, 0, 0, 0.5)
                    `,
                    border: "1px solid var(--theme-glass-border)",
                    transition: "all var(--theme-transition)",
                  }}
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                      <h3 className="font-bold" style={{ color: 'var(--theme-text)' }}>
                        Κατηγορίες Προϊόντων
                      </h3>
                      <Link
                        href="/products"
                        className="text-sm font-semibold hover:underline flex items-center gap-1"
                        style={{ color: 'var(--theme-accent)' }}
                      >
                        Δες Όλα
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
                        Δεν βρήκατε αυτό που ψάχνετε;
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

            {/* Desktop CTA - Theme Switcher + Social Icons + User */}
            <div className="hidden lg:flex items-center gap-5">
              <LiquidGlassSwitcher />
              <SocialTooltips />

              {/* User Avatar / Login Button - Always render container for stable DOM */}
              <div className="relative" ref={userMenuRef}>
                {user && !authLoading ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full transition-all hover:ring-2 hover:ring-white/20"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt=""
                          className="w-9 h-9 rounded-full ring-2 ring-white/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20">
                          {user.displayName?.[0] || user.email?.[0] || 'U'}
                        </div>
                      )}
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                        style={{
                          background: "rgba(15, 23, 42, 0.95)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white truncate">
                            {user.displayName || 'Χρήστης'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-2">
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
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
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "var(--theme-text)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <User className="w-4 h-4" />
                    Σύνδεση
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden absolute top-full left-0 right-0 max-h-[calc(100vh-6rem)] overflow-auto"
            style={{
              background: "rgba(14, 16, 15, 0.95)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <nav className="p-6 space-y-2">
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-lg font-bold transition-colors ${pathname === item.path
                      ? "text-[#00bae2] bg-white/10"
                      : "text-white hover:bg-white/5"
                      }`}
                  >
                    {item.name}
                  </Link>

                  {/* Mobile Subcategories for Products */}
                  {item.hasDropdown && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-white/20 pl-4">
                      {categories.slice(0, 6).map((category) => (
                        <Link
                          key={category.id}
                          href={`/products/${category.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-gray-400 hover:text-[#00bae2] transition-colors"
                        >
                          {category.nameEl}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-[#00bae2]"
                      >
                        Δες Όλα →
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-center">
                  <SocialTooltips />
                </div>
                <a
                  href="tel:2103461645"
                  className="flex items-center justify-center gap-2 w-full h-12 border border-white/20 rounded-xl font-bold text-white hover:border-[#00bae2] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  210 3461645
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const Header = memo(HeaderComponent);
