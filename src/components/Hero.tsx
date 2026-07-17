import React from "react";
import styles from "./Hero.module.css";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.badge}>
          <span className={styles.badgePulse}></span>
          48-Hour Website Launch Program
        </div>
        
        <h1 className={styles.title}>
          Get a Premium, High-Converting Website for <span className={styles.highlight}>$99</span>
        </h1>
        
        <p className={styles.subtitle}>
          No bloated agency fees. No endless delays. Just a world-class, professional website designed to capture leads, sell products, or showcase your portfolio—delivered within 48 hours of our kickoff call.
        </p>

        <div className={styles.ctaContainer}>
          <button onClick={onGetStarted} className={styles.ctaButton} aria-label="Start Website Setup & Pay">
            Start Website Setup & Lock Slot
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: "8px" }}>
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          
          <div className={styles.trustRow}>
            <span>48-Hour Delivery Program</span>
            <span className={styles.trustDot}>•</span>
            <span>100% Money-Back Guarantee</span>
            <span className={styles.trustDot}>•</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </section>
  );
}
