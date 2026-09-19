import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section
          className="
            w-full
            max-w-xl
            rounded-[28px]
            border
            border-slate-200
            bg-white
            px-6
            py-12
            text-center
            shadow-[0_12px_40px_rgba(15,23,42,0.06)]
            sm:px-10
            sm:py-14
          "
        >
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-emerald-50
              text-2xl
              font-black
              text-emerald-600
            "
          >
            404
          </div>

          <div className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
            DealPilot
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Page not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            The page you are looking for does not exist or may have been moved.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="
                inline-flex
                min-w-[140px]
                items-center
                justify-center
                rounded-xl
                bg-slate-950
                px-5
                py-3
                text-sm
                font-black
                text-white
                transition
                hover:bg-slate-800
              "
            >
              Back home
            </Link>

            <Link
              href="/deals"
              className="
                inline-flex
                min-w-[140px]
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-slate-800
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
              "
            >
              Browse deals
            </Link>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
              <Link
                href="/stores"
                className="transition-colors hover:text-slate-700"
              >
                Stores
              </Link>

              <Link
                href="/coupons"
                className="transition-colors hover:text-slate-700"
              >
                Coupons
              </Link>

              <Link
                href="/categories"
                className="transition-colors hover:text-slate-700"
              >
                Categories
              </Link>

              <Link
                href="/saved"
                className="transition-colors hover:text-slate-700"
              >
                Saved
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
