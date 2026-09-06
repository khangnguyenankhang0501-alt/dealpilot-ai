"use client";

import { useState } from "react";
import CouponRevealModal from "./CouponRevealModal";

interface CouponLinkButtonProps {
  couponSlug?: string | null;
  couponCode?: string | null;
  affiliateUrl?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  discount?: string | null;
  salePrice?: string | null;
  originalPrice?: string | null;
  storeName?: string | null;
}

export default function CouponLinkButton({
  couponCode,
  affiliateUrl,
  title,
  imageUrl,
  discount,
  salePrice,
  originalPrice,
  storeName,
}: CouponLinkButtonProps) {
  const [open, setOpen] = useState(false);

  const hasCode = Boolean(couponCode);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          relative
          flex
          h-8
          w-full
          overflow-hidden
          rounded-full
          bg-emerald-500
          text-white
          shadow-sm
          transition-all
          duration-200
          hover:bg-emerald-600
          hover:shadow-md
          sm:h-9
        "
      >
        <span className="flex flex-1 items-center justify-center text-[10px] font-extrabold tracking-wide sm:text-[11px]">
          {hasCode ? "Reveal Code" : "Get Deal"}
        </span>

        <span
          className="
            flex
            h-full
            w-10
            items-center
            justify-center
            border-l
            border-dashed
            border-white/50
            bg-black/10
            text-[8px]
            font-black
            tracking-wider
            sm:w-11
            sm:text-[9px]
          "
        >
          {hasCode ? "CODE" : "→"}
        </span>
      </button>

      <CouponRevealModal
        open={open}
        code={couponCode || ""}
        title={title || "Special Deal"}
        affiliateUrl={affiliateUrl || ""}
        imageUrl={imageUrl}
        discount={discount}
        salePrice={salePrice}
        originalPrice={originalPrice}
        storeName={storeName}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
