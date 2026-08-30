import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export const revalidate = 0;

export default async function TrendingPage() {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Trending Coupons & Deals</h1>
      <p className="text-gray-600 mb-8">
        Discover the latest coupon codes and hot deals updated daily.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons?.map((coupon) => (
          <div
            key={coupon.id}
            className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between bg-white"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {coupon.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{coupon.store_name}</p>

              <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-semibold mb-4">
                {coupon.code || "N/A"}
              </div>
            </div>

            <Link
              href={`/coupons/${coupon.slug}`}
              className="w-full text-center bg-black text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors block mt-2"
            >
              Get Code
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
