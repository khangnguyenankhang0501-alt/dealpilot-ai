"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CouponsError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Coupons page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-10">
          {/* ICON */}

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
            ⚠️
          </div>

          {/* LABEL */}

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            DealPilot coupons
          </p>

          {/* TITLE */}

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            We couldn't load the coupons
          </h1>

          {/* DESCRIPTION */}

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Something went wrong while loading the coupon list. You can retry
            the page or continue browsing other parts of DealPilot.
          </p>

          {/* ACTIONS */}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                bg-emerald-500
                px-5
                text-[11px]
                font-black
                uppercase
                tracking-wide
                text-white
                shadow-[0_8px_20px_rgba(16,185,129,0.18)]
                transition
                hover:bg-emerald-600
              "
            >
              Try again
            </button>

            <Link
              href="/deals"
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                text-[11px]
                font-black
                uppercase
                tracking-wide
                text-slate-700
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
              "
            >
              Browse deals
            </Link>

            <Link
              href="/"
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                text-[11px]
                font-black
                uppercase
                tracking-wide
                text-slate-500
                transition
                hover:border-slate-300
                hover:text-slate-700
              "
            >
              Back home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
