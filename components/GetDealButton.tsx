"use client";

import Link from "next/link";

interface CouponProps {
  id: string | number;
  slug?: string;
  store_name?: string;
  affiliate_url?: string;
  coupon_code?: string;
}

export default function GetDealButton({ coupon }: { coupon: CouponProps }) {
  // Ưu tiên link Affiliate -> Link chi tiết Coupon -> Link Store
  const targetUrl =
    coupon.affiliate_url ||
    (coupon.slug
      ? `/coupons/${coupon.slug}`
      : `/stores/${coupon.store_name?.toLowerCase().replace(/\s+/g, "-")}`);

  const isExternal = !!coupon.affiliate_url;

  return (
    <Link
      href={targetUrl}
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="block w-full bg-black text-white text-center py-3 rounded-xl hover:bg-gray-800 transition font-medium"
    >
      {coupon.coupon_code ? "Get Code" : "Get Deal"}
    </Link>
  );
}
