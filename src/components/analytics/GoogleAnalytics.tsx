"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

export function GoogleAnalytics() {
  const { isReady, allowAnalytics } = useCookieConsent();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") {
      return;
    }

    (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] =
      !allowAnalytics;
  }, [allowAnalytics, measurementId]);

  if (!measurementId || !isReady || !allowAnalytics) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
