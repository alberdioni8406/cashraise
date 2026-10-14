import { ImageResponse } from "next/og";

export const alt = "CashRaise — Ideas. Funded peer-to-peer.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default platform banner for link previews (Facebook, X, Telegram, Reddit, etc.)
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080809",
          padding: "56px 64px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,230,118,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#00e676",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 12, zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.12em",
              color: "#00e676",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            BCH · NON-CUSTODIAL
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            CASH
            <span style={{ color: "#00e676" }}>RAISE</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "#a1a1aa",
              fontWeight: 500,
              marginTop: 8,
              maxWidth: 900,
            }}
          >
            Ideas. Funded peer-to-peer.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", fontSize: 24, color: "#d4d4d8" }}>
            No middleman. No platform custody.
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#00e676" }}>
            BCH goes directly to the fundraiser.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 20,
              color: "#71717a",
              letterSpacing: "0.04em",
            }}
          >
            cashraise.online
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
