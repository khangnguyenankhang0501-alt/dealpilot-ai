import Link from "next/link";
import { supabase } from "@/lib/supabaseClientClientClient";

export const revalidate = 0;

export default async function TrendingDeals() {
  // Lấy các deal hot nhất dựa trên lượt click
  let { data: deals } = await supabase
    .from("coupons")
    .select("*")
    .order("clicks", { ascending: false })
    .limit(3);

  if (!deals || deals.length === 0) {
    const { data: fallback } = await supabase
      .from("coupons")
      .select("*")
      .limit(3);
    deals = fallback;
  }

  if (!deals || deals.length === 0) return null;

  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        ⚡ Trending Deals
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="border border-red-100 bg-red-50/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                Trending
              </span>
              <h3 className="text-lg font-bold mt-3 mb-1 text-gray-900">
                {deal.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{deal.store_name}</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">
                🔥 {deal.clicks || 0} active users
              </span>
              <Link
                href={`/coupons/${deal.slug}`}
                className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Get Deal
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
