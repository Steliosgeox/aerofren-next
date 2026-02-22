import { DEFAULT_GLOW_COLOR } from "@/components/magic-bento/constants";

export const createParticleElement = (
  color: string = DEFAULT_GLOW_COLOR
): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: rgba(${color}, 1);
    box-shadow: 0 0 8px rgba(${color}, 0.72);
    pointer-events: none;
    z-index: 3;
    left: 0;
    top: 0;
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0);
  `;
  return el;
};

export const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.78,
});

export const updateCardGlowProperties = (
  card: HTMLElement,
  cardRect: DOMRect,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const relativeX = ((mouseX - cardRect.left) / cardRect.width) * 100;
  const relativeY = ((mouseY - cardRect.top) / cardRect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};
