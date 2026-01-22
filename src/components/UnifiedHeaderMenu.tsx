"use client";

import styled from "styled-components";
import { GlassNavigation } from "./GlassNavigation";
import { SocialTooltips } from "./SocialTooltips";

const MasterPill = styled.div`
  display: flex;
  align-items: center;
  background-color: color-mix(in srgb, var(--c-glass, #bbbbbc) 12%, transparent);
  backdrop-filter: blur(12px) saturate(var(--saturation, 150%));
  -webkit-backdrop-filter: blur(12px) saturate(var(--saturation, 150%));
  border-radius: 1rem;
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c-light, #fff) calc(var(--glass-reflex-light, 0.3) * 10%), transparent),
    inset 1px 1px 4px color-mix(in srgb, var(--c-light, #fff) calc(var(--glass-reflex-light, 0.3) * 40%), transparent),
    inset -1px -1px 4px color-mix(in srgb, var(--c-dark, #000) calc(var(--glass-reflex-dark, 2) * 8%), transparent),
    0 4px 12px color-mix(in srgb, var(--c-dark, #000) calc(var(--glass-reflex-dark, 2) * 6%), transparent);
  padding: 2px;
  gap: 0; /* Gap handled by divider margins or internal padding */
  width: fit-content;
  pointer-events: auto;
  transition: all var(--theme-transition, 0.4s ease);
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background-color: color-mix(in srgb, var(--c-light) 20%, transparent);
  margin: 0 8px;
`;

interface NavItem {
    name: string;
    path: string;
    hasDropdown?: boolean;
}

interface UnifiedHeaderMenuProps {
    navItems: NavItem[];
    onDropdownHover: (item: NavItem, isHovering: boolean) => void;
}

export function UnifiedHeaderMenu({ navItems, onDropdownHover }: UnifiedHeaderMenuProps) {
    return (
        <MasterPill>
            <GlassNavigation
                items={navItems}
                onDropdownHover={onDropdownHover}
                isIntegrated={true}
            />
            <Divider />
            <SocialTooltips isIntegrated={true} />
        </MasterPill>
    );
}
