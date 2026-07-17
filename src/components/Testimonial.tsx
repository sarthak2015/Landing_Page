import React, { useState } from "react";
import styles from "./Testimonial.module.css";
import ScrollReveal from "./ScrollReveal";

const REVIEWS = [
  {
    quote: "I was skeptical about a website delivered in 48 hours for $99. But the kickoff call was incredibly thorough. We launched in exactly 36 hours after the call, and our conversion rate went from 1.2% to 4.5% in the first week. The Next.js speed is insane.",
    author: "Marcella Vance",
    role: "Founder, Bloom Floral Studio",
    stat: "+320% Inbound Leads",
    avatar: "MV"
  },
  {
    quote: "Our local consulting agency needed a professional site to capture appointments. We chose Path A, paid the $99 kickoff fee, booked a Tuesday call, and by Thursday night the site was live. We've already booked 14 discovery calls through the built-in system.",
    author: "Devon Brooks",
    role: "Partner, Apex Advisory Group",
    stat: "14 Booked Calls in Week 1",
    avatar: "DB"
  },
  {
    quote: "I went with Path B (Explore first) because we have custom inventory databases. The call was completely pressure-free. The developer mapped out our options, hostings, and gave us a direct checklist. We ended up ordering a custom build. Highly recommended!",
    author: "Kenji Sato",
    role: "Co-Founder, Sato Woodcraft",
    stat: "Zero Pressure Strategy Call",
    avatar: "KS"
  }
];

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className={styles.section} id="testimonials-section">
      <ScrollReveal className={styles.container}>
        <div className={styles.header}>
          <span className={styles.pill}>Client Stories</span>
          <h2 className={styles.title}>Real Results, Real Fast</h2>
        </div>

        <div className={styles.cardContainer}>
          <div key={activeIndex} className={styles.testimonialCard}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="var(--primary-path-a)" stroke="var(--primary-path-a)">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            <p className={styles.quote}>
              "{REVIEWS[activeIndex].quote}"
            </p>

            <div className={styles.footerRow}>
              <div className={styles.user}>
                <div className={styles.avatar}>{REVIEWS[activeIndex].avatar}</div>
                <div className={styles.userInfo}>
                  <span className={styles.name}>{REVIEWS[activeIndex].author}</span>
                  <span className={styles.role}>{REVIEWS[activeIndex].role}</span>
                </div>
              </div>
              
              <div className={styles.metricBox}>
                <span className={styles.metricVal}>{REVIEWS[activeIndex].stat}</span>
                <span className={styles.metricLabel}>Verified Result</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.dots}>
          {REVIEWS.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
