import React, { Suspense } from "react";
import LandingPageContent from "../components/LandingPageContent";

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#060913",
        color: "#94a3b8",
        fontFamily: "system-ui, sans-serif"
      }}>
        Loading landing page...
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  );
}
