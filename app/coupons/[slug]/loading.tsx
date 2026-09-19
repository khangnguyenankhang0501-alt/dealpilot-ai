export default function CouponDetailLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* BREADCRUMB */}
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />

        {/* MAIN DEAL */}
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* IMAGE */}
            <div className="min-h-[340px] animate-pulse bg-slate-200 sm:min-h-[440px] lg:min-h-[520px]" />

            {/* DETAILS */}
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />

                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

                <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-slate-200" />
              </div>

              <div className="mt-6 h-4 w-24 animate-pulse rounded bg-slate-200" />

              <div className="mt-3 h-9 w-full max-w-xl animate-pulse rounded-xl bg-slate-200" />

              <div className="mt-2 h-9 w-4/5 animate-pulse rounded-xl bg-slate-200" />

              <div className="mt-6 flex items-end gap-3">
                <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
              </div>

              <div className="mt-5 flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
              </div>

              {/* COUPON ACTION */}
              <div className="mt-7 rounded-2xl bg-emerald-50 p-4 sm:p-5">
                <div className="h-4 w-28 animate-pulse rounded bg-emerald-100" />

                <div className="mt-3 h-12 w-full animate-pulse rounded-xl bg-white" />

                <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-emerald-100" />
              </div>

              <div className="mt-5 h-4 w-48 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* SIMILAR DEALS */}
        <section className="mt-10">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[345px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="h-[175px] animate-pulse bg-slate-200" />

                <div className="p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-7 w-24 animate-pulse rounded-lg bg-slate-200" />

                  <div className="mt-5 flex items-center gap-2">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
