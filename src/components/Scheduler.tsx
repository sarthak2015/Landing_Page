"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import styles from "./Scheduler.module.css";

interface SchedulerProps {
  formData: any;
  paymentId: string;
  orderId: string;
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

export default function Scheduler({ formData, paymentId, orderId, onBookingComplete }: SchedulerProps) {
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const hasBookedRef = useRef(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Handle Calendly script already being cached/loaded from a prior mount
  useEffect(() => {
    if (window.Calendly) setScriptLoaded(true);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !widgetContainerRef.current || !window.Calendly) return;

    window.Calendly.initInlineWidget({
      url: CALENDLY_URL,
      parentElement: widgetContainerRef.current,
      prefill: {
        name: formData?.name || "",
        email: formData?.email || ""
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded]);

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
            paymentId,
            orderId,
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
  }, [formData, paymentId, orderId]);

  return (
    <div className={styles.container}>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className={styles.successBadge}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Payment Received Successfully ($99)
      </div>

      <h2 className={styles.title}>Schedule Kickoff Call</h2>
      <p className={styles.subtitle}>
        Payment verified. Pick a time for your 30-minute kickoff call. We'll confirm scope, structure, and design preferences, and you'll have your draft website within 48 hours of this call.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {isConfirming && <div className={styles.errorAlert}>Confirming your booking...</div>}

      <div ref={widgetContainerRef} style={{ minWidth: "320px", height: "700px" }}></div>

      <p className={styles.timeZoneNote}>
        * Slots display in your local timezone. A calendar invitation and email confirmation will be sent by Calendly upon scheduling.
      </p>
    </div>
  );
}
