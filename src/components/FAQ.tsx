import React, { useState } from "react";
import styles from "./FAQ.module.css";
import ScrollReveal from "./ScrollReveal";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.item} ${isOpen ? styles.open : ""}`} onClick={() => setIsOpen(!isOpen)}>
      <div className={styles.questionRow}>
        <h3 className={styles.question}>{question}</h3>
        <span className={styles.arrow}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
      <div className={styles.answerContainer}>
        <p className={styles.answer}>{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const faqs = [
    {
      question: "How does the 48-hour delivery timeline work?",
      answer: "The 48-hour delivery clock starts immediately after our 30-minute kickoff call. This call is essential to review your goals, brand preferences, and structure. Getting this aligned beforehand is what allows us to design and code a flawless, tailored website in under 48 hours."
    },
    {
      question: "What does the $99 fee cover?",
      answer: "The $99 is a kickoff and build slot-locking fee. It guarantees a dedicated developer and designer for your project immediately following your kickoff call. There are no hidden platform markups; you'll only pay for your own domain and standard hosting platform fees."
    },
    {
      question: "Is there really a 100% money-back guarantee?",
      answer: "Yes, absolutely. If we hold our kickoff call and you feel we are not the right fit, or if you review the draft version and are not satisfied, just let us know. We will issue a full 100% refund of your $99 payment immediately. No pressure, no awkward questions."
    },
    {
      question: "Can I connect my own domain and hosting?",
      answer: "Yes. During our kickoff call or via our post-booking guide, you can share your existing domain registrar details. We will configure your DNS records and point them to your new hosting server. If you don't have a domain, we'll help you purchase one."
    },
    {
      question: "Can I customize or update the website myself later?",
      answer: "Yes! Your website is built on Next.js, the most modern web framework. When we hand it over, we provide you with full owner credentials and send a custom 10-minute video walkthrough showing you how to change copy, swap images, and view leads. You won't be locked into a developer contract."
    },
    {
      question: "What happens after I book my kickoff call?",
      answer: "Immediately after scheduling your slot, you will receive a calendar invite and a confirmation email detailing the next steps. We'll ask you to compile any logos, brand color preferences, copy draft ideas, or sample sites you love so that we can hit the ground running."
    }
  ];

  return (
    <section className={styles.faqSection} id="faq-section">
      <ScrollReveal className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.subtitle}>
            Have questions about payments, timelines, or requirements? We've got answers.
          </p>
        </div>

        <div className={styles.list}>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
