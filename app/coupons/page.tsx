import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function CouponPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!coupon) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <h1>Coupon not found</h1>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link
        href={`/stores/${coupon.store_name.toLowerCase()}`}
        className="text-blue-600"
      >
        ← Back to Store
      </Link>

      <h1 className="text-4xl font-bold mt-4 mb-4">{coupon.title}</h1>

      <p className="text-gray-600 mb-6">Store: {coupon.store_name}</p>

      <div className="bg-green-100 text-green-700 font-bold px-4 py-3 rounded-lg inline-block">
        {coupon.coupon_code}
      </div>

      <div className="mt-6">
        <a
          href={coupon.affiliate_url}
          target="_blank"
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Get Deal
        </a>
      </div>
    </main>
  );
}
