"use client";

import React, { useState, useEffect } from "react";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedLinkMap, setCopiedLinkMap] = useState<Record<string, boolean>>({});

  // Check login state on mount
  useEffect(() => {
    const session = sessionStorage.getItem("admin_session");
    if (session) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userId, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed.");
      }

      const data = await response.json();
      sessionStorage.setItem("admin_session", data.token);
      setIsAuthenticated(true);
      fetchData();
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_session");
    setIsAuthenticated(false);
    setLeads([]);
    setUserId("");
    setPassword("");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch database records.");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || "Failed to load database files.");
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentLink = (lead: any) => {
    const origin = window.location.origin;
    const query = new URLSearchParams({
      path: "A",
      prefill: "true",
      name: lead.formData.name || "",
      email: lead.formData.email || "",
      phone: lead.formData.phone?.replace(/^\+\d+/, "") || "",
      business: lead.formData.businessName || "",
      industry: lead.formData.industry || "",
      budget: lead.formData.budget || ""
    }).toString();

    const link = `${origin}/?${query}`;
    navigator.clipboard.writeText(link);
    
    setCopiedLinkMap((prev) => ({ ...prev, [lead.id]: true }));
    setTimeout(() => {
      setCopiedLinkMap((prev) => ({ ...prev, [lead.id]: false }));
    }, 2000);
  };

  // Filter leads based on target columns
  const paidCustomers = leads.filter(
    (l) => l.type === "build_ready" && (l.status === "paid" || l.status === "scheduled")
  );

  const phoneInquiries = leads.filter(
    (l) => l.type === "explore_callback" && l.status === "pending_call"
  );

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Go-Speed</h1>
            <p>Admin Portal Authentication Required</p>
          </div>
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            {authError && <div className={styles.authError}>{authError}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
              {isSubmitting ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div>
            <h1 className={styles.title}>Admin Control Center</h1>
            <p className={styles.subtitle}>Manage paid clients, inbound callback requests, and pre-fill shortcut checkouts.</p>
          </div>
          <div className={styles.headerBtnGroup}>
            <button onClick={fetchData} className={styles.refreshBtn}>
              Sync Records
            </button>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <div className={styles.loader}>Syncing secure records...</div>
        ) : (
          <div className={styles.dashboardLayout}>
            {/* COLUMN 1: Paid Customers */}
            <div className={styles.column}>
              <h2 className={styles.columnHeader}>
                Paid Customers ({paidCustomers.length})
              </h2>
              {paidCustomers.length === 0 ? (
                <div className={styles.emptyState}>No paid transactions recorded.</div>
              ) : (
                <div className={styles.list}>
                  {paidCustomers.map((lead) => (
                    <div key={lead.id} className={styles.leadCard}>
                      <div className={styles.cardHeaderRow}>
                        <span className={styles.statusBadgePaid}>
                          {lead.status.toUpperCase()}
                        </span>
                        <span className={styles.timestamp}>
                          {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={styles.cardMain}>
                        <h3 className={styles.leadName}>{lead.formData.name}</h3>
                        <p className={styles.leadContact}>
                          Email: {lead.formData.email} | Phone: {lead.formData.phone}
                        </p>
                        {lead.formData.businessName && (
                          <p className={styles.leadBiz}>Company: {lead.formData.businessName}</p>
                        )}
                      </div>

                      <div className={styles.leadDetails}>
                        <p><strong>Website Type:</strong> {lead.formData.websiteType}</p>
                        <p><strong>Pages:</strong> {lead.formData.selectedPages?.join(", ") || "None"}</p>
                        <p><strong>Features:</strong> {lead.formData.selectedFeatures?.join(", ") || "None"}</p>
                        <p><strong>Domain:</strong> {lead.formData.hasDomain === "Yes" ? `Yes (${lead.formData.domainName})` : "No (Needs Domain)"}</p>
                        <p><strong>Logo Status:</strong> {lead.formData.hasLogo === "Yes" ? "Yes, has logo" : "No, needs logo"}</p>
                        <p><strong>Content Status:</strong> {lead.formData.contentReady}</p>
                        {lead.formData.referenceWebsites && <p><strong>References:</strong> {lead.formData.referenceWebsites}</p>}
                        {lead.formData.additionalInfo && <p className={styles.noteField}><strong>Notes:</strong> "{lead.formData.additionalInfo}"</p>}
                        
                        {lead.payment && (
                          <div className={styles.paymentInfo}>
                            Paid $99 via {lead.payment.method} (Order: {lead.payment.orderId.substring(0, 12)}...)
                          </div>
                        )}
                        {lead.booking ? (
                          <div className={styles.bookingInfo}>
                            Kickoff Scheduled: {lead.booking.formattedDateTime}
                          </div>
                        ) : (
                          <div className={styles.bookingPending}>
                            Call booking pending
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: Phone Inquiries */}
            <div className={styles.column}>
              <h2 className={styles.columnHeader}>
                Phone Inquiries ({phoneInquiries.length})
              </h2>
              {phoneInquiries.length === 0 ? (
                <div className={styles.emptyState}>No phone callback requests recorded.</div>
              ) : (
                <div className={styles.list}>
                  {phoneInquiries.map((lead) => (
                    <div key={lead.id} className={styles.leadCard}>
                      <div className={styles.cardHeaderRow}>
                        <span className={styles.statusBadgePending}>
                          EXPLORING
                        </span>
                        <span className={styles.timestamp}>
                          {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={styles.cardMain}>
                        <h3 className={styles.leadName}>{lead.formData.name}</h3>
                        <p className={styles.leadContact}>
                          Email: {lead.formData.email} | Phone: {lead.formData.phone}
                        </p>
                        {lead.formData.businessName && (
                          <p className={styles.leadBiz}>Company: {lead.formData.businessName}</p>
                        )}
                      </div>

                      <div className={styles.leadDetails}>
                        <p><strong>Exploring:</strong> {lead.formData.exploring?.join(", ") || "None"}</p>
                        <p><strong>Callback Window:</strong> {lead.formData.bestTime} window</p>
                        {lead.formData.budget && <p><strong>Budget in mind:</strong> {lead.formData.budget}</p>}
                        {lead.formData.questions && <p className={styles.noteField}><strong>Questions:</strong> "{lead.formData.questions}"</p>}
                        
                        <div className={styles.actionRow}>
                          <button onClick={() => generatePaymentLink(lead)} className={styles.paymentLinkBtn}>
                            {copiedLinkMap[lead.id] ? "Copied Link" : "Copy Paid Checkout Shortcut"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
