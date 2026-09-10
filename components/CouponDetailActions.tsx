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
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const timerRef = useRef<number | null>(null);

  const hasCode = Boolean(couponCode);
  const hasAffiliateUrl = Boolean(affiliateUrl);
  const label = storeName || "store";

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Continue with fallback.
    }

    try {
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.setAttribute("readonly", "");

      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "1px";
      textarea.style.height = "1px";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const success = document.execCommand("copy");

      document.body.removeChild(textarea);

      return success;
    } catch {
      return false;
    }
  };

  /*
   * STEP 1
   * Reveal coupon code.
   */
  const handleRevealCode = () => {
    if (processing || !couponCode) {
      return;
    }

    clearTimer();

    setCopyError(false);
    setCopied(false);
    setRevealedCode(couponCode);
  };

  /*
   * STEP 2
   * Click coupon code:
   * copy -> show popup -> redirect.
   */
  const handleCopyCodeAndNavigate = async () => {
    if (processing || !revealedCode) {
      return;
    }

    clearTimer();

    setProcessing(true);
    setCopyError(false);

    const success = await copyToClipboard(revealedCode);

    if (!success) {
      setProcessing(false);
      setCopied(false);
      setCopyError(true);
      return;
    }

    setCopied(true);

    if (hasAffiliateUrl) {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;

        window.location.assign(affiliateUrl!);
      }, 1800);
    } else {
      setProcessing(false);
    }
  };

  /*
   * Manual fallback button.
   * Used when automatic redirect does not happen.
   */
  const handleContinueToStore = () => {
    if (!hasAffiliateUrl) {
      return;
    }

    clearTimer();

    window.location.assign(affiliateUrl!);
  };

  /*
   * No coupon code:
   * direct store navigation.
   */
  const handleDirectDeal = () => {
    if (processing || !hasAffiliateUrl) {
      return;
    }

    window.location.assign(affiliateUrl!);
  };

  const revealButtonClass =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-black uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(16,185,129,0.18)] transition-all duration-200 hover:bg-emerald-600 hover:shadow-[0_10px_24px_rgba(16,185,129,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

  const codeButtonClass = [
    "group flex min-h-[72px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white px-4 py-3 text-center transition-all duration-200",
    copied
      ? "border-emerald-300 bg-emerald-50"
      : "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
    processing
      ? "cursor-wait opacity-70"
      : "cursor-pointer active:scale-[0.99]",
  ].join(" ");

  const codeTextClass = [
    "select-all break-all text-base font-black tracking-[0.1em] sm:text-lg",
    copied ? "text-emerald-700" : "text-slate-800 group-hover:text-emerald-700",
  ].join(" ");

  const directDealButtonClass =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-black uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(16,185,129,0.18)] transition-all duration-200 hover:bg-emerald-600 hover:shadow-[0_10px_24px_rgba(16,185,129,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <div className="mt-6">
        {hasCode ? (
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-emerald-100 px-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                Coupon code
              </span>

              <span className="text-[10px] font-bold text-emerald-600">
                ✓ Verified
              </span>
            </div>

            <div className="px-4 pb-4 pt-3">
              {!revealedCode ? (
                <>
                  {/* STEP 1 */}
                  <button
                    type="button"
                    onClick={handleRevealCode}
                    disabled={processing}
                    className={revealButtonClass}
                  >
                    <span>Copy code &amp; open {label}</span>
                    <span className="text-sm">→</span>
                  </button>

                  <p className="mt-2 text-center text-[10px] font-medium leading-4 text-slate-400">
                    Click to reveal your coupon code.
                  </p>
                </>
              ) : (
                <>
                  {/* STEP 2 - CLICK THE CODE */}
                  <button
                    type="button"
                    onClick={handleCopyCodeAndNavigate}
                    disabled={processing}
                    className={codeButtonClass}
                  >
                    <span className={codeTextClass}>{revealedCode}</span>

                    {!copied && !processing ? (
                      <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                        Click code to copy
                      </span>
                    ) : null}

                    {processing && !copied ? (
                      <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                        Copying code...
                      </span>
                    ) : null}
                  </button>

                  {!copied && !copyError ? (
                    <p className="mt-2 text-center text-[10px] font-medium leading-4 text-slate-400">
                      Tap the code to copy it and continue to {label}.
                    </p>
                  ) : null}

                  {/* Copy error */}
                  {copyError ? (
                    <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-center">
                      <p className="text-xs font-bold text-rose-600">
                        Unable to copy the code.
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-rose-400">
                        Tap the code again to retry.
                      </p>
                    </div>
                  ) : null}

                  {/* Missing affiliate URL */}
                  {!hasAffiliateUrl && !copied && !copyError ? (
                    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-center">
                      <p className="text-xs font-bold text-amber-700">
                        Deal link is currently unavailable.
                      </p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* NO COUPON CODE */}
            <button
              type="button"
              onClick={handleDirectDeal}
              disabled={!hasAffiliateUrl || processing}
              className={directDealButtonClass}
            >
              <span>Get deal on {label}</span>
              <span className="text-sm">→</span>
            </button>

            {!hasAffiliateUrl ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-400">
                Deal link is currently unavailable.
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* ====================================================== */}
      {/* CODE COPIED POPUP                                     */}
      {/* ====================================================== */}

      {copied ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.3)]">
            {/* Top success area */}
            <div className="px-6 pb-5 pt-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-2xl font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]">
                  ✓
                </div>
              </div>

              <h3 className="mt-5 text-[22px] font-black tracking-tight text-slate-900">
                Code copied
              </h3>

              <p className="mx-auto mt-2 max-w-[290px] text-sm leading-6 text-slate-500">
                Your coupon code has been copied to your clipboard.
              </p>
            </div>

            {/* Code */}
            <div className="px-6">
              <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600">
                  Your coupon code
                </p>

                <div className="break-all text-lg font-black tracking-[0.12em] text-emerald-700">
                  {revealedCode}
                </div>
              </div>
            </div>

            {/* Store status */}
            <div className="px-6 pb-6 pt-5">
              {hasAffiliateUrl ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                    <span>Opening {label}...</span>
                  </div>

                  <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
                    You will be redirected automatically.
                  </p>

                  {/* Manual fallback */}
                  <button
                    type="button"
                    onClick={handleContinueToStore}
                    className="
                      mt-5 flex h-12 w-full items-center justify-center gap-2
                      rounded-xl bg-emerald-500 px-4
                      text-xs font-black uppercase tracking-wide text-white
                      shadow-[0_8px_20px_rgba(16,185,129,0.18)]
                      transition-all duration-200
                      hover:bg-emerald-600
                      hover:shadow-[0_10px_24px_rgba(16,185,129,0.22)]
                      active:scale-[0.99]
                    "
                  >
                    <span>Continue to {label}</span>
                    <span className="text-sm">→</span>
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-xs font-bold text-amber-700">
                    Deal link is currently unavailable.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom note */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
              <p className="text-center text-[9px] font-medium leading-4 text-slate-400">
                Your coupon code is ready to use at the store.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
