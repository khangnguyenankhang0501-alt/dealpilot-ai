import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";

interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export default async function StoresPage() {
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url")
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Stores fetch error:", error);
  }

  const stores = (data || []) as Store[];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* HEADER */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
            DealPilot
          </div>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Stores
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Browse stores and discover available coupons and deals.
          </p>
        </div>

        {/* STORE GRID */}
        {stores.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {stores.map((store) => {
              const initial = store.name.trim().charAt(0).toUpperCase() || "S";

              return (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  className="
                    group
                    flex
                    min-h-[170px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-6
                    text-center
                    shadow-[0_6px_24px_rgba(15,23,42,0.04)]
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:border-emerald-200
                    hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]
                  "
                >
                  {/* LOGO */}
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-100
                      bg-white
                      shadow-sm
                    "
                  >
                    {store.logo_url ? (
                      <Image
                        src={store.logo_url}
                        alt={store.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-xl font-black text-slate-400">
                        {initial}
                      </span>
                    )}
                  </div>

                  {/* NAME */}
                  <div className="mt-4 line-clamp-2 text-sm font-black text-slate-900 transition-colors group-hover:text-emerald-600">
                    {store.name}
                  </div>

                  <div className="mt-1 text-xs font-semibold text-slate-400">
                    View deals →
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <section
            className="
              flex
              min-h-[320px]
              items-center
              justify-center
              rounded-[24px]
              border
              border-slate-200
              bg-white
              px-6
              py-14
              text-center
            "
          >
            <div className="max-w-md">
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-2xl
                "
              >
                🏪
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-950">
                No stores available
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Stores will appear here once they are available in DealPilot.
              </p>

              <Link
                href="/deals"
                className="
                  mt-5
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-white
                  transition
                  hover:bg-emerald-600
                "
              >
                Browse deals
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
