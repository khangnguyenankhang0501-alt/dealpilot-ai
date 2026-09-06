"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CouponRevealModalProps {
  open: boolean;
  code: string;
  title: string;
  affiliateUrl: string;
  imageUrl?: string;
  discount?: string;
  salePrice?: string;
  originalPrice?: string;
  storeName?: string;
  onClose: () => void;
}

export default function CouponRevealModal({
  open,
  code,
  title,
  affiliateUrl,
  imageUrl,
  discount,
  salePrice,
  originalPrice,
  storeName,
  onClose,
}: CouponRevealModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  /* =========================================================
     MOUNT PORTAL
  ========================================================= */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* =========================================================
     RESET WHEN MODAL CLOSES
  ========================================================= */

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setCountdown(5);
    }
  }, [open]);

  /* =========================================================
     LOCK BODY SCROLL + ESC
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  /* =========================================================
     COUNTDOWN
  ========================================================= */

  useEffect(() => {
    if (!open || !copied) return;

    if (countdown <= 0) {
      if (affiliateUrl) {
        window.location.href = affiliateUrl;
      }

      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, copied, countdown, affiliateUrl]);

  /* =========================================================
     COPY CODE
  ========================================================= */

  const copyCode = async () => {
    if (!code) {
      if (affiliateUrl) {
        window.location.href = affiliateUrl;
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(code);

      // IMPORTANT:
      // Do not open another tab here.
      // This prevents the browser from flashing/focusing a new tab.
      setCountdown(5);
      setCopied(true);
    } catch {
      // Keep the modal open if clipboard access fails.
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  if (!open || !mounted) {
    return null;
  }

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        bg-slate-950/55
        p-3
        backdrop-blur-[2px]
        sm:p-5
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          flex
          max-h-[94vh]
          w-full
          max-w-[900px]
          flex-col
          overflow-y-auto
          rounded-2xl
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.28)]
          sm:rounded-3xl
        "
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* =====================================================
            CLOSE BUTTON
        ===================================================== */}

        {!copied && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              absolute
              right-4
              top-4
              z-30
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-lg
              leading-none
              text-slate-500
              shadow-sm
              transition
              hover:bg-slate-50
              hover:text-slate-900
            "
          >
            ×
          </button>
        )}

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="px-5 pt-5 sm:px-7 sm:pt-6">
          <div
            className="
              pr-10
              text-[10px]
              font-medium
              text-slate-400
              sm:text-xs
            "
          >
            Home
            <span className="mx-1.5">›</span>
            {storeName || "Store"}
          </div>
        </div>

        {/* =====================================================
            PRODUCT AREA
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            px-5
            pb-7
            pt-5
            sm:grid-cols-[1fr_1fr]
            sm:px-7
          "
        >
          {/* ===================================================
              PRODUCT IMAGE
          =================================================== */}

          <div
            className="
              relative
              flex
              min-h-[260px]
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              bg-white
              sm:min-h-[330px]
            "
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="
                  max-h-[300px]
                  max-w-full
                  object-contain
                  p-5
                  sm:max-h-[340px]
                "
              />
            ) : (
              <div className="text-7xl">🏷️</div>
            )}
          </div>

          {/* ===================================================
              PRODUCT INFO
          =================================================== */}

          <div className="flex flex-col justify-center">
            {/* PROMO BADGE */}

            {code && (
              <div className="mb-3">
                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-emerald-50
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    text-emerald-600
                    sm:text-xs
                  "
                >
                  Promo Code
                </span>
              </div>
            )}

            {/* TITLE */}

            <h2
              className="
                pr-8
                text-lg
                font-extrabold
                leading-[1.3]
                text-slate-900
                sm:text-2xl
              "
            >
              {title}
            </h2>

            {/* PRICE */}

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {discount && (
                <span
                  className="
                    rounded-full
                    bg-[#f52f56]
                    px-2.5
                    py-1
                    text-xs
                    font-extrabold
                    text-white
                  "
                >
                  -{discount}
                </span>
              )}

              {salePrice && (
                <span
                  className="
                    text-xl
                    font-black
                    text-slate-900
                    sm:text-2xl
                  "
                >
                  {salePrice}
                </span>
              )}

              {originalPrice && (
                <span
                  className="
                    text-xs
                    text-slate-400
                    line-through
                    sm:text-sm
                  "
                >
                  {originalPrice}
                </span>
              )}
            </div>

            {/* STORE */}

            <div
              className="
                mt-3
                text-xs
                font-medium
                text-slate-500
              "
            >
              {storeName}
            </div>

            {/* =================================================
                AVAILABLE CODE
            ================================================= */}

            <div className="mt-6">
              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  Available Code
                </span>

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-emerald-600
                  "
                >
                  VERIFIED
                </span>
              </div>

              {/* CODE BOX */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  p-4
                "
              >
                <div
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-emerald-600
                  "
                >
                  Coupon Code
                </div>

                <div
                  className="
                    mt-1
                    break-all
                    text-xl
                    font-black
                    tracking-[0.16em]
                    text-slate-900
                    sm:text-2xl
                  "
                >
                  {code || "No code required"}
                </div>

                <div
                  className="
                    mt-3
                    border-t
                    border-dashed
                    border-emerald-200
                    pt-2
                    text-[10px]
                    font-medium
                    text-emerald-600
                  "
                >
                  ✓ Verified deal
                </div>
              </div>
            </div>

            {/* =================================================
                COPY BUTTON
            ================================================= */}

            {!copied ? (
              <button
                type="button"
                onClick={copyCode}
                className="
                  mt-3
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#ff7a00]
                  px-4
                  text-sm
                  font-extrabold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#ed6e00]
                  hover:shadow-md
                  active:scale-[0.99]
                "
              >
                {code ? `Copy Code & Open ${storeName || "Deal"}` : "Open Deal"}
              </button>
            ) : (
              /* ===============================================
                 SUCCESS STATE
              =============================================== */

              <div
                className="
                  mt-3
                  rounded-xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  p-4
                  text-center
                "
              >
                {/* SUCCESS MESSAGE */}

                <div
                  className="
                    text-sm
                    font-extrabold
                    text-emerald-700
                  "
                >
                  ✓ Code copied successfully
                </div>

                {/* COUNTDOWN */}

                <div
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  Opening {storeName || "store"} in{" "}
                  <span className="font-bold text-slate-900">{countdown}s</span>
                  ...
                </div>

                {/* PROGRESS BAR */}

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-emerald-500
                      transition-all
                      duration-1000
                      ease-linear
                    "
                    style={{
                      width: `${((5 - countdown) / 5) * 100}%`,
                    }}
                  />
                </div>

                {/* STAY BUTTON */}

                <button
                  type="button"
                  onClick={onClose}
                  className="
                    mt-3
                    text-xs
                    font-semibold
                    text-slate-400
                    transition
                    hover:text-slate-700
                  "
                >
                  Stay on DealPilot
                </button>
              </div>
            )}

            {/* CLOSE */}

            {!copied && (
              <button
                type="button"
                onClick={onClose}
                className="
                  mt-2
                  h-10
                  w-full
                  rounded-xl
                  text-xs
                  font-semibold
                  text-slate-400
                  transition
                  hover:bg-slate-50
                  hover:text-slate-700
                "
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="mx-5 border-t border-slate-100 sm:mx-7" />

        {/* =====================================================
            SIMILAR DEALS
        ===================================================== */}

        <div className="px-5 pb-7 pt-6 sm:px-7">
          <div className="flex items-center justify-between">
            <h3
              className="
                text-base
                font-extrabold
                text-slate-900
                sm:text-lg
              "
            >
              Similar Deals
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-full
                bg-slate-900
                px-3
                py-1.5
                text-[10px]
                font-bold
                text-white
                transition
                hover:bg-slate-700
              "
            >
              View All →
            </button>
          </div>

          <p
            className="
              mt-1
              text-[11px]
              text-slate-400
            "
          >
            More deals from {storeName || "this store"}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              "More great deals",
              "Related offer",
              "Popular coupon",
              "Today's deal",
            ].map((item) => (
              <div
                key={item}
                className="
                  flex
                  min-h-[82px]
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-3
                  text-center
                  text-[10px]
                  font-semibold
                  text-slate-400
                "
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
