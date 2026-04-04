"use client";

import React from "react";
import Link from "next/link";

interface LiquidButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  testId?: string;
}

export default function LiquidButton({ text, href, onClick, testId }: LiquidButtonProps) {
  const filterId = `gooey-${React.useId().replace(/:/g, "")}`;

  const content = (
    <>
      <span className="button__label">{text}</span>
      <span className="liquid" aria-hidden="true">
        <span style={{ "--i": 0 } as React.CSSProperties}><span></span></span>
        <span style={{ "--i": 1 } as React.CSSProperties}><span></span></span>
        <span style={{ "--i": 2 } as React.CSSProperties}><span></span></span>
        <span style={{ "--i": 3 } as React.CSSProperties}><span></span></span>
        <span style={{ "--i": 4 } as React.CSSProperties}><span></span></span>
        <span style={{ "--i": 5 } as React.CSSProperties}><span></span></span>
        <span style={{ "--i": 6 } as React.CSSProperties}><span></span></span>
        <span className="bg"><span></span></span>
      </span>
      <svg aria-hidden="true">
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="10"></feGaussianBlur>
          <feColorMatrix
            values="1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 20 -10"
          ></feColorMatrix>
        </filter>
      </svg>
    </>
  );

  const styles = (
    <style jsx global>{`
        .liquid-button-shell {
          --liquid-button-width: 212px;
          --liquid-button-height: 74px;
          --liquid-button-pill-width: 192px;
          --liquid-button-pill-height: 58px;
          --liquid-button-pill-top: 8px;
          --liquid-button-liquid-height: 214px;
          --liquid-button-label-size: 1.18rem;
          position: relative;
          display: inline-flex;
          overflow: visible;
        }

        .liquid-button-shell .liquid-button-root {
          background-color: transparent;
          border: none;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          padding: 0;
          inline-size: var(--liquid-button-width);
          min-block-size: var(--liquid-button-height);
          isolation: isolate;
          overflow: visible;
        }

        .liquid-button-shell .liquid-button-root::before {
          content: "";
          position: absolute;
          left: 50%;
          top: var(--liquid-button-pill-top);
          width: var(--liquid-button-pill-width);
          height: var(--liquid-button-pill-height);
          transform: translateX(-50%);
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(43, 124, 200, 0.96), rgba(35, 210, 219, 0.92));
          box-shadow:
            0 18px 34px rgba(3, 14, 34, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.34),
            inset 0 -10px 16px rgba(4, 16, 40, 0.18);
          z-index: 1;
          transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
        }

        .liquid-button-shell .liquid-button-root:hover::before {
          transform: translateX(-50%) translateY(-1px);
          box-shadow:
            0 24px 40px rgba(3, 14, 34, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -12px 18px rgba(4, 16, 40, 0.22);
        }

        .liquid-button-shell .liquid-button-root:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.72);
          outline-offset: 6px;
          border-radius: 999px;
        }

        .liquid-button-shell svg {
          width: 0;
          height: 0;
          position: absolute;
        }

        .button__label {
          position: absolute;
          top: var(--liquid-button-pill-top);
          left: 0;
          width: 100%;
          min-height: var(--liquid-button-pill-height);
          z-index: 9;
          font-size: var(--liquid-button-label-size);
          color: white;
          text-align: center;
          display: grid;
          place-items: center;
          font-weight: 600;
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgb(34, 143, 147);
          letter-spacing: 0.02em;
          user-select: none;
          line-height: 1.05;
          padding: 0 28px;
          text-wrap: balance;
          pointer-events: none;
        }

        .liquid-button-shell .liquid-button-root:hover .liquid > span:not(.bg) {
          animation-play-state: running;
        }

        .liquid-button-shell .liquid-button-root:hover .button__label {
          transform: scale(1.04);
        }

        .liquid-button-shell .liquid-button-root:active .button__label {
          transform: scale(1);
        }

        .liquid {
          filter: url(#${filterId});
          width: var(--liquid-button-width);
          height: var(--liquid-button-liquid-height);
          position: absolute;
          left: 50%;
          top: calc(var(--liquid-button-pill-top) - 14px);
          transform: translateX(-50%);
          z-index: 3;
          pointer-events: none;
        }

        .liquid > span {
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

        .liquid > span > span {
          animation: move 6s ease-in-out infinite;
          animation-delay: calc(0.2s * var(--i));
          background: rgb(77, 159, 170);
          width: 50px;
          height: 50px;
          display: block;
          margin: auto;
          border-radius: 50%;
        }

        .liquid span > span::before {
          content: "";
          position: absolute;
          left: calc(50% - 20px);
          top: 0;
          width: 40px;
          height: 40px;
          background: linear-gradient(#2b7cc8, #23d2db);
          border-radius: 50%;
          box-shadow: 0 0 30px hsl(0, 0%, 69%);
        }

        .liquid span.bg {
          animation: none;
        }

        .liquid span.bg > span::before {
          width: var(--liquid-button-pill-width);
          height: var(--liquid-button-pill-height);
          left: 50%;
          top: var(--liquid-button-pill-top);
          transform: translateX(-50%);
          border-radius: 999px;
        }

        .liquid span:nth-child(2) {
          left: -20px;
        }

        .liquid span:nth-child(1) {
          left: -40px;
        }

        .liquid span:nth-child(3) {
          left: -50px;
        }

        .liquid span:nth-child(4) {
          left: 20px;
        }

        .liquid span:nth-child(7) {
          left: 40px;
        }

        .liquid span:nth-child(6) {
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
          .liquid > span {
            animation-play-state: running;
            animation-duration: 3.3s;
          }

          .liquid > span > span {
            animation-duration: 7.5s;
          }
        }

        @media (max-width: 640px) {
          .liquid-button-shell {
            --liquid-button-width: 188px;
            --liquid-button-height: 70px;
            --liquid-button-pill-width: 170px;
            --liquid-button-pill-height: 54px;
            --liquid-button-pill-top: 8px;
            --liquid-button-liquid-height: 198px;
            --liquid-button-label-size: 1.04rem;
          }

          .button__label {
            padding-inline: 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .liquid > span,
          .liquid > span > span {
            animation: none;
          }
        }
      `}</style>
  );

  if (href) {
    return (
      <>
        <span className="liquid-button-shell">
          <Link href={href} onClick={onClick} data-testid={testId} className="liquid-button-root" aria-label={text}>
            {content}
          </Link>
        </span>
        {styles}
      </>
    );
  }

  return (
    <>
      <span className="liquid-button-shell">
        <button type="button" onClick={onClick} data-testid={testId} className="liquid-button-root" aria-label={text}>
          {content}
        </button>
      </span>
      {styles}
    </>
  );
}
