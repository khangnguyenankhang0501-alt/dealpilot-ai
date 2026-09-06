"use client";

import { useEffect, useRef, useState } from "react";
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
  storeLogo?: string;
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
  storeLogo,
  onClose,
}: CouponRevealModalProps) {
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const timerRef = useRef<number | null>(null);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* =======================================================
     GLOBAL TIMER CLEANUP
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
     RESET WHEN CLOSED
  ======================================================= */

  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setLogoFailed(false);

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [open]);

  /* =======================================================
     RESET LOGO ERROR
  ======================================================= */

  useEffect(() => {
    if (!storeLogo) {
      setLogoFailed(false);
    }
  }, [storeLogo]);

  /* =======================================================
     BODY LOCK + ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !processing) {
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
  }, [open, onClose, processing]);

  /* =======================================================
     COPY + OPEN
  ======================================================= */

  const handleCopyAndOpen = async () => {
    if (processing) return;

    /* NO CODE */

    if (!code) {
      if (affiliateUrl) {
        window.open(affiliateUrl, "_blank", "noopener,noreferrer");
      }

      onClose();
      return;
    }

    /* COPY */

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Continue even if clipboard is unavailable.
    }

    /* CLEAR OLD TIMER */

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);

      timerRef.current = null;
    }

    /* START PROCESSING */

    setProcessing(true);

    /* EXACTLY 3 SECONDS */

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;

      if (affiliateUrl) {
        window.open(affiliateUrl, "_blank", "noopener,noreferrer");
      }

      setProcessing(false);
      onClose();
    }, 3000);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  if (!open || !mounted) {
    return null;
  }

  const storeInitial = storeName?.trim().charAt(0).toUpperCase() || "S";

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-slate-950/60
        p-3
        backdrop-blur-md
        sm:p-5
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !processing) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          my-auto
          max-h-[94vh]
          w-full
          max-w-4xl
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_30px_100px_rgba(15,23,42,0.28)]
          sm:rounded-[30px]
        "
      >
        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="
            absolute
            right-3
            top-3
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white/90
            text-xl
            font-medium
            text-slate-500
            shadow-sm
            backdrop-blur
            transition-all
            duration-200
            hover:border-slate-300
            hover:bg-white
            hover:text-slate-900
            disabled:cursor-not-allowed
            disabled:opacity-40
            sm:right-5
            sm:top-5
          "
          aria-label="Close"
        >
          ×
        </button>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-[1fr_1fr]
          "
        >
          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div
            className="
              relative
              flex
              min-h-[230px]
              items-center
              justify-center
              overflow-hidden
              border-b
              border-slate-100
              bg-gradient-to-br
              from-slate-50
              via-white
              to-slate-100
              px-6
              py-8
              sm:min-h-[330px]
              sm:px-10
              sm:py-10
              md:min-h-[470px]
              md:border-b-0
              md:border-r
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -right-12
                -top-12
                h-40
                w-40
                rounded-full
                bg-emerald-100/50
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-10
                -left-10
                h-32
                w-32
                rounded-full
                bg-cyan-100/40
                blur-3xl
              "
            />

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="
                  relative
                  z-10
                  max-h-[185px]
                  max-w-[86%]
                  object-contain
                  drop-shadow-[0_14px_25px_rgba(15,23,42,0.08)]
                  transition-transform
                  duration-500
                  sm:max-h-[270px]
                  md:max-h-[370px]
                "
              />
            ) : (
              <div
                className="
                  relative
                  z-10
                  flex
                  h-32
                  w-32
                  items-center
                  justify-center
                  rounded-[28px]
                  border
                  border-slate-200
                  bg-white
                  text-4xl
                  font-black
                  text-slate-300
                  shadow-[0_14px_35px_rgba(15,23,42,0.08)]
                  sm:h-44
                  sm:w-44
                  sm:text-5xl
                  md:h-56
                  md:w-56
                "
              >
                {storeInitial}
              </div>
            )}

            {discount && (
              <div
                className="
                  absolute
                  bottom-5
                  left-5
                  z-20
                  rounded-full
                  bg-emerald-500
                  px-3
                  py-1.5
                  text-[10px]
                  font-black
                  tracking-wide
                  text-white
                  shadow-[0_8px_20px_rgba(16,185,129,0.24)]
                  sm:bottom-6
                  sm:left-6
                  sm:text-xs
                "
              >
                {discount}
              </div>
            )}
          </div>

          {/* =================================================
              DEAL INFORMATION
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              flex-col
              p-5
              sm:p-7
              md:p-9
            "
          >
            {/* STORE */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
                pr-10
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_3px_12px_rgba(15,23,42,0.06)]
                "
              >
                {storeLogo && !logoFailed ? (
                  <img
                    src={storeLogo}
                    alt={storeName || "Store"}
                    className="
                      h-full
                      w-full
                      object-contain
                      p-1.5
                    "
                    onError={() => {
                      setLogoFailed(true);
                    }}
                  />
                ) : (
                  <span className="text-sm font-black text-slate-500">
                    {storeInitial}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div
                  className="
                    truncate
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  {storeName || "Featured Store"}
                </div>

                <div
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1.5
                    text-[11px]
                    font-semibold
                    text-emerald-600
                  "
                >
                  <span
                    className="
                      flex
                      h-4
                      w-4
                      items-center
                      justify-center
                      rounded-full
                      bg-emerald-100
                      text-[9px]
                      font-black
                    "
                  >
                    ✓
                  </span>
                  Verified Deal
                </div>
              </div>
            </div>

            {/* TITLE */}

            <h2
              className="
                mt-5
                line-clamp-3
                text-[22px]
                font-black
                leading-[1.18]
                tracking-[-0.025em]
                text-slate-950
                sm:text-[26px]
                md:text-[30px]
              "
            >
              {title || "Special Deal"}
            </h2>

            {/* PRICE */}

            {(salePrice || originalPrice) && (
              <div
                className="
                  mt-5
                  flex
                  min-w-0
                  items-end
                  gap-3
                  sm:mt-6
                "
              >
                {salePrice && (
                  <span
                    className="
                      truncate
                      text-[28px]
                      font-black
                      leading-none
                      tracking-[-0.035em]
                      text-slate-950
                      sm:text-[34px]
                    "
                  >
                    {salePrice}
                  </span>
                )}

                {originalPrice && (
                  <span
                    className="
                      shrink-0
                      pb-0.5
                      text-sm
                      font-medium
                      text-slate-400
                      line-through
                      sm:text-base
                    "
                  >
                    {originalPrice}
                  </span>
                )}
              </div>
            )}

            {/* HIDDEN CODE */}

            <div className="mt-6 sm:mt-7">
              <div
                className="
                  flex
                  min-h-[62px]
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-300
                  bg-slate-50
                  px-4
                  py-4
                  shadow-inner
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-slate-300
                  "
                >
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
              </div>
            </div>

            {/* CTA */}

            <button
              type="button"
              onClick={handleCopyAndOpen}
              disabled={processing}
              className="
                mt-4
                flex
                min-h-[58px]
                w-full
                items-center
                justify-center
                rounded-2xl
                bg-orange-500
                px-5
                py-3
                text-center
                text-xs
                font-black
                tracking-[0.04em]
                text-white
                shadow-[0_10px_24px_rgba(249,115,22,0.22)]
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:bg-orange-600
                hover:shadow-[0_14px_30px_rgba(249,115,22,0.28)]
                active:translate-y-0
                active:scale-[0.99]
                disabled:cursor-wait
                disabled:opacity-70
                sm:mt-5
                sm:text-sm
              "
            >
              {processing
                ? "OPENING DEAL..."
                : code
                  ? `COPY CODE & OPEN ${storeName || "DEAL"}`
                  : `GET DEAL FROM ${storeName || "STORE"}`}
            </button>

            {/* NOTE */}

            <p
              className="
                mt-2.5
                text-center
                text-[10px]
                font-medium
                leading-4
                text-slate-400
                sm:mt-3
                sm:text-[11px]
                sm:leading-5
              "
            >
              {code
                ? "Your coupon code will be copied automatically before the deal opens."
                : "You'll be redirected to the store to claim this deal."}
            </p>

            {/* TRUST */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-center
                gap-2
                border-t
                border-slate-100
                pt-4
                text-[10px]
                font-semibold
                text-slate-400
                sm:mt-6
                sm:pt-5
                sm:text-[11px]
              "
            >
              <span className="text-emerald-500">✓</span>

              <span>Verified offer on DealPilot</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div
          className="
            border-t
            border-slate-100
            bg-slate-50/60
            px-5
            py-3.5
            text-center
            sm:px-6
            sm:py-4
          "
        >
          <span
            className="
              text-[10px]
              font-semibold
              text-slate-400
              sm:text-[11px]
            "
          >
            Find more deals and coupons on DealPilot
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
