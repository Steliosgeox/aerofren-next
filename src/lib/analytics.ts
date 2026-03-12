export type LeadEventName =
  | "phone_click"
  | "email_click"
  | "contact_form_submit"
  | "map_directions_click"
  | "chat_signup_click"
  | "category_cta_click"
  | "subcategory_cta_click";

export type LeadEventParams = {
  location: string;
  page_type: string;
  category_slug?: string;
  subcategory_slug?: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLeadEvent(
  eventName: LeadEventName,
  params: LeadEventParams,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.gtag?.("event", eventName, params);
}
