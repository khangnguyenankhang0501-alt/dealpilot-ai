import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";
import { Coupon } from "@/types/coupon";

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

function isActiveCoupon(coupon: Coupon) {
  const status = String(coupon.status || "").toLowerCase();

  if (status && status !== "active") {
    return false;
  }

  if (coupon.expires_at) {
    const expiresAt = new Date(coupon.expires_at).getTime();

    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      return false;
    }
  }

  return true;
}

async function getStore(slug: string) {
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Store fetch error:", error);
    return null;
  }

  return data as Store | null;
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { slug } = await params;

  const store = await getStore(decodeURIComponent(slug));

  if (!store) {
    return {
      title: "Store Not Found | DealPilot",
      description: "The requested store could not be found on DealPilot.",
    };
  }

  return {
    title: `${store.name} Coupons & Deals | DealPilot`,
    description: `Find the latest ${store.name} coupons, promo codes, discounts, and deals on DealPilot.`,
    alternates: {
      canonical: `/stores/${store.slug}`,
    },
    openGraph: {
      title: `${store.name} Coupons & Deals | DealPilot`,
      description: `Find the latest ${store.name} coupons, promo codes, discounts, and deals on DealPilot.`,
      type: "website",
      ...(store.logo_url
        ? {
            images: [
              {
                url: store.logo_url,
                alt: store.name,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  const store = await getStore(decodeURIComponent(slug));

  if (!store) {
    notFound();
  }

  const { data: couponData, error: couponError } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (couponError) {
    console.error("Store coupons fetch error:", couponError);
  }

  const coupons = ((couponData || []) as Coupon[]).filter(isActiveCoupon);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <Link href="/" className="transition-colors hover:text-slate-900">
            Home
          </Link>

          <span className="text-slate-300">/</span>

          <Link
            href="/stores"
            className="transition-colors hover:text-slate-900"
          >
            Stores
          </Link>

          <span className="text-slate-300">/</span>

          <span className="text-slate-900">{store.name}</span>
        </nav>

        {/* STORE HEADER */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
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
                  sm:h-20
                  sm:w-20
                "
              >
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain p-2.5"
                  />
                ) : (
                  <span className="text-2xl font-black text-slate-400">
                    {store.name.trim().charAt(0).toUpperCase() || "S"}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                  Store
                </div>

                <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {store.name}
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {coupons.length}{" "}
                  {coupons.length === 1 ? "active deal" : "active deals"}
                </p>
              </div>
            </div>

            <Link
              href="/coupons"
              className="
                inline-flex
                w-fit
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-slate-800
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              Browse all coupons
            </Link>
          </div>
        </section>

        {/* DEALS */}
        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Latest offers
              </div>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                Deals from {store.name}
              </h2>
            </div>

            <span className="hidden text-sm font-semibold text-slate-400 sm:block">
              Updated from DealPilot
            </span>
          </div>

          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {coupons.map((coupon) => (
                <CouponCard key={String(coupon.id)} coupon={coupon} />
              ))}
            </div>
          ) : (
            <section
              className="
                flex
                min-h-[300px]
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
                  🏷️
                </div>

                <h2 className="mt-4 text-xl font-black text-slate-950">
                  No active deals right now
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  There are currently no active coupons available for this
                  store.
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
        </section>
      </div>
    </main>
  );
}
