import React from "react";
import styles from "./TrustBar.module.css";
import ScrollReveal from "./ScrollReveal";

export default function TrustBar() {
  return (
    <section className={styles.trustBar}>
      <div className={styles.container}>
        {/* Metric 1 */}
        <ScrollReveal staggerDelay={0} className={styles.metric}>
          <div className={styles.iconCircle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--primary-path-a)"></path>
            </svg>
          </div>
          <div className={styles.info}>
            <span className={styles.value}>4.9/5 Rating</span>
            <span className={styles.label}>from 240+ business owners</span>
          </div>
        </ScrollReveal>

        <div className={styles.divider}></div>

        {/* Metric 2 */}
        <ScrollReveal staggerDelay={120} className={styles.metric}>
          <div className={styles.iconCircle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className={styles.info}>
            <span className={styles.value}>48h Delivery SLA</span>
            <span className={styles.label}>clock starts post-kickoff call</span>
          </div>
        </ScrollReveal>

        <div className={styles.divider}></div>

        {/* Metric 3 */}
        <ScrollReveal staggerDelay={240} className={styles.metric}>
          <div className={styles.iconCircle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div className={styles.info}>
            <span className={styles.value}>100% Refund Guarantee</span>
            <span className={styles.label}>no questions asked if unsatisfied</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
