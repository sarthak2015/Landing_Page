"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

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

  // Mock checkout modal state (fallback for testing)
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  
  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState("");
  const cardNumberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showMockModal) {
      // Autofocus input
      setTimeout(() => {
        cardNumberRef.current?.focus();
      }, 100);
      // Reset modal values
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardError("");
      setExpiryError("");
      setCvvError("");
      setPaymentError("");
      setPaymentSuccessMessage("");
    }
  }, [showMockModal]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
    
    if (val.length === 0) {
      setCardError("");
    } else if (val.length === 16) {
      setCardError("");
    } else {
      setCardError("Card number must be 16 digits");
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setExpiryDate(formatted);
    
    if (val.length === 0) {
      setExpiryError("");
    } else if (val.length === 4) {
      const month = parseInt(val.substring(0, 2), 10);
      if (month < 1 || month > 12) {
        setExpiryError("Invalid month");
      } else {
        setExpiryError("");
      }
    } else {
      setExpiryError("Format: MM/YY");
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    setCvv(val);
    
    if (val.length === 0) {
      setCvvError("");
    } else if (val.length >= 3) {
      setCvvError("");
    } else {
      setCvvError("Invalid CVV");
    }
  };

  const getCardType = () => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("5")) return "Mastercard";
    if (clean.startsWith("3")) return "Amex";
    if (clean.startsWith("6")) return "Discover";
    return "Unknown";
  };

  const isFormValid = () => {
    const cleanCard = cardNumber.replace(/\s/g, "");
    const cleanExpiry = expiryDate.replace(/\D/g, "");
    return (
      cleanCard.length === 16 &&
      cleanExpiry.length === 4 &&
      cvv.length >= 3 &&
      !cardError &&
      !expiryError &&
      !cvvError
    );
  };

  // Check for URL query pre-fills (Admin panel link redirects)
  useEffect(() => {
    const hasPath = searchParams.get("path");
    const prefill = searchParams.get("prefill");

    if (hasPath === "A" && prefill === "true") {
      setSelectedPath("A");
      setPathAStep("form");

      // Compile prefill form fields
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

      // Smooth scroll to the form workspace
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

  // Step 2: Handle Path A order created -> trigger Razorpay or Mock
  const handlePathAOrderCreated = (formData: any, orderId: string, amount: number) => {
    setSavedFormData(formData);
    setPaymentError("");

    // Check if mock order
    if (orderId.startsWith("order_mock_")) {
      setMockOrderDetails({ orderId, amount, formData });
      setShowMockModal(true);
      return;
    }

    // Trigger Real Razorpay Checkout Standard Modal
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!(window as any).Razorpay) {
      setPaymentError("Payment gateway script failed to load. Please refresh and try again.");
      return;
    }

    const options = {
      key: keyId,
      amount: amount,
      currency: "USD",
      name: "Kickoff Fee",
      description: "Website build — kickoff fee slot reservation.",
      order_id: orderId,
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: "#10b981"
      },
      handler: async function (response: any) {
        try {
          // Send signature verification to server
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              formData
            })
          });

          if (!verifyRes.ok) {
            throw new Error("Payment signature verification failed.");
          }

          const verifyData = await verifyRes.json();
          setPaymentDetails({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id
          });
          setPathAStep("scheduler");
          funnelRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (err: any) {
          setPaymentError(err.message || "Failed to verify transaction signature.");
        }
      },
      modal: {
        ondismiss: function () {
          setPaymentError("Payment modal was closed. Your details are cached—click retry below to complete order.");
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // Mock Success Simulation
  const handleSimulateMockSuccess = async () => {
    if (!mockOrderDetails) return;
    const cleanCard = cardNumber.replace(/\s/g, "");
    if (cleanCard !== "4111111111111111") {
      setPaymentError("Simulated payment failed. Card declined. Please use 4111 1111 1111 1111.");
      return;
    }
    if (!isFormValid()) {
      setPaymentError("Please provide a valid card number, expiry date, and CVV.");
      return;
    }

    setPaymentError("");
    setIsProcessing(true);

    try {
      // Simulate live Stripe processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: mockOrderDetails.orderId,
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
          formData: mockOrderDetails.formData
        })
      });

      if (!verifyRes.ok) throw new Error("Mock verification endpoint failed.");

      const verifyData = await verifyRes.json();
      setPaymentDetails({
        paymentId: verifyData.lead.payment.paymentId,
        orderId: mockOrderDetails.orderId
      });
      
      setPaymentSuccessMessage("Payment Successful! Securely loading scheduler...");
      setTimeout(() => {
        setShowMockModal(false);
        setIsProcessing(false);
        setPathAStep("scheduler");
        funnelRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 1200);
    } catch (err: any) {
      setPaymentError(err.message || "Failed to process sandbox mock transaction.");
      setIsProcessing(false);
    }
  };

  // Mock Failure Simulation
  const handleSimulateMockFailure = () => {
    setPaymentError("Simulated payment declined. Transaction rejected by mock processor bank.");
    setShowMockModal(false);
  };

  // Step 3: Handle Path A Kickoff Scheduled Complete
  const handleBookingComplete = (details: any) => {
    setBookingDetails(details);
    setPathAStep("confirmed");
    funnelRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.wrapper}>
      {/* Script Loader for Razorpay Checkout standard modal */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

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
                <h2 className={styles.confTitle}>Next Steps & Launch Checklist</h2>
                <p className={styles.confSubtitle}>
                  Your build slot is locked. Here is a summary of your kickoff details and how to prepare:
                </p>

                <div className={styles.summaryList}>
                  <div className={styles.summaryItem}>
                    <strong>Kickoff Receipt:</strong> $99.00 USD (Verified success, order: {paymentDetails?.orderId.substring(0, 12)}...)
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
            <p>100% money-back guarantee. If you decide we aren't a fit during the kickoff call, receive an immediate refund.</p>
          </div>
        </ScrollReveal>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Go-Speed. All rights reserved.</span>
          <span>Designed with high-speed performance and conversion benchmarks.</span>
        </div>
      </footer>

      {/* MOCK CHECKOUT MODAL OVERLAY */}
      {showMockModal && mockOrderDetails && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <rect x="9" y="11" width="6" height="5" rx="1"/>
                  <path d="M10 11V9a2 2 0 0 1 4 0v2"/>
                </svg>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Secure Checkout</div>
                  <div style={{ fontWeight: 500, fontSize: "0.78rem", opacity: 0.8 }}>Your payment information is 100% secure and encrypted.</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (isProcessing) return;
                  setShowMockModal(false);
                  setPaymentError("Payment abandoned. Click submit below to retry.");
                }} 
                className={styles.modalCloseBtn}
                disabled={isProcessing}
              >
                X
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Order Summary */}
              <div className={styles.checkoutSummary}>
                <div style={{ textAlign: "left" }}>
                  <span className={styles.checkoutLabel}>ORDER:</span>
                  <div className={styles.checkoutAmountName}>Website Kickoff Slot</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <div className={styles.checkoutAmount}>$99.00</div>
                  <div className={styles.sandboxBadge}>Sandbox Mode</div>
                </div>
              </div>

              {/* Trust badges */}
              <div className={styles.trustBadgesRow}>
                <div className={styles.trustBadgeCol}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 11 11 13 15 9"/>
                  </svg>
                  <div>
                    <strong>SSL Encrypted</strong>
                    <span>Your data is safe</span>
                  </div>
                </div>
                <div className={styles.trustBadgeDivider}></div>
                <div className={styles.trustBadgeCol}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <div>
                    <strong>Secure Payments</strong>
                    <span>Powered by Stripe</span>
                  </div>
                </div>
                <div className={styles.trustBadgeDivider}></div>
                <div className={styles.trustBadgeCol}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 11 11 13 15 9"/>
                  </svg>
                  <div>
                    <strong>Money-Back Guarantee</strong>
                    <span>Your satisfaction matters</span>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className={styles.cardForm}>
                <div className={styles.modalFormGroup}>
                  <label className={styles.modalLabel}>Card Number</label>
                  <div className={styles.inputIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.fieldIcon}>
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <input
                      ref={cardNumberRef}
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className={`${styles.modalInput} ${cardError ? styles.modalInputError : ""}`}
                      disabled={isProcessing}
                    />
                    {getCardType() !== "Unknown" && (
                      <span className={styles.cardBrandBadge}>{getCardType()}</span>
                    )}
                  </div>
                  {cardError ? (
                    <span className={styles.inlineError}>{cardError}</span>
                  ) : (
                    <span className={styles.helperText}>
                      Use <strong>4111 1111 1111 1111</strong> for successful verify, or other for fail.
                    </span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.modalFormGroup}>
                    <label className={styles.modalLabel}>Expiry Date</label>
                    <div className={styles.inputIconWrapper}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.fieldIcon}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className={`${styles.modalInput} ${expiryError ? styles.modalInputError : ""}`}
                        disabled={isProcessing}
                      />
                    </div>
                    {expiryError && <span className={styles.inlineError}>{expiryError}</span>}
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label className={styles.modalLabel} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      CVV 
                      <span className={styles.helpIcon} title="3-digit security code on the back of card">?</span>
                    </label>
                    <div className={styles.inputIconWrapper}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.fieldIcon}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <input 
                        type="password" 
                        placeholder="123" 
                        value={cvv}
                        onChange={handleCvvChange}
                        className={`${styles.modalInput} ${cvvError ? styles.modalInputError : ""}`}
                        disabled={isProcessing}
                      />
                    </div>
                    {cvvError && <span className={styles.inlineError}>{cvvError}</span>}
                  </div>
                </div>
              </div>

              {paymentSuccessMessage && (
                <div className={styles.successMessage}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: "6px" }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {paymentSuccessMessage}
                </div>
              )}

              {/* Action buttons */}
              <div className={styles.modalBtnRow}>
                {/* Bank Simulation Decline Button: Hidden in Live mode, shown in Sandbox test mode */}
                <button
                  onClick={handleSimulateMockFailure}
                  className={styles.modalBtnFail}
                  disabled={isProcessing}
                >
                  Simulate Bank Decline
                </button>
                
                <button
                  onClick={handleSimulateMockSuccess}
                  className={styles.modalBtnSuccess}
                  disabled={isProcessing || !isFormValid()}
                >
                  {isProcessing ? (
                    <span className={styles.spinnerWrapper}>
                      <span className={styles.spinner}></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "6px" }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Complete Secure Payment
                    </>
                  )}
                </button>
              </div>

              {/* Accepted Cards in grayscale */}
              <div className={styles.weAcceptRow}>
                <div className={styles.acceptLine}></div>
                <span className={styles.acceptText}>We accept all major cards</span>
                <div className={styles.acceptLine}></div>
              </div>

              <div className={styles.grayscaleLogos}>
                {/* Visa Logo */}
                <svg width="40" height="13" viewBox="0 0 45 15" fill="currentColor">
                  <path d="M15.5 0h-2.5l-4.5 10.5L6.5 2C6.1 1.2 5.3.3 4.2.3H0v.4C2.5 1.3 4.2 2.5 5 3.3L10 15h2.8l4.2-15H15.5zm11.5 5.5c-1-1-2.5-1.2-3.3-1.2-3 0-4.8 1.5-4.8 3.5 0 3.2 4.5 3.4 4.5 5 0 .6-.8 1.3-2.5 1.3-2 0-3-.8-3-.8l-.5.4c.5.5 2 1.2 3.5 1.2 3.2 0 5-1.6 5-3.8 0-3.3-4.5-3.5-4.5-5 0-.5.6-1 1.8-1 1.5 0 2.2.5 2.2.5l.6-.5zm9.5-5.2h-2.2c-.8 0-1.2.5-1.5 1.2L28 15h2.8s.5-1.2.6-1.5h5.5c.1.5.3 1.5.3 1.5h2.5L36.5.3zm-4.7 10.5c.3-.8 1.8-4.8 1.8-4.8l1 2.8c.2.6.2 1 .2 1h-3zm12.5-10.5h-2.5l-2.8 9.5-1.2-7.5c-.2-.8-.8-1.7-1.8-2h-3.8V.7l3 1.2c1 .4 1.5 1 1.8 1.8l3 11.3h2.8L44.3 0z"/>
                </svg>
                {/* Mastercard Logo circles */}
                <svg width="24" height="15" viewBox="0 0 32 20" fill="currentColor">
                  <circle cx="10" cy="10" r="10" opacity="0.6"/>
                  <circle cx="22" cy="10" r="10" opacity="0.8"/>
                </svg>
                {/* AMEX text card logo */}
                <div className={styles.grayscaleTextLogo}>AMEX</div>
                {/* Discover logo */}
                <div className={styles.grayscaleTextLogo}>DISCOVER</div>
              </div>

              {/* Trust Footer */}
              <div className={styles.trustFooterGrid}>
                <span>✔ SSL Secured</span>
                <span>✔ 256-bit Encryption</span>
                <span>✔ Secure Stripe Payments</span>
                <span>✔ Card details never stored</span>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
