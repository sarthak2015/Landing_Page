"use client";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq && FB_PIXEL_ID) {
    window.fbq("track", "PageView");
  }
};

export const trackEvent = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, options);
  }
};
