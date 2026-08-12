"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./LandingPageContent.module.css";

import Hero from "./Hero";
import TrustBar from "./TrustBar";
import Features from "./Features";
import Testimonial from "./Testimonial";
import FAQ from "./FAQ";
import PathAForm from "./PathAForm";
import Scheduler from "./Scheduler";
import ScrollReveal from "./ScrollReveal";


export default function LandingPageContent() {
  const funnelRef = useRef<HTMLDivElement>(null);

  const [pathAStep, setPathAStep] = useState<"form" | "scheduler" | "confirmed">("form");
  const [savedFormData, setSavedFormData] = useState<any>({});
  const [leadId, setLeadId] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [submitError, setSubmitError] = useState("");

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    setPathAStep("form");
    setTimeout(() => funnelRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
  };

  // Form submitted → save lead → redirect to Calendly
  const handleFormSubmit = async (formData: any) => {
    setSavedFormData(formData);
    setSubmitError("");

    const CALENDLY_BASE_URL = "https://calendly.com/dhruv-go-techsolution/30min";
    const params = new URLSearchParams();
    if (formData?.name) params.set("name", formData.name);
    if (formData?.email) params.set("email", formData.email);
    const calendlyUrl = params.toString() ? `${CALENDLY_BASE_URL}?${params.toString()}` : CALENDLY_BASE_URL;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "submit", formData })
      });

      const data = await response.json();
      if (response.ok && data?.lead?.id) {
        setLeadId(data.lead.id);
      }
    } catch (err) {
      console.error("Failed to save lead in background:", err);
    }

    // Update state to scheduler view and perform direct browser redirect to Calendly
    setPathAStep("scheduler");
    window.location.href = calendlyUrl;
  };

  // Calendly booking complete → confirmed state
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
          {submitError && (
            <div className={styles.submitErrorAlert}>
              <strong>Error:</strong> {submitError}
            </div>
          )}

          <div className="animate-fade-in">
            {pathAStep === "form" && (
              <PathAForm
                onSubmitSuccess={handleFormSubmit}
                savedFormData={savedFormData}
                setSavedFormData={setSavedFormData}
              />
            )}
            {pathAStep === "scheduler" && (
              <Scheduler
                formData={savedFormData}
                leadId={leadId}
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
                <h2 className={styles.confTitle}>You&apos;re All Set!</h2>
                <p className={styles.confSubtitle}>
                  Your kickoff call is confirmed. A confirmation email has been sent to <strong>{savedFormData?.email}</strong>. Here&apos;s how to prepare:
                </p>
                <div className={styles.summaryList}>
                  <div className={styles.summaryItem}>
                    <strong>Scheduled:</strong> {bookingDetails?.formattedDateTime}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Website Type:</strong> {savedFormData?.websiteType}
                  </div>
                </div>
                <div className={styles.prepPanel}>
                  <h3>Prepare for Kickoff:</h3>
                  <ul>
                    <li>Brand identity (logos, colors, font preferences).</li>
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
            <div className={styles.logo}><span>Go-Speed</span></div>
            <p className={styles.footerDesc}>
              Premium, modern websites designed and developed in 48 hours. Book a free kickoff call today.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <strong>Quick Access</strong>
            <a href="#features-section">Features</a>
            <a href="#testimonials-section">Reviews</a>
            <a href="#faq-section">FAQ</a>
          </div>
          <div className={styles.footerGuarantee}>
            <strong>Risk-Free Pledge</strong>
            <p>100% satisfaction guarantee. If we aren&apos;t a fit during the kickoff call, we&apos;ll let you know upfront — no obligation.</p>
          </div>
        </ScrollReveal>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Go-Speed. All rights reserved.</span>
          <span className={styles.footerLegalLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <span className={styles.footerLegalDivider}>•</span>
            <Link href="/terms">Terms of Service</Link>
          </span>
          <span>Designed with high-speed performance and conversion benchmarks.</span>
        </div>
      </footer>

    </div>
  );
}
