import React from "react";
import Link from "next/link";
import styles from "./LegalPage.module.css";

export default function LegalPage({
  title,
  updated,
  children
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <nav className={styles.navBar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>Go-Speed</Link>
          <Link href="/" className={styles.backLink}>&larr; Back to site</Link>
        </div>
      </nav>

      <div className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Last updated: {updated}</p>
        {children}
      </div>
    </div>
  );
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className={styles.placeholder}>{children}</span>;
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h2>{heading}</h2>
      {children}
    </div>
  );
}
