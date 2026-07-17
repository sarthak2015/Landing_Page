import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg width="104" height="104" viewBox="0 0 24 24" fill="none">
          <path d="M13 2 L4 14 H10.5 L9.5 22 L20 9 H13.2 L13 2 Z" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
