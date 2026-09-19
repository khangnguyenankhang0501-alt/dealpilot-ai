export default function CategoryLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* BREADCRUMB */}
        <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />

        {/* CATEGORY HEADER */}
        <section className="mt-6">
          <div className="h-9 w-64 max-w-full animate-pulse rounded-xl bg-slate-200 sm:h-10" />

          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
        </section>

        {/* DEALS HEADER */}
        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-56 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="hidden h-10 w-28 animate-pulse rounded-xl bg-slate-200 sm:block" />
        </div>

        {/* DEAL GRID */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[345px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
            >
              {/* IMAGE */}
              <div className="h-[175px] animate-pulse bg-slate-200" />

              {/* CONTENT */}
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

                <div className="mt-5 h-3 w-32 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
