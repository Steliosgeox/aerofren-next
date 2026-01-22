"use client";

import React, { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

interface NavItem {
  name: string;
  path: string;
  hasDropdown?: boolean;
}

interface GlassNavigationProps {
  items: NavItem[];
  onItemClick?: (item: NavItem) => void;
  onDropdownHover?: (item: NavItem, isHovering: boolean) => void;
  isIntegrated?: boolean;
}

const StyledWrapper = styled.div<{ $isIntegrated?: boolean }>`
  .glass-nav-group {
    --text: var(--theme-text, #e5e5e5);
    --text-active: var(--theme-text, #fff);
    --accent: var(--theme-accent, #00bae2);

    display: flex;
    position: relative;
    background-color: ${props => props.$isIntegrated ? 'transparent' : 'color-mix(in srgb, var(--c-glass, #bbbbbc) 12%, transparent)'};
    border-radius: ${props => props.$isIntegrated ? '0' : '1rem'};
    backdrop-filter: ${props => props.$isIntegrated ? 'none' : 'blur(12px) saturate(var(--saturation, 150%))'};
    -webkit-backdrop-filter: ${props => props.$isIntegrated ? 'none' : 'blur(12px) saturate(var(--saturation, 150%))'};
    box-shadow: ${props => props.$isIntegrated ? 'none' : `
      inset 0 0 0 1px color-mix(in srgb, var(--c-light, #fff) calc(var(--glass-reflex-light, 0.3) * 10%), transparent),
      inset 1px 1px 4px color-mix(in srgb, var(--c-light, #fff) calc(var(--glass-reflex-light, 0.3) * 40%), transparent),
      inset -1px -1px 4px color-mix(in srgb, var(--c-dark, #000) calc(var(--glass-reflex-dark, 2) * 8%), transparent),
      0 4px 12px color-mix(in srgb, var(--c-dark, #000) calc(var(--glass-reflex-dark, 2) * 6%), transparent)
    `};
    overflow: hidden;
    width: fit-content;
    transition: all var(--theme-transition, 0.4s ease);
  }

  .glass-nav-group input {
    display: none;
  }

  .glass-nav-group label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    font-size: 14px;
    padding: 0.7rem 1.4rem;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: var(--text);
    position: relative;
    z-index: 2;
    transition: color 0.3s ease-in-out;
    text-decoration: none;
    white-space: nowrap;
  }

  .glass-nav-group label:hover {
    color: var(--accent);
  }

  .glass-nav-group input:checked + label {
    color: var(--text-active);
  }

  .glass-glider {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: ${props => props.$isIntegrated ? '0.8rem' : '1rem'};
    z-index: 1;
    transition:
      transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
      width 0.3s ease-in-out,
      background 0.4s ease-in-out,
      box-shadow 0.4s ease-in-out;
    background: linear-gradient(135deg, #0066cc55, #0066cc);
    box-shadow:
      0 0 18px rgba(0, 102, 204, 0.5),
      0 0 10px rgba(100, 180, 255, 0.4) inset;
  }

  .glass-nav-group label.dropdown-indicator::after {
    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    margin-left: 6px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    transition: transform 0.2s ease;
  }

  .glass-nav-group label.dropdown-indicator.dropdown-open::after {
    transform: rotate(180deg);
  }
`;

export function GlassNavigation({
  items,
  onItemClick,
  onDropdownHover,
  isIntegrated = false,
}: GlassNavigationProps) {
  const pathname = usePathname();
  const id = useId(); // Unique ID to prevent radio name collision with multiple instances

  // Calculate which item is active
  const activeIndex = items.findIndex((item) => {
    if (item.path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(item.path);
  });

  // Calculate glider position and width
  const itemWidth = 100 / items.length;

  return (
    <StyledWrapper suppressHydrationWarning $isIntegrated={isIntegrated}>
      <div className="glass-nav-group">
        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            <input
              type="radio"
              name={`nav-${id}`}
              id={`glass-nav-${id}-${index}`}
              checked={activeIndex === index}
              readOnly
            />
            <label
              htmlFor={`glass-nav-${id}-${index}`}
              className={item.hasDropdown ? "dropdown-indicator" : ""}
              onClick={() => onItemClick?.(item)}
              onMouseEnter={() =>
                item.hasDropdown && onDropdownHover?.(item, true)
              }
              onMouseLeave={() =>
                item.hasDropdown && onDropdownHover?.(item, false)
              }
            >
              <Link
                href={item.path}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {item.name}
              </Link>
            </label>
          </React.Fragment>
        ))}
        <div
          className="glass-glider"
          style={{
            width: `calc(${itemWidth}%)`,
            transform: `translateX(${activeIndex >= 0 ? activeIndex * 100 : 0}%)`,
          }}
        />
      </div>
    </StyledWrapper>
  );
}

export default GlassNavigation;
