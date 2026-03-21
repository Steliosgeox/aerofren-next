"use client";

import React from "react";
import Link from "next/link";

let liquidButtonIdCounter = 0;

interface LiquidButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  testId?: string;
}

export default function LiquidButton({ text, href, onClick, testId }: LiquidButtonProps) {
  const idRef = React.useRef<string | null>(null);
  if (idRef.current === null) {
    idRef.current = `gooey-${liquidButtonIdCounter++}`;
  }
  const filterId = idRef.current;

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
      <style jsx>{`
        .button {
          background-color: transparent;
          border: none;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          cursor: pointer;
          text-decoration: none;
          padding: 0;
        }

        .button svg {
          width: 0;
          height: 0;
        }

        .button__label {
          width: 150px;
          min-height: 60px;
          z-index: 9;
          font-size: 20px;
          color: white;
          text-align: center;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgb(34, 143, 147);
          letter-spacing: 1px;
          user-select: none;
          line-height: 1.15;
        }

        .button:hover .liquid > span:not(.bg) {
          animation-play-state: running;
        }

        .button:hover .button__label {
          transform: scale(1.1);
        }

        .button:active .button__label {
          transform: scale(1);
        }

        .button .liquid {
          filter: url(#${filterId});
          width: 150px;
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
          background: rgb(77, 159, 170);
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
          background: linear-gradient(#2b7cc8, #23d2db);
          border-radius: 50%;
          box-shadow: 0 0 30px hsl(0, 0%, 69%);
        }

        .button .liquid span.bg {
          animation: none;
        }

        .button .liquid span.bg > span::before {
          width: 150px;
          height: 50px;
          left: calc(50% - 40px);
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
      `}</style>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} data-testid={testId} className="button" aria-label={text}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} data-testid={testId} className="button" aria-label={text}>
      {content}
    </button>
  );
}
