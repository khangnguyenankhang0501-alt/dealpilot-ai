export default function CategoriesLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* HEADER */}
        <div>
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />

          <div className="mt-3 h-9 w-60 animate-pulse rounded-xl bg-slate-200 sm:h-10 sm:w-72" />

          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
        </div>

        {/* CATEGORY GRID */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
            >
              <div className="h-32 animate-pulse bg-slate-200 sm:h-36" />

              <div className="p-4 sm:p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

                <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-200" />

                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-200" />

                <div className="mt-5 h-9 w-full animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>

        {/* BROWSE ALL CTA */}
        <div className="mt-8 flex justify-center">
          <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
