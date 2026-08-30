import Link from "next/link";
import { supabase } from "@/lib/supabaseClientClient";

export default async function TrendingCoupons() {
  const { data: coupons } = await supabase.from("coupons").select("*").limit(6);

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8">Trending Coupons</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {coupons?.map((coupon) => (
          <Link
            key={coupon.id}
            href={`/coupons/${coupon.slug}`}
            className="border rounded-xl p-6"
          >
            <h3 className="font-bold">{coupon.title}</h3>

            <p className="text-green-600 mt-2">{coupon.discount}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
