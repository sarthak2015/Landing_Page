import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "#ffffff",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M13 2 L4 14 H10.5 L9.5 22 L20 9 H13.2 L13 2 Z" fill="#000000" />
            </svg>
          </div>
          <div style={{ color: "#ffffff", fontSize: 40, fontWeight: 800 }}>Go-Speed</div>
        </div>
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 950
          }}
        >
          Premium, High-Converting Websites for $99
        </div>
        <div style={{ display: "flex", color: "#a1a1aa", fontSize: 30, marginTop: 28 }}>
          Delivered within 48 hours of your kickoff call
        </div>
      </div>
    ),
    { ...size }
  );
}
