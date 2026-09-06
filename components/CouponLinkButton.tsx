"use client";

import { useState } from "react";
import CouponRevealModal from "./CouponRevealModal";

interface CouponLinkButtonProps {
  couponSlug?: string | null;
  couponCode?: string | null;
  affiliateUrl?: string | null;
  imageUrl?: string | null;
  discount?: string | null;
  salePrice?: string | null;
  originalPrice?: string | null;
  storeName?: string | null;
  storeLogo?: string | null;
  title?: string | null;
}

export default function CouponLinkButton({
  couponCode,
  affiliateUrl,
  imageUrl,
  discount,
  salePrice,
  originalPrice,
  storeName,
  storeLogo,
  title,
}: CouponLinkButtonProps) {
  const [open, setOpen] = useState(false);

  const hasCode = Boolean(couponCode);

  const handleClick = () => {
    setOpen(true);
  };

  const storeLabel = storeName || "STORE";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          hasCode
            ? `Show coupon code for ${storeName || "this store"}`
            : `Get deal from ${storeName || "this store"}`
        }
        className="
          group
          relative
          flex
          h-[52px]
          w-full
          overflow-hidden
          rounded-xl
          bg-emerald-500
          text-white
          shadow-[0_7px_20px_rgba(16,185,129,0.2)]
          transition-all
          duration-200
          hover:-translate-y-[1px]
          hover:bg-emerald-600
          hover:shadow-[0_11px_26px_rgba(16,185,129,0.25)]
          active:translate-y-0
          active:scale-[0.99]
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-emerald-500
          focus-visible:ring-offset-2
        "
      >
        {/* =====================================================
            MAIN CTA
        ===================================================== */}

        <span
          className="
            relative
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            gap-2
            px-3
            text-[11px]
            font-black
            tracking-[0.06em]
            sm:text-xs
          "
        >
          {hasCode ? (
            <>
              <span
                className="
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/15
                  bg-white/15
                  text-[10px]
                  font-black
                  transition-transform
                  duration-200
                  group-hover:scale-110
                "
              >
                %
              </span>

              <span className="truncate">SHOW CODE</span>
            </>
          ) : (
            <>
              <span className="truncate">GET DEAL</span>

              <span
                className="
                  shrink-0
                  text-base
                  leading-none
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </>
          )}
        </span>

        {/* =====================================================
            RIGHT TAB
        ===================================================== */}

        <span
          className="
            relative
            flex
            h-full
            w-[60px]
            shrink-0
            items-center
            justify-center
            border-l
            border-dashed
            border-white/35
            bg-black/10
            px-1
            text-[8px]
            font-black
            tracking-[0.09em]
            transition-colors
            duration-200
            group-hover:bg-black/15
            sm:w-[68px]
            sm:text-[9px]
            sm:tracking-[0.1em]
          "
        >
          {hasCode ? "CODE" : "DEAL"}
        </span>

        {/* =====================================================
            SHINE
        ===================================================== */}

        <span
          className="
            pointer-events-none
            absolute
            inset-y-[-35%]
            -left-24
            w-16
            rotate-12
            bg-white/10
            blur-sm
            transition-all
            duration-700
            group-hover:left-[120%]
          "
        />
      </button>

      {/* =======================================================
          REVEAL MODAL
      ======================================================= */}

      <CouponRevealModal
        open={open}
        code={couponCode || ""}
        title={title || "Special Deal"}
        affiliateUrl={affiliateUrl || ""}
        imageUrl={imageUrl || ""}
        discount={discount || ""}
        salePrice={salePrice || ""}
        originalPrice={originalPrice || ""}
        storeName={storeName || "Store"}
        storeLogo={storeLogo || ""}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
