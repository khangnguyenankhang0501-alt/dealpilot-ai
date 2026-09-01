"use client";

import SearchBox from "@/components/SearchBox";

export default function Hero() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-5xl font-bold text-slate-900">
        Find the Best Coupons & Deals
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
        Discover verified coupon codes, promo codes, and great deals from your
        favorite stores.
      </p>

      <div className="mx-auto mt-8 max-w-2xl">
        <SearchBox />
      </div>
    </section>
  );
}
