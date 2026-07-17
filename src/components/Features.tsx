import React from "react";
import styles from "./Features.module.css";
import ScrollReveal from "./ScrollReveal";

export default function Features() {
  const features = [
    {
      title: "Mobile-First Design",
      desc: "Tailored to look stunning and premium on mobile, tablet, and desktop views.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      )
    },
    {
      title: "High-Performance Next.js",
      desc: "Blazing fast loading speeds out of the box, boosting conversion rates and SEO rankings.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    },
    {
      title: "Built-In SEO Foundations",
      desc: "Structured schema markup, XML sitemaps, semantic tags, and optimized meta descriptions.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      )
    },
    {
      title: "Lead & Capture Forms",
      desc: "Polished forms customized for your goals, whether booking clients, capturing leads, or selling.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    {
      title: "Domain & Hosting Setup",
      desc: "We connect your preferred domain and deploy the website to premium global edge CDN hosting.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      title: "Hands-off Site Handover",
      desc: "Receive full administrator permissions along with a 10-minute custom video training guide.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    }
  ];

  return (
    <section className={styles.featuresSection} id="features-section">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>What's Included in the $99 Build</h2>
          <p className={styles.subtitle}>
            Everything you need to go from zero to a live, professional web presence in 48 hours.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feat, index) => (
            <ScrollReveal key={index} staggerDelay={index * 80} className={`${styles.card} ${styles.cardA}`}>
              <div className={styles.icon}>{feat.icon}</div>
              <div className={styles.info}>
                <h3 className={styles.featTitle}>{feat.title}</h3>
                <p className={styles.featDesc}>{feat.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
