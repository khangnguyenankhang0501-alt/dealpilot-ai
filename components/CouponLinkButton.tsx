import Link from "next/link";

interface CouponLinkButtonProps {
  couponSlug: string | null;
  couponCode: string | null;
}

export default function CouponLinkButton({
  couponSlug,
  couponCode,
}: CouponLinkButtonProps) {
  if (!couponSlug) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-gray-400 px-4 py-2.5 text-sm font-bold text-white"
      >
        {couponCode ? "GET CODE" : "GET DEAL"}
      </button>
    );
  }

  return (
    <Link
      href={`/coupons/${couponSlug}`}
      className="flex w-full items-center justify-center whitespace-nowrap rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
    >
      {couponCode ? "GET CODE" : "GET DEAL"}
    </Link>
  );
}
