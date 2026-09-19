"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-10 sm:py-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-bold text-red-500">
              !
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              DealPilot
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Something went wrong
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              DealPilot encountered an unexpected error. Please try again.
            </p>

            <button
              type="button"
              onClick={() => reset()}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
