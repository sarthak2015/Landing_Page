import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M13 2 L4 14 H10.5 L9.5 22 L20 9 H13.2 L13 2 Z" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
