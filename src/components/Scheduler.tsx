"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import styles from "./Scheduler.module.css";

interface SchedulerProps {
  formData: any;
  leadId: string;
  onBookingComplete: (bookingDetails: any) => void;
}

const CALENDLY_URL = "https://calendly.com/dhruv-go-techsolution/30min";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, any>;
      }) => void;
    };
  }
}

export default function Scheduler({ formData, leadId, onBookingComplete }: SchedulerProps) {
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const hasBookedRef = useRef(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Construct prefilled direct URL
  const directCalendlyUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (formData?.name) params.set("name", formData.name);
    if (formData?.email) params.set("email", formData.email);
    const queryString = params.toString();
    return queryString ? `${CALENDLY_URL}?${queryString}` : CALENDLY_URL;
  }, [formData?.name, formData?.email]);

  useEffect(() => {
    let isMounted = true;

    const initWidget = () => {
      if (!widgetContainerRef.current || !window.Calendly) return;
      
      // Clear container before initializing to prevent duplicate embeds
      widgetContainerRef.current.innerHTML = "";
      
      try {
        window.Calendly.initInlineWidget({
          url: directCalendlyUrl,
          parentElement: widgetContainerRef.current,
          prefill: {
            name: formData?.name || "",
            email: formData?.email || ""
          }
        });
        if (isMounted) setWidgetLoaded(true);
      } catch (err) {
        console.error("Calendly widget initialization failed:", err);
      }
    };

    if (window.Calendly) {
      initWidget();
    } else {
      let script = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]') as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        document.head.appendChild(script);
      }

      const handleScriptLoad = () => {
        if (isMounted) initWidget();
      };

      script.addEventListener("load", handleScriptLoad);

      // Fallback check in case load event already fired
      const timer = setTimeout(() => {
        if (window.Calendly && isMounted) {
          initWidget();
        }
      }, 800);

      return () => {
        isMounted = false;
        script.removeEventListener("load", handleScriptLoad);
        clearTimeout(timer);
      };
    }
  }, [directCalendlyUrl, formData?.name, formData?.email]);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      if (e.data?.event !== "calendly.event_scheduled") return;
      if (hasBookedRef.current) return;
      hasBookedRef.current = true;

      setIsConfirming(true);
      setError("");

      const eventUri = e.data?.payload?.event?.uri || null;
      const inviteeUri = e.data?.payload?.invitee?.uri || null;

      const bookingDetails = {
        provider: "calendly",
        eventUri,
        inviteeUri,
        formattedDateTime: "Scheduled via Calendly — check your email for the exact time"
      };

      try {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "booking",
            leadId,
            formData,
            bookingDetails
          })
        });

        if (!response.ok) {
          throw new Error("Failed to register calendar slot.");
        }

        onBookingComplete(bookingDetails);
      } catch (err: any) {
        console.error(err);
        hasBookedRef.current = false;
        setError(err.message || "Failed to confirm call booking. Please try again.");
      } finally {
        setIsConfirming(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, leadId]);

  return (
    <div className={styles.container}>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.Calendly && widgetContainerRef.current && !widgetLoaded) {
            window.Calendly.initInlineWidget({
              url: directCalendlyUrl,
              parentElement: widgetContainerRef.current,
              prefill: {
                name: formData?.name || "",
                email: formData?.email || ""
              }
            });
            setWidgetLoaded(true);
          }
        }}
      />

      <h2 className={styles.title}>Schedule Your Free Kickoff Call</h2>
      <p className={styles.subtitle}>
        Pick a time for your free 30-minute kickoff call. We&apos;ll confirm scope, structure, and design preferences — your website will be ready within 48 hours of this call.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {isConfirming && <div className={styles.errorAlert}>Confirming your booking...</div>}

      <div className={styles.directLinkBox}>
        <span className={styles.directLinkText}>
          Having trouble viewing the calendar widget below?
        </span>
        <a
          href={directCalendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.directBtn}
        >
          Open Calendly in New Tab →
        </a>
      </div>

      <div ref={widgetContainerRef} style={{ minWidth: "320px", height: "700px" }}></div>

      <p className={styles.timeZoneNote}>
        * Slots display in your local timezone. A confirmation email will be sent upon scheduling.
      </p>
    </div>
  );
}
