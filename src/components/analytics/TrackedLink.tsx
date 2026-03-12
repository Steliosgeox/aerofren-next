"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import { trackLeadEvent, type LeadEventName, type LeadEventParams } from "@/lib/analytics";

type AnchorProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "onClick">;

interface TrackedLinkProps extends AnchorProps {
  children: ReactNode;
  eventName: LeadEventName;
  eventParams: LeadEventParams;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  prefetch?: boolean;
}

export function TrackedLink({
  children,
  eventName,
  eventParams,
  href,
  onClick,
  prefetch = false,
  ...props
}: TrackedLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      trackLeadEvent(eventName, eventParams);
    }
  };

  if (href.startsWith("/")) {
    return (
      <Link href={href} onClick={handleClick} prefetch={prefetch} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
