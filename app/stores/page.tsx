import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export const metadata = {
  title: "Top Stores & Brands | DealPilot",
  description:
    "Browse popular stores and brands with the latest coupons, promo codes, and deals on DealPilot.",
};

export default async function StoresPage() {
  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Error fetching stores:", error);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-xl
              shadow-sm
              sm:h-11
              sm:w-11
            "
          >
            🏪
          </div>

          <div className="min-w-0">
            <h1
              className="
                text-2xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-3xl
                lg:text-4xl
              "
            >
              Top Stores
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Discover coupons and deals from your favorite stores.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!stores || stores.length === 0 ? (
        <section
          className="
            flex
            min-h-[220px]
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-6
            py-12
            text-center
            shadow-sm
          "
        >
          <div>
            <div className="text-4xl">🏪</div>

            <h2 className="mt-3 text-lg font-bold text-slate-900">
              No stores available
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please check back later for more stores and brands.
            </p>
          </div>
        </section>
      ) : (
        /* =====================================================
           STORE GRID
        ===================================================== */

        <section
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            sm:gap-4
            lg:grid-cols-4
            lg:gap-5
          "
        >
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="
                group
                flex
                min-h-[150px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-5
                text-center
                shadow-[0_6px_24px_rgba(15,23,42,0.04)]
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-emerald-300
                hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                sm:min-h-[170px]
                sm:px-5
              "
            >
              {/* STORE LOGO */}

              <div
                className="
                  relative
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  shadow-sm
                  transition-transform
                  duration-200
                  group-hover:scale-105
                  sm:h-20
                  sm:w-20
                "
              >
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name || "Store"}
                    fill
                    sizes="80px"
                    className="object-contain p-2.5"
                  />
                ) : (
                  <span
                    className="
                      text-2xl
                      font-black
                      text-slate-400
                      sm:text-3xl
                    "
                  >
                    {store.name?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                )}
              </div>

              {/* STORE NAME */}

              <h2
                className="
                  mt-3
                  w-full
                  truncate
                  text-sm
                  font-extrabold
                  text-slate-900
                  transition-colors
                  group-hover:text-emerald-600
                  sm:text-base
                "
              >
                {store.name}
              </h2>

              {/* VIEW LINK */}

              <span
                className="
                  mt-1
                  text-[11px]
                  font-semibold
                  text-slate-400
                  transition-colors
                  group-hover:text-emerald-500
                  sm:text-xs
                "
              >
                View coupons →
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
