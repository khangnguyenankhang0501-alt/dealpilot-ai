"use client";

import { useState } from "react";

interface GetCodeButtonProps {
  couponId: string;
  couponCode: string | null;
  affiliateUrl: string | null;
}

export default function GetCodeButton({
  couponId,
  couponCode,
  affiliateUrl,
}: GetCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetCode = async () => {
    if (loading) return;

    setLoading(true);

    /*
     * Mở tab affiliate NGAY LẬP TỨC trong
     * hành động click của người dùng.
     *
     * Không dùng window.location.href.
     * Tab hiện tại sẽ không bị chuyển trang.
     */
    if (affiliateUrl) {
      const link = document.createElement("a");

      link.href = affiliateUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    /*
     * Tracking click
     */
    try {
      await fetch(`/api/coupon-click/${couponId}`, {
        method: "POST",
      });
    } catch {
      /*
       * Tracking lỗi không được chặn
       * người dùng sử dụng coupon.
       */
    }

    /*
     * Copy coupon code
     */
    if (couponCode) {
      try {
        await navigator.clipboard.writeText(couponCode);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } catch {
        /*
         * Clipboard lỗi không chặn affiliate.
         */
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGetCode}
        disabled={loading}
        className="w-full rounded-xl bg-green-600 px-6 py-4 text-base font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "OPENING..."
          : copied
            ? "✓ CODE COPIED"
            : couponCode
              ? "GET CODE"
              : "GET DEAL"}
      </button>

      {copied && couponCode && (
        <div className="mt-3 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-700">
          Coupon code copied:
          <span className="ml-1 font-bold">{couponCode}</span>
        </div>
      )}
    </div>
  );
}
