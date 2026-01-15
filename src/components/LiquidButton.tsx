"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";

interface LiquidButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
}

const LiquidButton: React.FC<LiquidButtonProps> = ({ text, href, onClick }) => {
  const buttonContent = (
    <StyledWrapper>
      <button className="button" onClick={onClick} type="button">
        <p>{text}</p>
        <div className="liquid">
          <span style={{ "--i": 0 } as React.CSSProperties}><span /></span>
          <span style={{ "--i": 1 } as React.CSSProperties}><span /></span>
          <span style={{ "--i": 2 } as React.CSSProperties}><span /></span>
          <span style={{ "--i": 3 } as React.CSSProperties}><span /></span>
          <span style={{ "--i": 4 } as React.CSSProperties}><span /></span>
          <span style={{ "--i": 5 } as React.CSSProperties}><span /></span>
          <span style={{ "--i": 6 } as React.CSSProperties}><span /></span>
          <span className="bg"><span /></span>
        </div>
        <svg>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation={10} />
            <feColorMatrix values="1 0 0 0 0
          0 1 0 0 0 
          0 0 1 0 0
          0 0 0 20 -10" />
          </filter>
        </svg>
      </button>
    </StyledWrapper>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
};

const StyledWrapper = styled.div`
  /* Theme-aware colors */
  --liquid-color: rgba(77, 159, 170, 0.9);
  --liquid-gradient-start: #2b7cc8;
  --liquid-gradient-end: #23d2db;
  --liquid-text: white;
  --liquid-glow: rgba(35, 210, 219, 0.5);
  --liquid-text-shadow: rgba(34, 143, 147, 0.8);

  /* Light theme */
  [data-theme="light"] & {
    --liquid-color: rgba(43, 124, 200, 0.9);
    --liquid-gradient-start: #1a5a8f;
    --liquid-gradient-end: #0891b2;
    --liquid-text: #1a365d;
    --liquid-glow: rgba(8, 145, 178, 0.6);
    --liquid-text-shadow: rgba(26, 90, 143, 0.5);
  }

  /* Dim theme (warmer) */
  [data-theme="dim"] & {
    --liquid-color: rgba(147, 112, 219, 0.9);
    --liquid-gradient-start: #8b5cf6;
    --liquid-gradient-end: #a855f7;
    --liquid-text: white;
    --liquid-glow: rgba(168, 85, 247, 0.5);
    --liquid-text-shadow: rgba(139, 92, 246, 0.8);
  }

  .button {
    background-color: transparent;
    border: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
  }

  .button svg {
    width: 0;
    height: 0;
  }

  .button p {
    width: 180px;
    height: 65px;
    z-index: 9;
    font-size: 18px;
    color: var(--liquid-text);
    text-align: center;
    cursor: pointer;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: all 0.3s ease;
    text-shadow: 0 0 10px var(--liquid-text-shadow);
    letter-spacing: 1.5px;
    user-select: none;
    text-transform: uppercase;
  }

  .button p:hover + .liquid span:not(.bg) {
    animation-play-state: running;
  }

  .button p:hover {
    transform: scale(1.1);
  }

  .button:active p {
    transform: scale(1);
  }

  .button .liquid {
    filter: url(#gooey);
    width: 180px;
    height: 200px;
    position: absolute;
    inset: 0;
  }

  .button .liquid > span {
    position: absolute;
    top: 1px;
    left: -35px;
    width: 100%;
    height: 100%;
    display: block;
    animation: rotate 2.5s ease infinite;
    animation-delay: calc(0.15s * var(--i));
    animation-play-state: paused;
  }

  .button .liquid > span > span {
    animation: move 6s ease-in-out infinite;
    animation-delay: calc(0.2s * var(--i));
    background: var(--liquid-color);
    width: 50px;
    height: 50px;
    display: block;
    margin: auto;
    border-radius: 50%;
  }

  .button .liquid span > span::before {
    content: "";
    position: absolute;
    left: calc(50% - 20px);
    top: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--liquid-gradient-start), var(--liquid-gradient-end));
    border-radius: 50%;
    box-shadow: 0 0 30px var(--liquid-glow);
  }

  .button .liquid span.bg {
    animation: none;
  }

  .button .liquid span.bg > span::before {
    width: 180px;
    height: 55px;
    left: calc(50% - 55px);
    border-radius: 20px;
  }

  .button .liquid span:nth-child(2) {
    left: -20px;
  }
  .button .liquid span:nth-child(1) {
    left: -40px;
  }
  .button .liquid span:nth-child(3) {
    left: -50px;
  }
  .button .liquid span:nth-child(4) {
    left: 20px;
  }
  .button .liquid span:nth-child(7) {
    left: 40px;
  }
  .button .liquid span:nth-child(6) {
    left: 50px;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    80%,
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes move {
    0%,
    100% {
      transform: translateX(0) translateY(0) scale(1);
    }
    20% {
      transform: translateX(-8px) translateY(-4px) scale(1.1);
    }
    40% {
      transform: translateX(8px) translateY(8px) scale(0.9);
    }
    60% {
      transform: translateX(-8px) translateY(4px) scale(1.1);
    }
    80% {
      transform: translateX(5px) translateY(-8px) scale(0.9);
    }
  }

  @media (pointer: coarse), (pointer: none) {
    .button .liquid > span > span {
      background: transparent;
    }
  }
`;

export default LiquidButton;
