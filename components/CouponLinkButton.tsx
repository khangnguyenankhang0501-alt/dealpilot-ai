interface CouponLinkButtonProps {
  couponSlug?: string | null;
  couponCode?: string | null;
}

export default function CouponLinkButton({
  couponSlug,
}: CouponLinkButtonProps) {
  const href = couponSlug ? `/coupons/${couponSlug}` : "/deals";

  return (
    <a
      href={href}
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
      <span className="whitespace-nowrap">Get Deal</span>

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
    </a>
  );
}
