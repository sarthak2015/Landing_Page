"use client";

import React, { useState, useEffect } from "react";
import styles from "./PathAForm.module.css";

interface PathAFormProps {
  onSubmitSuccess: (formData: any, orderId: string, amount: number) => void;
  savedFormData: any;
  setSavedFormData: (data: any) => void;
}

interface PathAFormData {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  countryCode: string;
  websiteType: string;
  selectedPages: string[];
  selectedFeatures: string[];
  hasDomain: string;
  domainName: string;
  hasLogo: string;
  contentReady: string;
  referenceWebsites: string;
  additionalInfo: string;
}

const WEBSITE_TYPES = [
  "Business Website",
  "Personal Website",
  "Portfolio",
  "Restaurant / Café",
  "Salon / Spa",
  "Real Estate",
  "Healthcare / Clinic",
  "Gym / Fitness",
  "Construction",
  "Education / Coaching",
  "Event Website",
  "Landing Page",
  "Other"
];

const PAGE_OPTIONS = [
  "Home",
  "About Us",
  "Services",
  "Products",
  "Gallery",
  "Testimonials",
  "FAQ",
  "Contact Us",
  "Blog (Optional)",
  "Other"
];

const FEATURE_OPTIONS = [
  "Contact Form",
  "WhatsApp Chat Button",
  "Google Maps",
  "Social Media Links",
  "Call Now Button",
  "Photo Gallery",
  "Basic SEO Setup",
  "Newsletter Signup",
  "Other"
];

export default function PathAForm({ onSubmitSuccess, savedFormData, setSavedFormData }: PathAFormProps) {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState<PathAFormData>({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    countryCode: "+1",
    websiteType: "",
    selectedPages: [] as string[],
    selectedFeatures: [] as string[],
    hasDomain: "No",
    domainName: "",
    hasLogo: "No",
    contentReady: "No, I need help",
    referenceWebsites: "",
    additionalInfo: "",
    ...savedFormData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cache form entries locally
  useEffect(() => {
    localStorage.setItem("path_a_form_data", JSON.stringify(formData));
    setSavedFormData(formData);
  }, [formData, setSavedFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, websiteType: type }));
    if (errors.websiteType) {
      setErrors((prev) => ({ ...prev, websiteType: "" }));
    }
  };

  const handlePageToggle = (page: string) => {
    setFormData((prev) => {
      const selectedPages = prev.selectedPages.includes(page)
        ? prev.selectedPages.filter((p) => p !== page)
        : [...prev.selectedPages, page];
      return { ...prev, selectedPages };
    });
    if (errors.selectedPages) {
      setErrors((prev) => ({ ...prev, selectedPages: "" }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => {
      const selectedFeatures = prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter((f) => f !== feature)
        : [...prev.selectedFeatures, feature];
      return { ...prev, selectedFeatures };
    });
    if (errors.selectedFeatures) {
      setErrors((prev) => ({ ...prev, selectedFeatures: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
    
    // Email Check
    const email = formData.email.trim();
    const emailLower = email.toLowerCase();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    
    const blocklistedEmails = [
      "test@test.com", "abc@abc.com", "xyz@xyz.com", 
      "user@example.com", "john@example.com", "placeholder@domain.com", 
      "hello@hello.com", "dummy@dummy.com", "mail@mail.com", "admin@admin.com"
    ];

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email address (e.g. name@company.com)";
    } else if (blocklistedEmails.includes(emailLower) || emailLower.startsWith("test@") || emailLower.startsWith("demo@")) {
      newErrors.email = "Placeholder or fake emails are not accepted. Please enter a working business email.";
    }
    
    // Phone Check
    let digits = formData.phone.replace(/[\s-()]/g, "");
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // Strip leading zero for country codes that utilize trunk prefixes
      const trunkPrefixCountries = ["+44", "+61", "+971", "+81", "+33", "+49"];
      if (trunkPrefixCountries.includes(formData.countryCode) && digits.startsWith("0")) {
        digits = digits.substring(1);
      }

      if (formData.countryCode === "+1") {
        // US/Canada: exactly 10 digits, starts with 2-9
        if (!/^[2-9]\d{9}$/.test(digits)) {
          newErrors.phone = "US phone numbers must be exactly 10 digits and cannot start with 0 or 1.";
        }
      } else if (formData.countryCode === "+91") {
        // India: exactly 10 digits, starts with 6-9
        if (!/^[6-9]\d{9}$/.test(digits)) {
          newErrors.phone = "Indian mobile numbers must be exactly 10 digits and start with 6, 7, 8, or 9.";
        }
      } else if (formData.countryCode === "+44") {
        // UK: exactly 10 digits
        if (!/^\d{10}$/.test(digits)) {
          newErrors.phone = "UK numbers must be exactly 10 digits (excluding leading zero).";
        }
      } else if (formData.countryCode === "+61") {
        // Australia: exactly 9 digits
        if (!/^\d{9}$/.test(digits)) {
          newErrors.phone = "Australian numbers must be exactly 9 digits (excluding leading zero).";
        }
      } else if (formData.countryCode === "+971") {
        // UAE: exactly 9 digits
        if (!/^\d{9}$/.test(digits)) {
          newErrors.phone = "UAE numbers must be exactly 9 digits (excluding leading zero).";
        }
      } else if (formData.countryCode === "+86") {
        // China: exactly 11 digits, starts with 1
        if (!/^1\d{10}$/.test(digits)) {
          newErrors.phone = "Chinese numbers must be exactly 11 digits starting with 1.";
        }
      } else if (formData.countryCode === "+81") {
        // Japan: 9 or 10 digits
        if (!/^\d{9,10}$/.test(digits)) {
          newErrors.phone = "Japanese numbers must be 9 or 10 digits (excluding leading zero).";
        }
      } else if (["+33", "+49"].includes(formData.countryCode)) {
        // France/Germany: 9 to 11 digits
        if (!/^\d{9,11}$/.test(digits)) {
          newErrors.phone = "European phone numbers must be between 9 and 11 digits (excluding leading zero).";
        }
      } else {
        // Generic fallback: 7 to 15 digits
        if (!/^\d{7,15}$/.test(digits)) {
          newErrors.phone = "Please enter a valid phone number (7-15 digits).";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.websiteType) {
      newErrors.websiteType = "Please select a website type";
    }
    if (formData.selectedPages.length === 0) {
      newErrors.selectedPages = "Please select at least one page";
    }
    if (formData.selectedFeatures.length === 0) {
      newErrors.selectedFeatures = "Please select at least one feature";
    }
    if (formData.hasDomain === "Yes" && !formData.domainName.trim()) {
      newErrors.domainName = "Please enter your domain name";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setTimeout(() => {
        const workspaceHeader = document.getElementById("funnel-workspace");
        workspaceHeader?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleBack = () => {
    setStep(1);
    setTimeout(() => {
      const workspaceHeader = document.getElementById("funnel-workspace");
      workspaceHeader?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      // Create Razorpay Order server side
      const response = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: `${formData.countryCode}${formData.phone}`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout order");
      }

      const order = await response.json();
      
      // Trigger checkout standard payment
      onSubmitSuccess(formData, order.id, order.amount);
    } catch (error: any) {
      console.error(error);
      setErrors({ form: error.message || "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formCard}>
      {/* Progress header bar */}
      <div className={styles.progress}>
        <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ""}`}>
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepLabel}>Contact</span>
        </div>
        <div className={styles.progressLine}>
          <div className={styles.progressLineFill} style={{ width: step === 2 ? "100%" : "0%" }}></div>
        </div>
        <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ""}`}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Project Scope</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.form && <div className={styles.formError}>{errors.form}</div>}

        {/* STEP 1: CONTACT INFO */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? styles.inputError : ""}
                  placeholder="John Doe"
                  required
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="businessName">Business Name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={errors.businessName ? styles.inputError : ""}
                  placeholder="Acme Co."
                  required
                />
                {errors.businessName && <span className={styles.errorText}>{errors.businessName}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Business Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? styles.inputError : ""}
                placeholder="john@example.com"
                required
              />
              <span className={styles.helperText}>Used for receipt + booking confirmation</span>
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <div className={styles.phoneInputContainer}>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className={styles.countrySelect}
                >
                  <option value="+1">US +1</option>
                  <option value="+91">IN +91</option>
                  <option value="+44">GB +44</option>
                  <option value="+61">AU +61</option>
                  <option value="+971">AE +971</option>
                  <option value="+86">CN +86</option>
                  <option value="+81">JP +81</option>
                  <option value="+33">FR +33</option>
                  <option value="+49">DE +49</option>
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${styles.phoneInput} ${errors.phone ? styles.inputError : ""}`}
                  placeholder="9876543210"
                  required
                />
              </div>
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            <button type="button" onClick={handleNext} className={styles.btnNext}>
              Next: Website Scope
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        )}

        {/* STEP 2: PROJECT QUESTIONNAIRE */}
        {step === 2 && (
          <div className={styles.stepContent}>
            
            {/* Section 1: Website Type */}
            <div className={styles.sectionBlock}>
              <label className={styles.sectionLabel}>Section 1: What type of website do you need? *</label>
              {errors.websiteType && <span className={styles.errorText}>{errors.websiteType}</span>}
              <div className={styles.cardsGrid}>
                {WEBSITE_TYPES.map((type) => {
                  const isSelected = formData.websiteType === type;
                  return (
                    <div
                      key={type}
                      className={`${styles.selectCard} ${isSelected ? styles.selectCardActive : ""}`}
                      onClick={() => handleTypeSelect(type)}
                    >
                      <div className={styles.radioIndicator}>
                        <div className={styles.radioInner} style={{ display: isSelected ? "block" : "none" }}></div>
                      </div>
                      <span>{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Pages Requested */}
            <div className={styles.sectionBlock}>
              <label className={styles.sectionLabel}>Section 2: Which pages do you need? *</label>
              <span className={styles.sectionInstructions}>Select pages to include. Up to 6 pages are included in your base package.</span>
              {errors.selectedPages && <span className={styles.errorText}>{errors.selectedPages}</span>}
              
              <div className={styles.cardsGrid}>
                {PAGE_OPTIONS.map((page) => {
                  const isSelected = formData.selectedPages.includes(page);
                  return (
                    <div
                      key={page}
                      className={`${styles.selectCard} ${isSelected ? styles.selectCardActive : ""}`}
                      onClick={() => handlePageToggle(page)}
                    >
                      <div className={styles.checkboxIndicator}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span>{page}</span>
                    </div>
                  );
                })}
              </div>

              {formData.selectedPages.length > 6 && (
                <div className={styles.warningBox}>
                  Your package includes up to 6 pages. Additional pages may incur extra charges.
                </div>
              )}
            </div>

            {/* Section 3: Features */}
            <div className={styles.sectionBlock}>
              <label className={styles.sectionLabel}>Section 3: What features do you need? *</label>
              {errors.selectedFeatures && <span className={styles.errorText}>{errors.selectedFeatures}</span>}
              <div className={styles.checkboxGrid}>
                {FEATURE_OPTIONS.map((feat) => {
                  const isChecked = formData.selectedFeatures.includes(feat);
                  return (
                    <label key={feat} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFeatureToggle(feat)}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxBox}></span>
                      {feat}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 4 & 5: Domain & Logo */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Section 4: Do you already have a domain name? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasDomain"
                      value="Yes"
                      checked={formData.hasDomain === "Yes"}
                      onChange={handleChange}
                    />
                    Yes
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasDomain"
                      value="No"
                      checked={formData.hasDomain === "No"}
                      onChange={handleChange}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Section 5: Do you already have a logo? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasLogo"
                      value="Yes"
                      checked={formData.hasLogo === "Yes"}
                      onChange={handleChange}
                    />
                    Yes
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasLogo"
                      value="No"
                      checked={formData.hasLogo === "No"}
                      onChange={handleChange}
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4 Input: Domain Name Input */}
            {formData.hasDomain === "Yes" && (
              <div className={styles.formGroup}>
                <label htmlFor="domainName">Domain Name *</label>
                <input
                  type="text"
                  id="domainName"
                  name="domainName"
                  value={formData.domainName}
                  onChange={handleChange}
                  className={errors.domainName ? styles.inputError : ""}
                  placeholder="example.com"
                  required
                />
                {errors.domainName && <span className={styles.errorText}>{errors.domainName}</span>}
              </div>
            )}

            {/* Section 6: Content Status */}
            <div className={styles.formGroup}>
              <label>Section 6: Do you have your website content ready? *</label>
              <div className={styles.radioGrid}>
                <label className={styles.radioCardLabel}>
                  <input
                    type="radio"
                    name="contentReady"
                    value="Yes (Text & Images)"
                    checked={formData.contentReady === "Yes (Text & Images)"}
                    onChange={handleChange}
                  />
                  Yes (Text & Images)
                </label>
                <label className={styles.radioCardLabel}>
                  <input
                    type="radio"
                    name="contentReady"
                    value="Partially"
                    checked={formData.contentReady === "Partially"}
                    onChange={handleChange}
                  />
                  Partially
                </label>
                <label className={styles.radioCardLabel}>
                  <input
                    type="radio"
                    name="contentReady"
                    value="No, I need help"
                    checked={formData.contentReady === "No, I need help"}
                    onChange={handleChange}
                  />
                  No, I need help
                </label>
              </div>
            </div>

            {/* Section 7: References */}
            <div className={styles.formGroup}>
              <label htmlFor="referenceWebsites">Section 7: Reference Websites (Optional)</label>
              <textarea
                id="referenceWebsites"
                name="referenceWebsites"
                value={formData.referenceWebsites}
                onChange={handleChange}
                rows={2}
                placeholder="Paste 1–3 website links that you like."
              ></textarea>
            </div>

            {/* Section 8: Additional Information */}
            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo">Section 8: Additional Information (Optional)</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                maxLength={500}
                rows={3}
                placeholder="Tell us about your business, preferred design style, colors, target audience, or anything you'd like us to include on your website."
              ></textarea>
              <div className={styles.charCount}>{formData.additionalInfo.length}/500</div>
            </div>

            <div className={styles.btnRow}>
              <button type="button" onClick={handleBack} className={styles.btnBack} disabled={isSubmitting}>
                Back
              </button>
              
              <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Generating Slot..." : "Continue to payment — $99"}
              </button>
            </div>

            <p className={styles.microcopy}>
              * You'll pay $99 now to lock your build slot. We'll book your 30-minute kickoff call right after, and your website will be ready within 48 hours of that call.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
