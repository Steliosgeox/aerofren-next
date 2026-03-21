"use client";

import Link from "next/link";

interface LiquidButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  testId?: string;
}

const BASE_CLASS_NAME = [
  "liquid-button",
  "group",
  "relative",
  "inline-flex",
  "min-w-[220px]",
  "items-center",
  "justify-center",
  "overflow-hidden",
  "rounded-full",
  "border",
  "border-white/20",
  "bg-[linear-gradient(180deg,rgba(6,16,40,0.9),rgba(4,11,30,0.96))]",
  "px-8",
  "py-4",
  "text-[1.05rem]",
  "font-bold",
  "leading-none",
  "text-white",
  "no-underline",
  "shadow-[0_20px_40px_rgba(3,8,24,0.32),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-10px_18px_rgba(0,0,0,0.22)]",
  "backdrop-blur-[16px]",
  "isolate",
  "transition-all",
  "duration-200",
  "ease-out",
  "hover:-translate-y-0.5",
  "hover:border-white/30",
  "hover:shadow-[0_28px_52px_rgba(3,8,24,0.38),inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-12px_22px_rgba(0,0,0,0.2)]",
  "focus-visible:outline",
  "focus-visible:outline-2",
  "focus-visible:outline-offset-4",
  "focus-visible:outline-white/70",
].join(" ");

function ButtonLayers() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(135deg,rgba(36,142,214,0.98),rgba(26,209,220,0.88))]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.34),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_42%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-4 h-32 w-32 rounded-full bg-white/15 blur-[1px] transition-transform duration-300 group-hover:-translate-y-1"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-8 h-24 w-24 rounded-full bg-white/15 blur-[1px] transition-transform duration-300 group-hover:translate-y-1"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 h-16 w-16 rounded-full bg-white/10 blur-[1px]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[-12%] -left-1/4 w-1/2 -skew-x-[26deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.36),transparent)] opacity-80 transition-transform duration-500 group-hover:translate-x-[280%]"
      />
    </>
  );
}

export default function LiquidButton({ text, href, onClick, testId }: LiquidButtonProps) {
  const label = <span className="relative z-10 whitespace-nowrap text-center">{text}</span>;

  if (href) {
    return (
      <Link href={href} onClick={onClick} data-testid={testId} className={BASE_CLASS_NAME}>
        <ButtonLayers />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} data-testid={testId} className={BASE_CLASS_NAME}>
      <ButtonLayers />
      {label}
    </button>
  );
}
