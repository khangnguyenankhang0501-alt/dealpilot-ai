export default function StoresLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* HEADER */}
        <div>
          <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />

          <div className="mt-3 h-9 w-56 animate-pulse rounded-xl bg-slate-200 sm:h-10 sm:w-64" />

          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
        </div>

        {/* STORE GRID */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-200" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />

                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                </div>
              </div>

              <div className="mt-5 h-8 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
