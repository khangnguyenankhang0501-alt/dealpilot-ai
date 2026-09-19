function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

function CouponCardSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-[20px]
        border
        border-slate-200
        bg-white
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
      "
    >
      {/* IMAGE */}

      <div className="relative h-[165px] w-full bg-slate-100 sm:h-[175px]">
        <Skeleton className="absolute inset-0 m-auto h-24 w-24 rounded-2xl" />

        <Skeleton className="absolute left-3 top-3 h-6 w-16 rounded-full" />

        <Skeleton className="absolute right-3 top-3 h-8 w-8 rounded-full" />
      </div>

      {/* CONTENT */}

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>

        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-[82%] rounded-md" />

        <div className="flex items-end gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-3 w-14 rounded-md" />
        </div>

        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function CouponsLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Skeleton className="h-3 w-24 rounded-md" />

            <Skeleton className="mt-3 h-9 w-64 rounded-lg sm:w-80" />

            <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
          </div>

          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        {/* FILTER BAR */}

        <div className="mt-7 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1.4fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)]">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>

        {/* RESULTS META */}

        <div className="mt-6 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        {/* COUPON GRID */}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <CouponCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
