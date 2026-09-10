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
  const fallbackTimerRef = useRef<number | null>(null);

  /*
   * Desktop external tab.
   *
   * We create the new tab immediately when the user clicks
   * the coupon code. This helps avoid popup blockers.
   */
  const externalWindowRef = useRef<Window | null>(null);

  /*
   * Used to know that the store has already been opened.
   *
   * When the user returns to DealPilot, the popup will
   * automatically close.
   */
  const storeNavigationStartedRef = useRef(false);

  const hasCode = Boolean(couponCode);
  const hasAffiliateUrl = Boolean(affiliateUrl);
  const label = storeName || "store";

  const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
  };

  const isIOS = () => {
    return (
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  const isMobileDevice = () => {
    return isAndroid() || isIOS();
  };

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * AUTO CLOSE POPUP WHEN RETURNING TO DEALPILOT
   * ---------------------------------------------------------
   *
   * Desktop:
   * User goes to Amazon tab
   * -> buys/browses
   * -> returns to DealPilot
   * -> popup closes automatically
   *
   * Mobile:
   * User goes to Amazon Shopping app
   * -> returns to browser
   * -> popup closes automatically
   */
  useEffect(() => {
    const handleReturnToDealPilot = () => {
      if (
        document.visibilityState === "visible" &&
        storeNavigationStartedRef.current
      ) {
        setCopied(false);
        setProcessing(false);
        setCopyError(false);

        /*
         * Reset the flag after closing the popup.
         * The next coupon click will set it again.
         */
        storeNavigationStartedRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleReturnToDealPilot);

    /*
     * Focus is also handled because some desktop browsers
     * do not always emit visibilitychange consistently
     * when switching between tabs/windows.
     */
    window.addEventListener("focus", handleReturnToDealPilot);

    return () => {
      document.removeEventListener("visibilitychange", handleReturnToDealPilot);

      window.removeEventListener("focus", handleReturnToDealPilot);
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  /*
   * ---------------------------------------------------------
   * COPY TO CLIPBOARD
   * ---------------------------------------------------------
   */
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
   * ---------------------------------------------------------
   * AMAZON URL DETECTION
   * ---------------------------------------------------------
   */
  const isAmazonUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      if (hostname === "amazon.com" || hostname.endsWith(".amazon.com")) {
        return true;
      }

      const amazonCountryDomains = [
        "amazon.ca",
        "amazon.co.uk",
        "amazon.de",
        "amazon.fr",
        "amazon.it",
        "amazon.es",
        "amazon.nl",
        "amazon.se",
        "amazon.pl",
        "amazon.co.jp",
        "amazon.com.au",
        "amazon.in",
        "amazon.sg",
        "amazon.ae",
        "amazon.sa",
        "amazon.com.mx",
        "amazon.com.br",
      ];

      return amazonCountryDomains.some((domain) => {
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
    } catch {
      return false;
    }
  };

  /*
   * ---------------------------------------------------------
   * ANDROID AMAZON INTENT
   * ---------------------------------------------------------
   */
  const buildAmazonAndroidIntent = (url: string) => {
    const parsed = new URL(url);

    const amazonTarget = `${parsed.hostname}${parsed.pathname}${parsed.search}${parsed.hash}`;

    const encodedFallback = encodeURIComponent(url);

    return (
      `intent://${amazonTarget}` +
      `#Intent;` +
      `scheme=https;` +
      `package=com.amazon.mShop.android.shopping;` +
      `S.browser_fallback_url=${encodedFallback};` +
      `end`
    );
  };

  /*
   * ---------------------------------------------------------
   * IOS AMAZON DEEP LINK
   * ---------------------------------------------------------
   */
  const buildAmazonIOSDeepLink = (url: string) => {
    const parsed = new URL(url);

    return (
      `com.amazon.mobile.shopping://` +
      `${parsed.hostname}` +
      `${parsed.pathname}` +
      `${parsed.search}` +
      `${parsed.hash}`
    );
  };

  /*
   * ---------------------------------------------------------
   * PREPARE DESKTOP TAB
   * ---------------------------------------------------------
   */
  const prepareDesktopTab = () => {
    if (isMobileDevice() || !hasAffiliateUrl) {
      return;
    }

    try {
      /*
       * IMPORTANT:
       * Create the tab immediately during the user click.
       */
      const newTab = window.open("", "_blank");

      if (!newTab) {
        externalWindowRef.current = null;
        return;
      }

      externalWindowRef.current = newTab;

      try {
        newTab.opener = null;
      } catch {
        // Ignore browser restrictions.
      }

      /*
       * Temporary loading page.
       */
      try {
        newTab.document.title = `Opening ${label}...`;

        newTab.document.body.innerHTML = `
          <div style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f8fafc;
            font-family:Arial,Helvetica,sans-serif;
            color:#0f172a;
          ">
            <div style="
              text-align:center;
              padding:32px;
            ">
              <div style="
                width:48px;
                height:48px;
                margin:0 auto 18px;
                border-radius:9999px;
                background:#d1fae5;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#059669;
                font-size:24px;
                font-weight:700;
              ">
                ✓
              </div>

              <div style="
                font-size:20px;
                font-weight:700;
                margin-bottom:8px;
              ">
                Opening ${label}...
              </div>

              <div style="
                font-size:14px;
                color:#64748b;
              ">
                Please wait while we open the store.
              </div>
            </div>
          </div>
        `;
      } catch {
        // Ignore document write failures.
      }
    } catch {
      externalWindowRef.current = null;
    }
  };

  /*
   * ---------------------------------------------------------
   * NAVIGATE TO STORE
   * ---------------------------------------------------------
   *
   * MOBILE:
   * Amazon Shopping app first.
   *
   * DESKTOP:
   * Already-created new tab.
   */
  const navigateToStore = () => {
    if (!hasAffiliateUrl) {
      return;
    }

    const originalUrl = affiliateUrl!;

    /*
     * IMPORTANT:
     * Tell the popup that store navigation has started.
     *
     * When the user eventually returns to DealPilot,
     * the visibility handler closes the popup.
     */
    storeNavigationStartedRef.current = true;

    clearTimer();

    /*
     * Non-Amazon affiliate URL.
     */
    if (!isAmazonUrl(originalUrl)) {
      if (!isMobileDevice()) {
        const existingTab = externalWindowRef.current;

        if (existingTab && !existingTab.closed) {
          try {
            existingTab.location.href = originalUrl;

            return;
          } catch {
            // Continue to fallback.
          }
        }

        const newTab = window.open(
          originalUrl,
          "_blank",
          "noopener,noreferrer",
        );

        if (!newTab) {
          return;
        }

        return;
      }

      window.location.assign(originalUrl);

      return;
    }

    /*
     * ======================================================
     * ANDROID
     * ======================================================
     */
    if (isAndroid()) {
      try {
        const intentUrl = buildAmazonAndroidIntent(originalUrl);

        window.location.assign(intentUrl);

        return;
      } catch {
        window.location.assign(originalUrl);

        return;
      }
    }

    /*
     * ======================================================
     * IOS / IPADOS
     * ======================================================
     */
    if (isIOS()) {
      try {
        const amazonAppUrl = buildAmazonIOSDeepLink(originalUrl);

        let pageLeft = false;

        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            pageLeft = true;
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        window.location.assign(amazonAppUrl);

        /*
         * Fallback to original affiliate URL
         * if Amazon app does not open.
         */
        fallbackTimerRef.current = window.setTimeout(() => {
          fallbackTimerRef.current = null;

          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );

          if (!pageLeft && document.visibilityState === "visible") {
            window.location.assign(originalUrl);
          }
        }, 1800);

        return;
      } catch {
        window.location.assign(originalUrl);

        return;
      }
    }

    /*
     * ======================================================
     * DESKTOP
     * ======================================================
     */
    const existingTab = externalWindowRef.current;

    if (existingTab && !existingTab.closed) {
      try {
        existingTab.location.href = originalUrl;

        return;
      } catch {
        // Continue to fallback.
      }
    }

    /*
     * If the first tab was blocked/closed,
     * try creating another tab.
     */
    const newTab = window.open(originalUrl, "_blank", "noopener,noreferrer");

    if (!newTab) {
      return;
    }
  };

  /*
   * ---------------------------------------------------------
   * STEP 1
   * ---------------------------------------------------------
   *
   * Reveal coupon code only.
   */
  const handleRevealCode = () => {
    if (processing || !couponCode) {
      return;
    }

    clearTimer();

    storeNavigationStartedRef.current = false;

    setCopyError(false);
    setCopied(false);
    setRevealedCode(couponCode);
  };

  /*
   * ---------------------------------------------------------
   * STEP 2
   * ---------------------------------------------------------
   *
   * Click coupon code:
   *
   * Desktop:
   * new tab -> copy -> popup -> affiliate
   *
   * Mobile:
   * copy -> popup -> Amazon app
   */
  const handleCopyCodeAndNavigate = async () => {
    if (processing || !revealedCode) {
      return;
    }

    clearTimer();

    /*
     * Create desktop tab BEFORE async
     * clipboard operation.
     */
    if (!isMobileDevice() && hasAffiliateUrl) {
      prepareDesktopTab();
    }

    setProcessing(true);
    setCopyError(false);

    const success = await copyToClipboard(revealedCode);

    if (!success) {
      setProcessing(false);
      setCopied(false);
      setCopyError(true);

      /*
       * Close empty desktop tab when
       * clipboard copying failed.
       */
      if (
        !isMobileDevice() &&
        externalWindowRef.current &&
        !externalWindowRef.current.closed
      ) {
        try {
          externalWindowRef.current.close();
        } catch {
          // Ignore close errors.
        }

        externalWindowRef.current = null;
      }

      return;
    }

    /*
     * Show popup.
     */
    setCopied(true);

    /*
     * Wait before opening affiliate link.
     */
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;

      navigateToStore();
    }, 1500);
  };

  /*
   * ---------------------------------------------------------
   * CLOSE POPUP
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   * Do NOT clear the navigation timer here.
   *
   * If the user closes the popup before the 1.5 second
   * redirect finishes, the affiliate tab will still open.
   *
   * This button only closes the visual popup.
   */
  const handleClosePopup = () => {
    setCopied(false);
    setCopyError(false);
    setProcessing(false);

    /*
     * Do not set storeNavigationStartedRef to false here.
     *
     * The affiliate navigation may still happen shortly.
     */
  };

  /*
   * ---------------------------------------------------------
   * MANUAL CONTINUE TO STORE
   * ---------------------------------------------------------
   */
  const handleContinueToStore = () => {
    clearTimer();

    navigateToStore();
  };

  /*
   * ---------------------------------------------------------
   * NO COUPON CODE
   * ---------------------------------------------------------
   */
  const handleDirectDeal = () => {
    if (processing || !hasAffiliateUrl) {
      return;
    }

    /*
     * Desktop:
     * open new tab directly.
     */
    if (!isMobileDevice()) {
      const newTab = window.open(
        affiliateUrl!,
        "_blank",
        "noopener,noreferrer",
      );

      if (!newTab) {
        return;
      }

      return;
    }

    /*
     * Mobile:
     * Amazon app / affiliate logic.
     */
    navigateToStore();
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={handleClosePopup}
              aria-label="Close"
              className="
                absolute right-3 top-3 z-10
                flex h-8 w-8 items-center justify-center
                rounded-full
                text-lg font-medium text-slate-400
                transition-all duration-200
                hover:bg-slate-100
                hover:text-slate-700
                active:scale-95
              "
            >
              ×
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 px-5 pb-3 pt-5 pr-12">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-lg font-black text-emerald-600">✓</span>
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-black tracking-tight text-slate-900">
                  Code copied
                </h3>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Your coupon is ready to use.
                </p>
              </div>
            </div>

            {/* Code */}
            <div className="px-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center">
                <p className="mb-1 text-[8px] font-black uppercase tracking-[0.14em] text-emerald-600">
                  Coupon code
                </p>

                <div className="break-all text-base font-black tracking-[0.1em] text-emerald-700">
                  {revealedCode}
                </div>
              </div>
            </div>

            {/* Redirect state */}
            {hasAffiliateUrl ? (
              <div className="px-5 pb-5 pt-4">
                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

                  <span>
                    {isMobileDevice()
                      ? `Opening ${label} app...`
                      : `Opening ${label} in a new tab...`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleContinueToStore}
                  className="
                    mt-3 flex h-10 w-full items-center
                    justify-center gap-2 rounded-xl
                    bg-emerald-500 px-4
                    text-[11px] font-black uppercase tracking-wide
                    text-white
                    transition-all duration-200
                    hover:bg-emerald-600
                    active:scale-[0.99]
                  "
                >
                  <span>
                    {isMobileDevice()
                      ? `Continue to ${label}`
                      : `Open ${label} in new tab`}
                  </span>

                  <span>→</span>
                </button>

                <p className="mt-2 text-center text-[9px] font-medium text-slate-400">
                  Return to DealPilot anytime to keep browsing.
                </p>
              </div>
            ) : (
              <div className="px-5 pb-5 pt-4">
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-center">
                  <p className="text-[11px] font-bold text-amber-700">
                    Deal link is currently unavailable.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
