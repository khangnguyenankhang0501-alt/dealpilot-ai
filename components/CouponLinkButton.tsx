"use client";

import { useState } from "react";

interface CouponLinkButtonProps {
  couponSlug?: string | null;
  couponCode?: string | null;
}

export default function CouponLinkButton({
  couponSlug,
  couponCode,
}: CouponLinkButtonProps) {
  const [clicked, setClicked] = useState(false);

  const detailUrl = couponSlug ? `/coupons/${couponSlug}` : "/deals";

  const handleClick = async () => {
    // copy coupon code
    if (couponCode) {
      try {
        await navigator.clipboard.writeText(couponCode);
      } catch (error) {
        console.error("Copy failed", error);
      }
    }

    setClicked(true);

    // sau 5 giây chuyển sang trang chi tiết
    setTimeout(() => {
      window.location.href = detailUrl;
    }, 5000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        group
        flex
        h-10
        w-full
        min-w-[108px]
        items-center
        justify-center
        gap-1.5
        rounded-xl
        bg-emerald-500
        px-3
        text-[11px]
        font-extrabold
        tracking-tight
        text-white
        shadow-[0_6px_16px_rgba(16,185,129,0.20)]
        transition-all
        duration-200
        ease-out
        hover:-translate-y-0.5
        hover:bg-emerald-600
        hover:shadow-[0_10px_22px_rgba(16,185,129,0.28)]
        active:translate-y-0
        active:scale-[0.98]
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-500/30
        focus:ring-offset-2
        sm:min-w-[112px]
        sm:px-3.5
        sm:text-xs
      "
      aria-label="Get this deal"
    >
      {clicked ? (
        <span className="whitespace-nowrap">Copy and use code on Amazon</span>
      ) : (
        <>
          <span className="whitespace-nowrap">Get Code</span>

          <span
            aria-hidden="true"
            className="
              text-sm
              leading-none
              transition-transform
              duration-200
              ease-out
              group-hover:translate-x-0.5
            "
          >
            →
          </span>
        </>
      )}
    </button>
  );
}
