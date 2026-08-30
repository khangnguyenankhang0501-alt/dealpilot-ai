import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function FeaturedCoupons() {
  const { data: popularCoupons } = await supabase
    .from("coupons")
    .select("*")
    .order("clicks", { ascending: false })
    .limit(6);

  if (!popularCoupons || popularCoupons.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Popular Coupons</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <Link href={`/coupons/${coupon?.slug || "#"}`}>
                <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition">
                  {coupon?.title || "No Title"}
                </h3>
              </Link>

              {coupon?.store_name && (
                <p className="text-gray-500 mb-3">
                  <Link
                    href={`/stores/${coupon.store_name.toLowerCase()}`}
                    className="text-blue-600 hover:underline"
                  >
                    {coupon.store_name}
                  </Link>
                </p>
              )}

              {coupon?.coupon_code && (
                <div className="mt-3 bg-green-100 text-green-700 font-bold px-3 py-1 rounded inline-block">
                  {coupon.coupon_code}
                </div>
              )}

              <p className="text-sm text-gray-500 mt-3">
                Expires: {coupon?.expires_at || "N/A"}
              </p>
            </div>

            <div className="mt-4">
              <Link
                href={`/coupons/${coupon?.slug || "#"}`}
                className="block bg-black text-white text-center py-2 rounded-lg hover:bg-gray-800 transition"
              >
                View Coupon
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
