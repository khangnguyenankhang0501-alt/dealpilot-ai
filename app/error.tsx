"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="mx-auto flex w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="w-full rounded-[24px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-10 sm:py-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">
            !
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            DealPilot
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Something went wrong
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            We couldn&apos;t load this page right now. Please try again, or
            continue browsing DealPilot.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Try again
            </button>

            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to home
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/stores" className="transition hover:text-slate-900">
              Stores
            </Link>

            <Link href="/coupons" className="transition hover:text-slate-900">
              Coupons
            </Link>

            <Link href="/deals" className="transition hover:text-slate-900">
              Deals
            </Link>

            <Link
              href="/categories"
              className="transition hover:text-slate-900"
            >
              Categories
            </Link>

            <Link href="/saved" className="transition hover:text-slate-900">
              Saved
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
