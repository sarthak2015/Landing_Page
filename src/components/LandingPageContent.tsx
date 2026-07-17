"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Import CSS Modules
import styles from "./LandingPageContent.module.css";

// Import Subcomponents
import Hero from "./Hero";
import TrustBar from "./TrustBar";
import Features from "./Features";
import Testimonial from "./Testimonial";
import FAQ from "./FAQ";
import PathAForm from "./PathAForm";
import Scheduler from "./Scheduler";
import ScrollReveal from "./ScrollReveal";

export default function LandingPageContent() {
  const searchParams = useSearchParams();
  const funnelRef = useRef<HTMLDivElement>(null);

  // Core funnel state
  const [selectedPath, setSelectedPath] = useState<"A">("A");
  const [pathAStep, setPathAStep] = useState<"form" | "scheduler" | "confirmed">("form");

  // Lead details caching
  const [savedFormData, setSavedFormData] = useState<any>({});
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Stripe checkout state
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for URL query pre-fills (Admin panel link redirects)
  useEffect(() => {
    const hasPath = searchParams.get("path");
    const prefill = searchParams.get("prefill");

    if (hasPath === "A" && prefill === "true") {
      setSelectedPath("A");
      setPathAStep("form");

      const prefillData = {
        name: searchParams.get("name") || "",
        email: searchParams.get("email") || "",
        phone: searchParams.get("phone") || "",
        businessName: searchParams.get("business") || "",
        industry: searchParams.get("industry") || "",
        budget: searchParams.get("budget") || "",
        hasWebsite: "No"
      };

      setSavedFormData(prefillData);

      setTimeout(() => {
        funnelRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [searchParams]);

  // Handle Stripe Checkout success redirect: ?payment_success=true&lead_id=xxx
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const leadId = searchParams.get("lead_id");
    const sessionId = searchParams.get("session_id");
    const paymentCancelled = searchParams.get("payment_cancelled");

    if (paymentSuccess === "true" && leadId) {
      // Fetch the saved lead from the database to restore form data
      fetch(`/api/payment/lead-data?lead_id=${leadId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.lead) {
            setSavedFormData(data.lead.formData || {});
          }
          setPaymentDetails({
            orderId: leadId,
            paymentId: sessionId || leadId,
            leadId
          });
        })
        .catch(() => {
          // Even if fetch fails, store the IDs so scheduler can save booking
          setPaymentDetails({
            orderId: leadId,
            paymentId: sessionId || leadId,
            leadId
          });
        });

      setPathAStep("scheduler");
      setTimeout(() => {
        funnelRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }

    if (paymentCancelled === "true") {
      setPaymentError("Payment was cancelled. Your details are saved — click \"Complete Setup & Pay\" to try again.");
      setTimeout(() => {
        funnelRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [searchParams]);

  // Handler for main Hero CTA
  const handleGetStarted = () => {
    setPathAStep("form");
    setTimeout(() => {
      funnelRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Step 2: Handle Path A form submission -> redirect to Stripe Checkout
  const handlePathAOrderCreated = async (formData: any) => {
    setSavedFormData(formData);
    setPaymentError("");
    setIsStripeLoading(true);

    try {
      const response = await fetch("/api/payment/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      // Redirect the browser to Stripe hosted checkout page
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL received from Stripe.");
      }
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      setPaymentError(err.message || "Payment setup failed. Please try again.");
      setIsStripeLoading(false);
    }
  };

  // Step 3: Handle Path A Kickoff Scheduled Complete
  const handleBookingComplete = (details: any) => {
    setBookingDetails(details);
    setPathAStep("confirmed");
    funnelRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.wrapper}>
      {/* Global Navigation Header */}
      <nav className={`${styles.navBar} ${scrolled ? styles.navBarScrolled : ""}`}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <span>Go-Speed</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features-section">Features</a>
            <a href="#testimonials-section">Reviews</a>
            <a href="#faq-section">FAQ</a>
            <a href="/admin" className={styles.adminLink} target="_blank">
              Admin Console
            </a>
          </div>
        </div>
      </nav>

      {/* Hero with Single CTA */}
      <Hero onGetStarted={handleGetStarted} />

      {/* Trust bar metrics */}
      <TrustBar />

      {/* Active Form funnel Workspace */}
      <div ref={funnelRef} className={styles.funnelWorkspace} id="funnel-workspace">
        <ScrollReveal className={styles.workspaceContainer}>
          {/* Error alerts if payments failed */}
          {paymentError && (
            <div className={styles.paymentErrorAlert}>
              <div>
                <strong>Payment Alert:</strong> {paymentError}
              </div>
            </div>
          )}

          {/* PATH A VIEWS */}
          <div className="animate-fade-in">
            {pathAStep === "form" && (
              <PathAForm
                onSubmitSuccess={handlePathAOrderCreated}
                savedFormData={savedFormData}
                setSavedFormData={setSavedFormData}
                isStripeLoading={isStripeLoading}
              />
            )}
            {pathAStep === "scheduler" && (
              <Scheduler
                formData={savedFormData}
                paymentId={paymentDetails?.paymentId}
                orderId={paymentDetails?.orderId}
                onBookingComplete={handleBookingComplete}
              />
            )}
            {pathAStep === "confirmed" && (
              <div className={styles.confCard}>
                <div className={styles.checkmarkWrapper}>
                  <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
                    <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
                <div className={styles.confBadge}>Kickoff Call Booked</div>
                <h2 className={styles.confTitle}>Next Steps &amp; Launch Checklist</h2>
                <p className={styles.confSubtitle}>
                  Your build slot is locked. Here is a summary of your kickoff details and how to prepare:
                </p>

                <div className={styles.summaryList}>
                  <div className={styles.summaryItem}>
                    <strong>Kickoff Receipt:</strong> $99.00 USD (Verified ✓)
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Scheduled Date:</strong> {bookingDetails?.formattedDateTime} (Google Calendar invite sent)
                  </div>
                </div>

                <div className={styles.prepPanel}>
                  <h3>Prepare for Kickoff:</h3>
                  <ul>
                    <li>Brand identity (Logos, choice colors, font preferences).</li>
                    <li>Existing site links or reference sites you love the design of.</li>
                    <li>Copy draft or bullet points about your services/products.</li>
                    <li>High-res images or portfolio assets you want embedded.</li>
                  </ul>
                </div>

                <div className={styles.slaPanel}>
                  <strong>Our Launch SLA Guarantee:</strong> We will build, optimize, and launch your draft website within 48 hours of our kickoff call.
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Features section */}
      <Features />

      {/* Testimonials */}
      <Testimonial />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <footer className={styles.footer}>
        <ScrollReveal className={styles.footerContainer}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <span>Go-Speed</span>
            </div>
            <p className={styles.footerDesc}>
              Premium, modern websites designed and developed in 48 hours for $99. Risk-free slot reservations.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <strong>Quick Access</strong>
            <a href="#features-section">Features</a>
            <a href="#testimonials-section">Reviews</a>
            <a href="#faq-section">FAQ</a>
            <a href="/admin" target="_blank">Admin Control</a>
          </div>
          <div className={styles.footerGuarantee}>
            <strong>Risk-Free Pledge</strong>
            <p>100% money-back guarantee. If you decide we aren&apos;t a fit during the kickoff call, receive an immediate refund.</p>
          </div>
        </ScrollReveal>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Go-Speed. All rights reserved.</span>
          <span>Designed with high-speed performance and conversion benchmarks.</span>
        </div>
      </footer>

      {/* Stripe loading overlay - shown while redirecting to Stripe Checkout */}
      {isStripeLoading && (
        <div className={styles.modalOverlay}>
          <div className={styles.stripeLoadingCard}>
            <div className={styles.stripeLoadingIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 11 11 13 15 9"/>
              </svg>
            </div>
            <div className={styles.stripeLoadingSpinner}></div>
            <div className={styles.stripeLoadingTitle}>Redirecting to Secure Checkout</div>
            <div className={styles.stripeLoadingSubtitle}>
              You are being redirected to Stripe&apos;s encrypted payment page. Please do not close this window.
            </div>
            <div className={styles.stripeLoadingBadges}>
              <span>🔒 SSL Encrypted</span>
              <span>✓ Powered by Stripe</span>
              <span>↩ Returns to this page</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
