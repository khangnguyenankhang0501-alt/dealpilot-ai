import { supabase } from "@/lib/supabaseClientClientClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q || "";

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .ilike("title", `%${q}%`);

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Search: {q}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {coupons?.map((coupon) => (
          <div key={coupon.id} className="border rounded-xl p-5">
            <h2 className="font-bold">{coupon.title}</h2>

            <p>{coupon.store_name}</p>

            <a href={`/coupon/${coupon.slug}`} className="text-blue-600">
              View Deal
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
