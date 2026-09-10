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
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Use fallback below.
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

  // Bước 1:
  // Chỉ hiện code, chưa copy và chưa chuyển sang Amazon.
  const handleRevealCode = () => {
    if (processing || !couponCode) {
      return;
    }

    clearTimer();

    setCopyError(false);
    setCopied(false);
    setRevealedCode(couponCode);
  };

  // Bước 2:
  // Click vào code -> copy -> hiện "Code copied" -> chuyển sang trang mua.
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

    // Hiện thông báo "Code copied" trước.
    setCopied(true);

    // Chờ để người dùng nhìn thấy trạng thái copied,
    // sau đó chuyển sang trang mua hàng.
    if (affiliateUrl) {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;

        // Dùng cùng tab để tránh popup blocker trên mobile.
        window.location.assign(affiliateUrl);
      }, 1100);
    } else {
      setProcessing(false);
    }
  };

  const handleDirectDeal = () => {
    if (processing || !hasAffiliateUrl) {
      return;
    }

    // Chuyển cùng tab, không dùng window.open.
    window.location.assign(affiliateUrl!);
  };

  return (
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
                {/* Bước 1: Reveal code */}
                <button
                  type="button"
                  onClick={handleRevealCode}
                  disabled={processing}
                  className="
                    flex h-12 w-full items-center justify-center gap-2 rounded-xl
                    bg-emerald-500 px-4 text-xs font-black uppercase tracking-wide text-white
                    shadow-[0_8px_20px_rgba(16,185,129,0.18)]
                    transition-all duration-200
                    hover:bg-emerald-600
                    hover:shadow-[0_10px_24px_rgba(16,185,129,0.22)]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
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
                {/* Code area */}
                <button
                  type="button"
                  onClick={handleCopyCodeAndNavigate}
                  disabled={processing}
                  className={`
                    group flex min-h-[64px] w-full flex-col items-center justify-center
                    rounded-xl border-2 border-dashed bg-white px-4 py-3
                    text-center transition-all duration-200
                    ${
                      copied
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
                    }
                    ${
                      processing
                        ? "cursor-wait opacity-70"
                        : "cursor-pointer active:scale-[0.99]"
                    }
                  `}
                >
                  <span
                    className={`
                      select-all break-all text-base font-black tracking-[0.1em]
                      sm:text-lg
                      ${
                        copied
                          ? "text-emerald-700"
                          : "text-slate-800 group-hover:text-emerald-700"
                      }
                    `}
                  >
                    {revealedCode}
                  </span>

                  {!copied && !processing && (
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                      Click code to copy
                    </span>
                  )}

                  {processing && !copied && (
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                      Copying code...
                    </span>
                  )}
                </button>

                {/* Code copied confirmation */}
                {copied && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-black text-emerald-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                        ✓
                      </span>

                      <span>Code copied</span>
                    </div>

                    {hasAffiliateUrl && (
                      <p className="mt-1 text-[10px] font-medium text-slate-400">
                        Opening {label}...
                      </p>
                    )}
                  </div>
                )}

                {/* Copy error */}
                {copyError && (
                  <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-center">
                    <p className="text-xs font-bold text-rose-600">
                      Unable to copy the code.
                    </p>

                    <p className="mt-1 text-[10px] font-medium text-rose-400">
                      Tap the code again to retry.
                    </p>
                  </div>
                )}

                {!copied && !copyError && (
                  <p className="mt-2 text-center text-[10px] font-medium leading-4 text-slate-400">
                    Tap the code to copy it and continue to {label}.
                  </p>
                )}

                {!hasAffiliateUrl && !copied && (
                  <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-center">
                    <p className="text-xs font-bold text-amber-700">
                      Deal link is currently unavailable.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* No coupon code */}
          <button
            type="button"
            onClick={handleDirectDeal}
            disabled={!hasAffiliateUrl || processing}
            className="
              flex h-12 w-full items-center justify-center gap-2 rounded-xl
              bg-emerald-500 px-4 text-xs font-black uppercase tracking-wide text-white
              shadow-[0_8px_20px_rgba(16,185,129,0.18)]
              transition-all duration-200
              hover:bg-emerald-600
              hover:shadow-[0_10px_24px_rgba(16,185,129,0.22)]
              active:scale-[0.99]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            <span>Get deal on {label}</span>
            <span className="text-sm">→</span>
          </button>

          {!hasAffiliateUrl && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-400">
              Deal link is currently unavailable.
            </div>
          )}
        </>
      )}
    </div>
  );
}
