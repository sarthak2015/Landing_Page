"use client";

import React, { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import styles from "./StripePaymentModal.module.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// ── Inner form that uses Stripe hooks ─────────────────────
function CheckoutForm({
  leadId,
  formData,
  onSuccess,
  onCancel
}: {
  leadId: string;
  formData: any;
  onSuccess: (leadId: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // After payment succeeds, return here
        return_url: `${window.location.origin}/?payment_success=true&lead_id=${leadId}`
      },
      // Don't redirect if payment method doesn't need it (e.g. card)
      redirect: "if_required"
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    } else {
      // Payment succeeded without redirect (card payment confirmed in-page)
      onSuccess(leadId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Stripe PaymentElement — renders Stripe's own secure card fields */}
      <div className={styles.stripeElementWrapper}>
        <PaymentElement
          options={{
            layout: "tabs",
            fields: {
              billingDetails: {
                name: "auto",
                email: "auto"
              }
            },
            defaultValues: {
              billingDetails: {
                name: formData?.name || "",
                email: formData?.email || ""
              }
            }
          }}
        />
      </div>

      {errorMessage && (
        <div className={styles.errorMsg}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {errorMessage}
        </div>
      )}

      <div className={styles.btnRow}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.btnCancel}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.btnPay}
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? (
            <span className={styles.spinnerWrapper}>
              <span className={styles.spinner}></span>
              Processing...
            </span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Pay $99.00 Securely
            </>
          )}
        </button>
      </div>

      <div className={styles.poweredBy}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 11 11 13 15 9"/>
        </svg>
        Secured by <strong>Stripe</strong> — Your card info never touches our servers
      </div>
    </form>
  );
}

// ── Modal Wrapper with Elements provider ──────────────────
interface StripePaymentModalProps {
  clientSecret: string;
  leadId: string;
  formData: any;
  onSuccess: (leadId: string) => void;
  onClose: () => void;
}

export default function StripePaymentModal({
  clientSecret,
  leadId,
  formData,
  onSuccess,
  onClose
}: StripePaymentModalProps) {
  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#000000",
      colorBackground: "#ffffff",
      colorText: "#000000",
      colorDanger: "#ff0000",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "10px",
      spacingUnit: "5px"
    },
    rules: {
      ".Input": {
        border: "1.5px solid #e5e5e5",
        boxShadow: "none",
        padding: "12px 14px",
        fontSize: "15px"
      },
      ".Input:focus": {
        border: "1.5px solid #000000",
        boxShadow: "0 0 0 3px rgba(0,0,0,0.08)"
      },
      ".Label": {
        fontWeight: "600",
        fontSize: "13px",
        color: "#333333",
        marginBottom: "6px"
      },
      ".Tab": {
        border: "1.5px solid #e5e5e5",
        borderRadius: "10px"
      },
      ".Tab--selected": {
        border: "1.5px solid #000000",
        boxShadow: "0 0 0 3px rgba(0,0,0,0.08)"
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.lockIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 11 11 13 15 9"/>
              </svg>
            </div>
            <div>
              <div className={styles.headerTitle}>Secure Checkout</div>
              <div className={styles.headerSub}>Bank-level SSL encryption</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.divider}/>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <div className={styles.orderInfo}>
            <div className={styles.orderLabel}>ORDER</div>
            <div className={styles.orderName}>Website Kickoff Package</div>
            <div className={styles.orderDesc}>Build Slot Lock &amp; Setup Consultation</div>
          </div>
          <div className={styles.orderPrice}>$99.00</div>
        </div>

        <div className={styles.divider}/>

        {/* Stripe Elements form */}
        <div className={styles.body}>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <CheckoutForm
              leadId={leadId}
              formData={formData}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </Elements>
        </div>

        {/* Trust badges */}
        <div className={styles.trustRow}>
          <span>✔ 256-bit SSL</span>
          <span>✔ Card info never stored</span>
          <span>✔ Money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}
