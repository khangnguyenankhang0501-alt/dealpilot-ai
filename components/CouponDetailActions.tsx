"use client";

import { useEffect, useRef, useState } from "react";

interface CouponDetailActionsProps {
  couponCode?: string | null;
  affiliateUrl?: string | null;
  storeName?: string | null;
}

export default function CouponDetailActions({
  couponCode,
  affiliateUrl,
  storeName,
}: CouponDetailActionsProps) {
  const [processing, setProcessing] = useState(false);
  const [revealedCode, setRevealedCode] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  const hasCode = Boolean(couponCode);
  const hasAffiliateUrl = Boolean(affiliateUrl);
  const label = storeName || "store";

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  /* =======================================================
     CLEAR TIMER
  ======================================================= */

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  /* =======================================================
     DIRECT DEAL
  ======================================================= */

  const handleDirectDeal = () => {
    if (processing || !hasAffiliateUrl || hasCode) {
      return;
    }

    window.open(affiliateUrl!, "_blank", "noopener,noreferrer");
  };

  /* =======================================================
     COPY + REVEAL + OPEN
  ======================================================= */

  const handleCopyAndOpen = async () => {
    if (processing || !hasCode || !hasAffiliateUrl) {
      return;
    }

    clearTimer();

    /* COPY */

    try {
      await navigator.clipboard.writeText(couponCode!);
    } catch {
      // Continue even if clipboard access fails.
    }

    /* REVEAL */

    setRevealedCode(couponCode!);
    setProcessing(true);

    /* 3 SECOND DELAY */

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;

      window.open(affiliateUrl!, "_blank", "noopener,noreferrer");

      setProcessing(false);
    }, 3000);
  };

  return (
    <div className="mt-6">
      {hasCode ? (
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-emerald-100
            bg-emerald-50
          "
        >
          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-b
              border-emerald-100
              px-4
              py-3
            "
          >
            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-emerald-700
              "
            >
              Coupon code
            </span>

            <span
              className="
                text-[10px]
                font-bold
                text-emerald-600
              "
            >
              ✓ Verified
            </span>
          </div>

          {/* BODY */}

          <div className="px-4 pb-4 pt-3">
            {/* CODE */}

            <div
              className={`
                flex
                min-h-[48px]
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                px-4
                py-2.5
                text-center
                transition-all
                duration-300
                ${
                  revealedCode
                    ? "border-emerald-300 bg-white"
                    : "border-emerald-200 bg-white/80"
                }
              `}
            >
              {revealedCode ? (
                <span
                  className="
                    select-all
                    break-all
                    text-base
                    font-black
                    tracking-[0.08em]
                    text-emerald-700
                    sm:text-lg
                  "
                >
                  {revealedCode}
                </span>
              ) : (
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-slate-300
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                </div>
              )}
            </div>

            {/* COPIED */}

            {revealedCode && (
              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  text-[10px]
                  font-semibold
                  text-emerald-600
                "
              >
                <span>✓</span>
                <span>Code copied</span>
              </div>
            )}

            {/* CTA */}

            <button
              type="button"
              onClick={handleCopyAndOpen}
              disabled={processing}
              className="
                mt-3
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-500
                px-4
                text-xs
                font-black
                uppercase
                tracking-wide
                text-white
                shadow-[0_8px_20px_rgba(16,185,129,0.18)]
                transition-all
                duration-200
                hover:bg-emerald-600
                hover:shadow-[0_10px_24px_rgba(16,185,129,0.22)]
                active:scale-[0.99]
                disabled:cursor-wait
                disabled:opacity-60
              "
            >
              {processing
                ? `Opening ${label}...`
                : revealedCode
                  ? `Open ${label}`
                  : `Copy code & open ${label}`}
            </button>

            {/* NOTE */}

            <p
              className="
                mt-2
                text-center
                text-[10px]
                font-medium
                leading-4
                text-slate-400
              "
            >
              {revealedCode
                ? `Your code is copied. ${label} will open automatically.`
                : "Your coupon code will be copied automatically before the store opens."}
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDirectDeal}
          disabled={!hasAffiliateUrl}
          className="
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-500
            px-4
            text-xs
            font-black
            uppercase
            tracking-wide
            text-white
            shadow-[0_8px_20px_rgba(16,185,129,0.18)]
            transition-all
            duration-200
            hover:bg-emerald-600
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <span>Get deal on {label}</span>

          <span className="text-sm">→</span>
        </button>
      )}

      {!hasCode && !hasAffiliateUrl && (
        <div
          className="
            mt-3
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-4
            py-3
            text-center
            text-xs
            font-semibold
            text-slate-400
          "
        >
          Deal link is currently unavailable.
        </div>
      )}
    </div>
  );
}
