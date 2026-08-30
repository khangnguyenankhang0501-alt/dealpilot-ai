import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import GetDealButton from "@/components/GetDealButton";

export const metadata: Metadata = {
  title: "Over 50% Off Deals | DealPilot",
  description: "Discover amazing deals with 50% off or more.",
};

export const revalidate = 0;

export default async function DealsPage() {
  const { data: deals } = await supabase.from("coupons").select("*");

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">Over 50% Off</h1>

      <p className="text-gray-600 mb-10 text-lg">
        Discover amazing deals with 50% off or more.
      </p>

      {!deals || deals.length === 0 ? (
        <p className="text-gray-500">
          There are currently no deals over 50% off.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold mb-1 text-gray-900">
                  {deal.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{deal.store_name}</p>
              </div>

              <GetDealButton coupon={deal} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
