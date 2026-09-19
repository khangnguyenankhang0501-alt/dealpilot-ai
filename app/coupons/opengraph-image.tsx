import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "DealPilot Coupons & Promo Codes";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #ecfdf5 0%, #ffffff 48%, #f0fdfa 100%)",
        color: "#0f172a",
        padding: "64px",
        position: "relative",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 380,
          height: 380,
          borderRadius: 999,
          background: "#d1fae5",
          opacity: 0.8,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -100,
          width: 420,
          height: 420,
          borderRadius: 999,
          background: "#cffafe",
          opacity: 0.55,
        }}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 54,
              height: 54,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              background: "#10b981",
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            D
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            DealPilot
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 800,
              color: "#059669",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            Coupons
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 66,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: "-0.045em",
            }}
          >
            Coupons & Promo Codes
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              lineHeight: 1.35,
              color: "#64748b",
              maxWidth: 820,
            }}
          >
            Browse active discounts, coupon codes and deals from top stores.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            Active deals updated regularly
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#059669",
              fontWeight: 800,
            }}
          >
            dealpilot.com
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
